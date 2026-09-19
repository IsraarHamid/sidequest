from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app import store
from app.deps import get_current_user
from app.models import AnonIn, LoginIn, Preferences, RegisterIn, UpdateProfileIn, UserOut
from app.security import verify_password
from app.services.storage import storage_enabled, upload_avatar

router = APIRouter(tags=["users"])


@router.post("/auth/anon", response_model=UserOut)
def create_anon_user(body: AnonIn):
    """Frictionless sign-in for the demo. Returns a user; use its id as X-User-Id."""
    return store.create_user(body.display_name)


@router.post("/auth/login", response_model=UserOut)
def login(body: LoginIn):
    """Email + password login. Used for the admin override
    (betterbash@gmail.com / betterbash) while Google sign-in is in development."""
    user = store.get_user_by_email(body.email)
    if not user or not user.get("password_hash") or \
            not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password")
    return user


@router.post("/auth/register", response_model=UserOut)
def register(body: RegisterIn):
    """Email + password registration."""
    if store.get_user_by_email(body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="An account with that email already exists")
    return store.create_email_user(body.display_name, body.email, body.password)


@router.post("/auth/google")
def google_sign_in():
    """Google sign-in — IN DEVELOPMENT. Use the admin override (/auth/login) for now."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google sign-in is still in development. Use the admin override login.",
    )


@router.get("/users/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    return current


@router.put("/users/me/preferences", response_model=UserOut)
def set_preferences(prefs: Preferences, current=Depends(get_current_user)):
    return store.set_preferences(current["id"], prefs.model_dump())


@router.patch("/users/me", response_model=UserOut)
def update_profile(body: UpdateProfileIn, current=Depends(get_current_user)):
    return store.update_user(current["id"], display_name=body.display_name)


@router.post("/users/me/avatar", response_model=UserOut)
async def upload_avatar_photo(file: UploadFile = File(...), current=Depends(get_current_user)):
    """Upload a profile photo -> Supabase Storage, sets avatar_url."""
    if not storage_enabled():
        raise HTTPException(status_code=503, detail="Photo storage needs Supabase configured")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    data = await file.read()
    if len(data) > 40 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 40 MB)")
    try:
        result = upload_avatar(user_id=current["id"], data=data, content_type=file.content_type)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Upload failed: {exc}")
    return store.update_user(current["id"], avatar_url=result["url"])


@router.delete("/users/me", status_code=204)
def delete_account(current=Depends(get_current_user)):
    store.delete_user(current["id"])


@router.get("/users/me/photos")
def my_photos(current=Depends(get_current_user)):
    """The current user's uploaded mission photos (history)."""
    return store.list_user_photos(current["id"])


@router.get("/users/me/passport")
def my_passport(current=Depends(get_current_user)):
    """Badges earned + basic stats for the travel passport."""
    return {
        "badges": store.get_user_badges(current["id"]),
        "missions_completed": store.count_user_completions(current["id"]),
    }
