"""Mission timer helpers.

Missions may optionally carry an `expires_at`. A mission with no `expires_at`
never expires. Keep all expiry logic here so routers stay consistent.
"""
from datetime import datetime, timezone


def is_expired(mission: dict) -> bool:
    expires_at = mission.get("expires_at")
    if not expires_at:
        return False
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > expires_at
