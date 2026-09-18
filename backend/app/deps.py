"""Shared FastAPI dependencies.

MVP auth: the client sends `X-User-Id` (obtained from POST /auth/anon).
This keeps the demo frictionless. TODO for later: verify a Supabase JWT
from the `Authorization: Bearer` header instead.
"""
from fastapi import Header, HTTPException, status

from app import store


def get_current_user(x_user_id: str | None = Header(default=None)) -> dict:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header. Call POST /auth/anon first.",
        )
    user = store.get_user(x_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Unknown user.")
    return user
