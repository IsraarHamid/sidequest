from fastapi import APIRouter, Depends, HTTPException

from app import store
from app.deps import get_current_user
from app.models import CompleteIn, CompletionOut
from app.services.scoring import points_for_completion
from app.services.timers import is_expired

router = APIRouter(prefix="/missions", tags=["missions"])


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
