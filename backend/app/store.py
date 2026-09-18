"""Store dispatcher.

Routers import `from app import store` and call store.* — this module picks the
backend at import time:
- Supabase (persistent) when SUPABASE_URL + service key are configured,
- in-memory (resets on restart) otherwise.

Both backends expose the same function names, so nothing else changes.
"""
from app.config import get_settings

if get_settings().supabase_enabled:
    from app.store_supabase import *  # noqa: F401,F403
    from app.store_supabase import _seed  # noqa: F401
else:
    from app.store_memory import *  # noqa: F401,F403
    from app.store_memory import _seed  # noqa: F401

_seed()
