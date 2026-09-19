"""Supabase-backed store — same function names as store_memory, persistent.

Uses the service-role client (app.db.get_supabase). Returns dicts shaped like the
in-memory store so the Pydantic models serialize identically.
"""
import random
import string
import uuid
from datetime import datetime

from app.badges import BADGE_CATALOG, BADGE_BY_CODE, earned_codes
from app.config import get_settings
from app.db import get_supabase
from app.security import hash_password

_AVATAR_COLORS = ["#E85A1C", "#3E6B4A", "#E87FA8", "#7FB8E0", "#C8901A", "#D0392F"]
_EMPTY_PREFS = {"interests": [], "diet": None, "adventure_level": None,
                "budget": None, "free_text": None}


def _id() -> str:
    return str(uuid.uuid4())


# Numeric-only join codes so mobile users get a numpad. 5 digits, leading
# zeros allowed (kept as a string) — e.g. "04829".
_CODE_ALPHABET = "0123456789"
_CODE_LENGTH = 5


def _join_code() -> str:
    return "".join(random.choices(_CODE_ALPHABET, k=_CODE_LENGTH))


def _is_duplicate_code_error(exc: Exception) -> bool:
    """True if an insert failed because join_code already exists.
    Postgres unique_violation is SQLSTATE 23505."""
    s = str(getattr(exc, "code", "")) + " " + str(exc).lower()
    return "23505" in s or "duplicate key" in s or "join_code" in s


def _initials(name: str) -> str:
    parts = [p for p in (name or "").split() if p]
    if not parts:
        return "SQ"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _avatar_color(seed: str) -> str:
    return _AVATAR_COLORS[hash(seed) % len(_AVATAR_COLORS)]


def _iso(v):
    return v.isoformat() if isinstance(v, datetime) else v


def _clean(payload: dict) -> dict:
    """ISO-encode datetimes so supabase-py can JSON-serialize the row."""
    return {k: _iso(v) for k, v in payload.items()}


def _sb():
    sb = get_supabase()
    if sb is None:
        raise RuntimeError("Supabase client not configured")
    return sb


# ---- Users ----
def _with_prefs(user: dict | None) -> dict | None:
    if not user:
        return None
    resp = _sb().table("user_preferences").select("*").eq("user_id", user["id"]).execute()
    if resp.data:
        p = resp.data[0]
        user["preferences"] = {k: p.get(k) for k in _EMPTY_PREFS}
        user["preferences"]["interests"] = p.get("interests") or []
    else:
        user["preferences"] = dict(_EMPTY_PREFS)
    return user


def _insert_user(display_name, *, email=None, password=None,
                 auth_provider="anonymous", google_id=None, is_admin=False) -> dict:
    uid = _id()
    row = {
        "id": uid,
        "display_name": display_name or "Player",
        "email": (email or None) and email.strip().lower(),
        "password_hash": hash_password(password) if password else None,
        "auth_provider": auth_provider,
        "google_id": google_id,
        "is_admin": is_admin,
        "avatar_color": _avatar_color(uid),
        "initials": _initials(display_name),
    }
    _sb().table("users").insert(row).execute()
    row["preferences"] = dict(_EMPTY_PREFS)
    return row


def create_user(display_name: str) -> dict:
    return _insert_user(display_name)


def create_email_user(display_name: str, email: str, password: str,
                      is_admin: bool = False) -> dict:
    return _insert_user(display_name, email=email, password=password,
                        auth_provider="email", is_admin=is_admin)


def get_user(user_id: str) -> dict | None:
    resp = _sb().table("users").select("*").eq("id", user_id).limit(1).execute()
    return _with_prefs(resp.data[0]) if resp.data else None


def get_user_by_email(email: str) -> dict | None:
    email = (email or "").strip().lower()
    resp = _sb().table("users").select("*").eq("email", email).limit(1).execute()
    return _with_prefs(resp.data[0]) if resp.data else None


def set_preferences(user_id: str, prefs: dict) -> dict:
    row = {"user_id": user_id, **{k: prefs.get(k) for k in _EMPTY_PREFS}}
    row["interests"] = prefs.get("interests") or []
    _sb().table("user_preferences").upsert(row, on_conflict="user_id").execute()
    return get_user(user_id)


def update_user(user_id: str, *, display_name: str | None = None,
                avatar_url: str | None = None) -> dict:
    patch = {}
    if display_name is not None:
        patch["display_name"] = display_name
        patch["initials"] = _initials(display_name)
    if avatar_url is not None:
        patch["avatar_url"] = avatar_url
    if patch:
        _sb().table("users").update(patch).eq("id", user_id).execute()
    return get_user(user_id)


def delete_user(user_id: str) -> None:
    _sb().table("users").delete().eq("id", user_id).execute()


# ---- Trips ----
# quest_type is a newer column; tolerate a DB that hasn't run the migration yet
# (supabase/migrations/0001_trip_quest_type.sql). Checked once and cached.
_HAS_QUEST_TYPE: bool | None = None


def _trips_has_quest_type() -> bool:
    global _HAS_QUEST_TYPE
    if _HAS_QUEST_TYPE is None:
        try:
            _sb().table("trips").select("quest_type").limit(1).execute()
            _HAS_QUEST_TYPE = True
        except Exception:  # noqa: BLE001 - column missing until migration runs
            _HAS_QUEST_TYPE = False
            print("[store] trips.quest_type column missing — run "
                  "supabase/migrations/0001_trip_quest_type.sql to persist quest type")
    return _HAS_QUEST_TYPE


def create_trip(created_by: str, data: dict) -> dict:
    base = _clean({
        "id": _id(),
        "name": data["name"],
        "origin": data.get("origin"),
        "destination": data.get("destination"),
        "vibe": data.get("vibe"),
        "quest_type": data.get("quest_type"),
        "status": "draft",
        "created_by": created_by,
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "ends_at": data.get("ends_at"),
    })
    if not _trips_has_quest_type():
        base.pop("quest_type", None)

    # Race-safe join code: the DB's `join_code unique` constraint is the source
    # of truth. Generate a random code and insert; if another trip grabbed the
    # same code in the meantime, retry with a fresh one.
    last_exc: Exception | None = None
    for _ in range(25):
        row = {**base, "join_code": _join_code()}
        try:
            _sb().table("trips").insert(row).execute()
            _add_member(row["id"], created_by, role="host")
            return row
        except Exception as exc:  # noqa: BLE001
            if _is_duplicate_code_error(exc):
                last_exc = exc
                continue
            raise
    raise RuntimeError("Could not allocate a unique join code") from last_exc


def _add_member(trip_id: str, user_id: str, role: str) -> dict:
    _sb().table("trip_members").insert({
        "id": _id(), "trip_id": trip_id, "user_id": user_id,
        "role": role, "total_points": 0,
    }).execute()
    return {"trip_id": trip_id, "user_id": user_id, "role": role}


def get_members(trip_id: str) -> list[dict]:
    resp = (_sb().table("trip_members")
            .select("user_id, role, total_points, users(display_name, initials, avatar_color)")
            .eq("trip_id", trip_id).execute())
    out = []
    for m in resp.data or []:
        u = m.get("users") or {}
        out.append({
            "user_id": m["user_id"],
            "display_name": u.get("display_name"),
            "role": m["role"],
            "total_points": m.get("total_points", 0),
            "avatar_color": u.get("avatar_color"),
            "initials": u.get("initials"),
        })
    return out


def list_trips_for_user(user_id: str) -> list[dict]:
    mem = _sb().table("trip_members").select("trip_id").eq("user_id", user_id).execute()
    trip_ids = [m["trip_id"] for m in (mem.data or [])]
    if not trip_ids:
        return []
    resp = _sb().table("trips").select("*").in_("id", trip_ids).execute()
    return [{**t, "members": get_members(t["id"])} for t in (resp.data or [])]


def join_trip(join_code: str, user_id: str) -> dict | None:
    resp = _sb().table("trips").select("*").eq("join_code", join_code).limit(1).execute()
    if not resp.data:
        return None
    trip = resp.data[0]
    existing = (_sb().table("trip_members").select("user_id")
                .eq("trip_id", trip["id"]).eq("user_id", user_id).execute())
    if not existing.data:
        _add_member(trip["id"], user_id, role="player")
    return trip


def get_trip(trip_id: str) -> dict | None:
    resp = _sb().table("trips").select("*").eq("id", trip_id).limit(1).execute()
    return resp.data[0] if resp.data else None


def set_trip_status(trip_id: str, status: str) -> dict:
    _sb().table("trips").update({"status": status}).eq("id", trip_id).execute()
    return get_trip(trip_id)


# ---- Businesses ----
def save_businesses(places: list[dict]) -> dict[str, str]:
    name_to_id: dict[str, str] = {}
    rows = []
    for p in places:
        bid = _id()
        rows.append({
            "id": bid, "name": p["name"], "location": p.get("address"),
            "category": p.get("category"), "tags": [], "is_promoted": False,
            "rating": p.get("rating"), "lat": p.get("lat"), "lng": p.get("lng"),
        })
        name_to_id[p["name"]] = bid
    if rows:
        _sb().table("businesses").insert(rows).execute()
    return name_to_id


def get_business(business_id: str) -> dict | None:
    resp = _sb().table("businesses").select("*").eq("id", business_id).limit(1).execute()
    return resp.data[0] if resp.data else None


# ---- Rich mission plans ----
def save_plan(trip_id: str, plan: dict) -> dict:
    _sb().table("trips").update({"plan": plan}).eq("id", trip_id).execute()
    return plan


def get_plan(trip_id: str) -> dict | None:
    resp = _sb().table("trips").select("plan").eq("id", trip_id).limit(1).execute()
    return (resp.data[0].get("plan") if resp.data else None)


# ---- Missions ----
def save_missions(trip_id: str, mission_dicts: list[dict]) -> list[dict]:
    rows = []
    for m in mission_dicts:
        rows.append(_clean({
            "id": _id(),
            "trip_id": trip_id,
            "assignee_user_id": m.get("assignee_user_id"),
            "title": m["title"],
            "description": m.get("description"),
            "type": m.get("type", "solo"),
            "rarity": m.get("rarity", "common"),
            "points": int(m.get("points", 100)),
            "is_secret": bool(m.get("is_secret", False)),
            "status": "open",
            "business_id": m.get("business_id"),
            "business_name": m.get("business_name"),
            "expires_at": m.get("expires_at"),
            "generated_by": m.get("generated_by", "ai"),
        }))
    if not rows:
        return []
    resp = _sb().table("missions").insert(rows).execute()
    return resp.data or rows


def get_missions_for_trip(trip_id: str) -> list[dict]:
    resp = _sb().table("missions").select("*").eq("trip_id", trip_id).execute()
    return resp.data or []


def get_mission(mission_id: str) -> dict | None:
    resp = _sb().table("missions").select("*").eq("id", mission_id).limit(1).execute()
    return resp.data[0] if resp.data else None


def has_any_completion(mission_id: str) -> bool:
    resp = (_sb().table("mission_completions").select("id")
            .eq("mission_id", mission_id).limit(1).execute())
    return bool(resp.data)


def add_completion(mission_id: str, user_id: str, photo_url: str | None,
                   is_first: bool, points_awarded: int) -> dict:
    row = {
        "id": _id(), "mission_id": mission_id, "user_id": user_id,
        "photo_url": photo_url, "is_first": is_first,
        "points_awarded": points_awarded,
    }
    resp = _sb().table("mission_completions").insert(row).execute()
    _sb().table("missions").update({"status": "completed"}).eq("id", mission_id).execute()
    return (resp.data[0] if resp.data else row)


# ---- Rankings ----
def get_completion_for_mission(mission_id: str) -> dict | None:
    resp = (_sb().table("mission_completions").select("*")
            .eq("mission_id", mission_id).limit(1).execute())
    return resp.data[0] if resp.data else None


def add_ranking(completion_id: str, voter_user_id: str, category: str) -> None:
    _sb().table("rankings").upsert(
        {"id": _id(), "completion_id": completion_id,
         "voter_user_id": voter_user_id, "category": category, "score": 1},
        on_conflict="completion_id,voter_user_id,category",
    ).execute()


def get_rankings_for_mission(mission_id: str) -> list[dict]:
    comp = get_completion_for_mission(mission_id)
    if not comp:
        return []
    resp = _sb().table("rankings").select("category").eq("completion_id", comp["id"]).execute()
    counts: dict[str, int] = {}
    for r in resp.data or []:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    return [{"category": k, "count": v} for k, v in counts.items()]


# ---- Badges / passport ----
def count_user_completions(user_id: str) -> int:
    resp = _sb().table("mission_completions").select("id").eq("user_id", user_id).execute()
    return len(resp.data or [])


def _badge_id(code: str) -> str | None:
    resp = _sb().table("badges").select("id").eq("code", code).limit(1).execute()
    return resp.data[0]["id"] if resp.data else None


def award_badges(user_id: str, trip_id: str, mission: dict, completion: dict) -> list[str]:
    count = count_user_completions(user_id)
    owned = {b for b in _owned_codes(user_id)}
    newly = []
    for code in earned_codes(mission, completion, count):
        if code in owned:
            continue
        bid = _badge_id(code)
        if not bid:
            continue
        try:
            _sb().table("user_badges").insert(
                {"id": _id(), "user_id": user_id, "badge_id": bid, "trip_id": trip_id}
            ).execute()
            newly.append(code)
        except Exception:  # noqa: BLE001 - unique violation = already owned
            pass
    return newly


def _owned_codes(user_id: str) -> list[str]:
    resp = (_sb().table("user_badges").select("badges(code)")
            .eq("user_id", user_id).execute())
    return [r["badges"]["code"] for r in (resp.data or []) if r.get("badges")]


def get_user_badges(user_id: str) -> list[dict]:
    codes = set(_owned_codes(user_id))
    return [BADGE_BY_CODE[c] for c in codes if c in BADGE_BY_CODE]


def list_user_photos(user_id: str) -> list[dict]:
    """A user's uploaded mission photos (history), newest first."""
    resp = (_sb().table("mission_completions")
            .select("mission_id, photo_url, completed_at, missions(title, trip_id)")
            .eq("user_id", user_id)
            .not_.is_("photo_url", "null")
            .order("completed_at", desc=True).execute())
    out = []
    for c in resp.data or []:
        m = c.get("missions") or {}
        out.append({
            "mission_id": c["mission_id"],
            "mission_title": m.get("title"),
            "trip_id": m.get("trip_id"),
            "photo_url": c["photo_url"],
            "completed_at": c["completed_at"],
        })
    return out


def add_points(trip_id: str, user_id: str, points: int) -> None:
    resp = (_sb().table("trip_members").select("total_points")
            .eq("trip_id", trip_id).eq("user_id", user_id).limit(1).execute())
    current = resp.data[0]["total_points"] if resp.data else 0
    (_sb().table("trip_members").update({"total_points": current + points})
     .eq("trip_id", trip_id).eq("user_id", user_id).execute())


def leaderboard(trip_id: str) -> list[dict]:
    members = get_members(trip_id)
    members.sort(key=lambda m: m["total_points"], reverse=True)
    return [{"user_id": m["user_id"], "display_name": m["display_name"],
             "total_points": m["total_points"]} for m in members]


# ---- Seed ----
def _seed() -> None:
    """Seed the admin override into the DB from env credentials (no hardcode).
    Set ADMIN_EMAIL / ADMIN_PASSWORD in the environment; skipped if unset or
    the account already exists (the row persists in the database)."""
    s = get_settings()
    if not s.admin_email or not s.admin_password:
        return
    if not get_user_by_email(s.admin_email):
        name = s.admin_email.split("@")[0].replace(".", " ").title()
        create_email_user(display_name=name, email=s.admin_email,
                          password=s.admin_password, is_admin=True)
    _seed_badges()


def _seed_badges() -> None:
    """Ensure the badge catalog exists (idempotent on the unique `code`)."""
    try:
        existing = {b["code"] for b in (_sb().table("badges").select("code").execute().data or [])}
        rows = [{"id": _id(), **b, "description": None}
                for b in BADGE_CATALOG if b["code"] not in existing]
        if rows:
            _sb().table("badges").insert(rows).execute()
    except Exception as exc:  # noqa: BLE001
        print(f"[seed] badge seed note: {exc}")
