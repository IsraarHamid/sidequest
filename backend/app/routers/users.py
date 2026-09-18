from fastapi import APIRouter, Depends

from app import store
from app.deps import get_current_user
from app.models import AnonIn, Preferences, UserOut

router = APIRouter(tags=["users"])


@router.post("/auth/anon", response_model=UserOut)
def create_anon_user(body: AnonIn):
    """Frictionless sign-in for the demo. Returns a user; use its id as X-User-Id."""
    user = store.create_user(body.display_name)
    return user


@router.get("/users/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    return current


@router.put("/users/me/preferences", response_model=UserOut)
def set_preferences(prefs: Preferences, current=Depends(get_current_user)):
    return store.set_preferences(current["id"], prefs.model_dump())
