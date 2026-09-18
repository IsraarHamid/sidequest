from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app import store
from app.deps import get_current_user
from app.models import CompleteIn, CompletionOut
from app.services.scoring import points_for_completion
from app.services.storage import storage_enabled, upload_mission_photo
from app.services.timers import is_expired

router = APIRouter(prefix="/missions", tags=["missions"])


@router.post("/{mission_id}/photo")
async def upload_photo(mission_id: str, file: UploadFile = File(...),
                       current=Depends(get_current_user)):
    """Upload a photo for a mission step -> Supabase Storage, per user.
    Returns {photo_url}; pass it to /complete to attach it to the completion."""
    mission = store.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    if not storage_enabled():
        raise HTTPException(status_code=503, detail="Photo storage needs Supabase configured")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    data = await file.read()
    # Accept large phone photos; we compress before storing. Hard-reject only
    # above 40 MB so even an uncompressible file stays under Supabase's 50 MB cap.
    if len(data) > 40 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 40 MB)")
    try:
        result = upload_mission_photo(
            user_id=current["id"], trip_id=mission["trip_id"],
            mission_id=mission_id, data=data, content_type=file.content_type,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Upload failed: {exc}")
    return {"photo_url": result["url"], "path": result["path"],
            "bytes": result.get("bytes")}


@router.post("/{mission_id}/complete", response_model=CompletionOut)
def complete_mission(mission_id: str, body: CompleteIn,
                     current=Depends(get_current_user)):
    mission = store.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    # Reject completion of a timed-out mission (untimed missions never expire).
    if is_expired(mission):
        raise HTTPException(status_code=409, detail="Mission has expired")

    # First-to-finish check (before recording this completion)
    is_first = not store.has_any_completion(mission_id)
    points = points_for_completion(mission, is_first)

    completion = store.add_completion(
        mission_id=mission_id,
        user_id=current["id"],
        photo_url=body.photo_url,
        is_first=is_first,
        points_awarded=points,
    )
    store.add_points(mission["trip_id"], current["id"], points)
    return {**completion, "points_awarded": points}
