"""User image storage via Supabase Storage.

Mission photos (per user, per trip, per mission) live in one bucket with paths
`{user_id}/{trip_id}/{mission_id}/{uuid}.{ext}` — organised on a user level.
We store the resulting URL on the mission_completion, so a user's uploads double
as their history (query completions by user).

The bucket is created on first use (idempotent). Public bucket → stable URLs and
a seamless demo; paths use unguessable UUIDs. Swap to a private bucket + signed
URLs + RLS for production.
"""
import uuid

from app.config import get_settings
from app.db import get_supabase
from app.services.images import compress_image

_EXT = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
        "image/webp": "webp", "image/heic": "heic", "image/gif": "gif"}

_bucket_ready = False


def storage_enabled() -> bool:
    return get_settings().supabase_enabled


def _ensure_bucket(sb, bucket: str) -> None:
    global _bucket_ready
    if _bucket_ready:
        return
    try:
        sb.storage.create_bucket(bucket, options={"public": True})
    except Exception as exc:  # noqa: BLE001 - already exists is fine
        if "exist" not in str(exc).lower() and "duplicate" not in str(exc).lower():
            print(f"[storage] create_bucket note: {exc}")
    _bucket_ready = True


def upload_mission_photo(user_id: str, trip_id: str, mission_id: str,
                         data: bytes, content_type: str | None) -> dict:
    """Upload a photo and return {path, url}. Raises if storage unavailable."""
    sb = get_supabase()
    if sb is None:
        raise RuntimeError("Storage requires Supabase configuration")
    bucket = get_settings().storage_bucket
    _ensure_bucket(sb, bucket)

    # Compress before storing (keeps us well under the 50 MB/file + 1 GB limits).
    data, comp_ext, comp_ct = compress_image(data, content_type)
    content_type = comp_ct or content_type
    ext = comp_ext or _EXT.get((content_type or "").lower(), "jpg")

    path = f"{user_id}/{trip_id}/{mission_id}/{uuid.uuid4().hex}.{ext}"
    sb.storage.from_(bucket).upload(
        path, data,
        {"content-type": content_type or "image/jpeg", "upsert": "true"},
    )
    public = sb.storage.from_(bucket).get_public_url(path)
    return {"path": path, "url": public, "bytes": len(data)}


def upload_avatar(user_id: str, data: bytes, content_type: str | None) -> dict:
    """Upload a profile photo and return {path, url}."""
    sb = get_supabase()
    if sb is None:
        raise RuntimeError("Storage requires Supabase configuration")
    bucket = get_settings().storage_bucket
    _ensure_bucket(sb, bucket)

    data, comp_ext, comp_ct = compress_image(data, content_type)
    content_type = comp_ct or content_type
    ext = comp_ext or _EXT.get((content_type or "").lower(), "jpg")

    path = f"{user_id}/avatar/{uuid.uuid4().hex}.{ext}"
    sb.storage.from_(bucket).upload(
        path, data,
        {"content-type": content_type or "image/jpeg", "upsert": "true"},
    )
    public = sb.storage.from_(bucket).get_public_url(path)
    return {"path": path, "url": public, "bytes": len(data)}
