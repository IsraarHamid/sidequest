"""Supabase client accessor.

Lazily creates a service-role Supabase client when configured. If Supabase
isn't configured yet, `get_supabase()` returns None and the app falls back to
the in-memory store (see app/store.py) so the team can build immediately.
"""
from functools import lru_cache

from app.config import get_settings


@lru_cache
def get_supabase():
    settings = get_settings()
    if not settings.supabase_enabled:
        return None
    # Imported lazily so the app boots even if the package isn't installed yet.
    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_service_role_key)
