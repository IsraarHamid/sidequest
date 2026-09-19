"""In-memory dev/demo store.

This lets the whole core loop run WITHOUT Supabase so the team (and the
frontend) can move immediately. It mirrors the schema in DATABASE.md.

>>> When Supabase is wired up, replace these functions with Supabase queries.
>>> The router layer only calls this module, so swapping is localised here.

NOTE: in-memory = state resets on server restart, and it's single-process only.
Fine for the demo; not for production.
"""
import random
import string
import uuid
from datetime import datetime, timezone

from app.badges import BADGE_BY_CODE, earned_codes
from app.config import get_settings
from app.security import hash_password

# Simple dict "tables"
users: dict[str, dict] = {}
trips: dict[str, dict] = {}
members: dict[str, list[dict]] = {}          # trip_id -> [member dict]
missions: dict[str, dict] = {}               # mission_id -> mission
completions: dict[str, dict] = {}            # completion_id -> completion
businesses: dict[str, dict] = {}             # business_id -> business
rankings: list[dict] = []                    # {completion_id, voter_user_id, category}
user_badges: dict[str, set] = {}             # user_id -> {badge_code, ...}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _id() -> str:
    return str(uuid.uuid4())


# Numeric-only join codes so mobile users get a numpad. 5 digits, leading
# zeros allowed (kept as a string) — e.g. "04829".
_CODE_ALPHABET = "0123456789"
_CODE_LENGTH = 5


def _join_code() -> str:
    return "".join(random.choices(_CODE_ALPHABET, k=_CODE_LENGTH))


_AVATAR_COLORS = ["#E85A1C", "#3E6B4A", "#E87FA8", "#7FB8E0", "#C8901A", "#D0392F"]


def _initials(name: str) -> str:
    parts = [p for p in (name or "").split() if p]
    if not parts:
        return "SQ"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _avatar_color(seed: str) -> str:
    return _AVATAR_COLORS[hash(seed) % len(_AVATAR_COLORS)]


def _new_user(display_name: str, *, email=None, password=None,
              auth_provider="anonymous", google_id=None, is_admin=False) -> dict:
    uid = _id()
    users[uid] = {
        "id": uid,
        "display_name": display_name or "Player",
        "email": email,
        "password_hash": hash_password(password) if password else None,
        "auth_provider": auth_provider,        # anonymous | email | google
        "google_id": google_id,
        "is_admin": is_admin,
        "avatar_url": None,
        "avatar_color": _avatar_color(uid),
        "initials": _initials(display_name),
        "created_at": _now(),
        "preferences": {"interests": [], "diet": None, "adventure_level": None,
                        "budget": None, "free_text": None},
    }
    return users[uid]


# ---- Users ----
def create_user(display_name: str) -> dict:
    """Anonymous user (frictionless demo sign-in)."""
    return _new_user(display_name)


def create_email_user(display_name: str, email: str, password: str,
                      is_admin: bool = False) -> dict:
    return _new_user(display_name, email=email, password=password,
                     auth_provider="email", is_admin=is_admin)


def get_user(user_id: str) -> dict | None:
    return users.get(user_id)


def get_user_by_email(email: str) -> dict | None:
    email = (email or "").strip().lower()
    return next((u for u in users.values()
                 if (u.get("email") or "").lower() == email), None)


def set_preferences(user_id: str, prefs: dict) -> dict:
    users[user_id]["preferences"] = prefs
    return users[user_id]


def update_user(user_id: str, *, display_name: str | None = None,
                avatar_url: str | None = None) -> dict:
    user = users[user_id]
    if display_name is not None:
        user["display_name"] = display_name
        user["initials"] = _initials(display_name)
    if avatar_url is not None:
        user["avatar_url"] = avatar_url
    return user


def delete_user(user_id: str) -> None:
    users.pop(user_id, None)


# ---- Trips ----
def create_trip(created_by: str, data: dict) -> dict:
    tid = _id()
    trip = {
        "id": tid,
        "name": data["name"],
        "origin": data.get("origin"),
        "destination": data.get("destination"),
        "vibe": data.get("vibe"),
        "quest_type": data.get("quest_type"),
        "status": "draft",
        "join_code": _join_code(),
        "created_by": created_by,
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "ends_at": data.get("ends_at"),
    }
    trips[tid] = trip
    members[tid] = []
    _add_member(tid, created_by, role="host")
    return trip


def _add_member(trip_id: str, user_id: str, role: str) -> dict:
    user = users[user_id]
    member = {"user_id": user_id, "display_name": user["display_name"],
              "role": role, "total_points": 0,
              "avatar_color": user.get("avatar_color"),
              "initials": user.get("initials")}
    members[trip_id].append(member)
    return member


def _trip_cover(trip_id: str) -> str | None:
    """Most recent mission photo for this trip, by any member."""
    mids = {m["id"] for m in missions.values() if m["trip_id"] == trip_id}
    photos = [c for c in completions.values()
              if c["mission_id"] in mids and c.get("photo_url")]
    photos.sort(key=lambda c: str(c["completed_at"]), reverse=True)
    return photos[0]["photo_url"] if photos else None


def list_trips_for_user(user_id: str) -> list[dict]:
    """Trips where this user is a member (host or player)."""
    out = []
    for tid, ms in members.items():
        if any(m["user_id"] == user_id for m in ms):
            trip = trips.get(tid)
            if trip:
                out.append({**trip, "members": ms, "cover_photo_url": _trip_cover(tid)})
    return out


def join_trip(join_code: str, user_id: str) -> dict | None:
    trip = next((t for t in trips.values() if t["join_code"] == join_code), None)
    if not trip:
        return None
    if not any(m["user_id"] == user_id for m in members[trip["id"]]):
        _add_member(trip["id"], user_id, role="player")
    return trip


def get_trip(trip_id: str) -> dict | None:
    return trips.get(trip_id)


def get_members(trip_id: str) -> list[dict]:
    return members.get(trip_id, [])


def set_trip_status(trip_id: str, status: str) -> dict:
    trips[trip_id]["status"] = status
    return trips[trip_id]


# ---- Businesses (real places from Gemini Maps grounding) ----
def save_businesses(places: list[dict]) -> dict[str, str]:
    """Create business rows from discovered places. Returns {name: business_id}."""
    name_to_id: dict[str, str] = {}
    for p in places:
        bid = _id()
        businesses[bid] = {
            "id": bid,
            "name": p["name"],
            "location": p.get("address"),
            "category": p.get("category"),
            "tags": [],
            "is_promoted": False,
            "rating": p.get("rating"),
            "lat": p.get("lat"),
            "lng": p.get("lng"),
        }
        name_to_id[p["name"]] = bid
    return name_to_id


def get_business(business_id: str) -> dict | None:
    return businesses.get(business_id)


# ---- Rich mission plans (from mission_generator.md via the LLM) ----
def save_plan(trip_id: str, plan: dict) -> dict:
    trips[trip_id]["plan"] = plan
    return plan


def get_plan(trip_id: str) -> dict | None:
    trip = trips.get(trip_id)
    return trip.get("plan") if trip else None


# ---- Missions ----
def save_missions(trip_id: str, mission_dicts: list[dict]) -> list[dict]:
    saved = []
    for m in mission_dicts:
        mid = _id()
        mission = {
            "id": mid,
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
        }
        missions[mid] = mission
        saved.append(mission)
    return saved


def get_missions_for_trip(trip_id: str) -> list[dict]:
    return [m for m in missions.values() if m["trip_id"] == trip_id]


def get_mission(mission_id: str) -> dict | None:
    return missions.get(mission_id)


def has_any_completion(mission_id: str) -> bool:
    return any(c["mission_id"] == mission_id for c in completions.values())


def add_completion(mission_id: str, user_id: str, photo_url: str | None,
                   is_first: bool, points_awarded: int) -> dict:
    cid = _id()
    completion = {
        "id": cid,
        "mission_id": mission_id,
        "user_id": user_id,
        "photo_url": photo_url,
        "completed_at": _now(),
        "is_first": is_first,
        "points_awarded": points_awarded,
    }
    completions[cid] = completion
    missions[mission_id]["status"] = "completed"
    return completion


# ---- Rankings (friends rate each other's completions) ----
def get_completion_for_mission(mission_id: str) -> dict | None:
    return next((c for c in completions.values() if c["mission_id"] == mission_id), None)


def add_ranking(completion_id: str, voter_user_id: str, category: str) -> None:
    if not any(r for r in rankings
               if r["completion_id"] == completion_id
               and r["voter_user_id"] == voter_user_id and r["category"] == category):
        rankings.append({"completion_id": completion_id,
                         "voter_user_id": voter_user_id, "category": category})


def get_rankings_for_mission(mission_id: str) -> list[dict]:
    comp = get_completion_for_mission(mission_id)
    if not comp:
        return []
    counts: dict[str, int] = {}
    for r in rankings:
        if r["completion_id"] == comp["id"]:
            counts[r["category"]] = counts.get(r["category"], 0) + 1
    return [{"category": k, "count": v} for k, v in counts.items()]


# ---- Badges / passport ----
def count_user_completions(user_id: str) -> int:
    return sum(1 for c in completions.values() if c["user_id"] == user_id)


def award_badges(user_id: str, trip_id: str, mission: dict, completion: dict) -> list[str]:
    count = count_user_completions(user_id)
    owned = user_badges.setdefault(user_id, set())
    newly = []
    for code in earned_codes(mission, completion, count):
        if code not in owned:
            owned.add(code)
            newly.append(code)
    return newly


def get_user_badges(user_id: str) -> list[dict]:
    return [BADGE_BY_CODE[c] for c in user_badges.get(user_id, set()) if c in BADGE_BY_CODE]


def list_user_photos(user_id: str) -> list[dict]:
    """A user's uploaded mission photos (history), newest first."""
    out = []
    for c in completions.values():
        if c["user_id"] == user_id and c.get("photo_url"):
            m = missions.get(c["mission_id"], {})
            out.append({
                "mission_id": c["mission_id"],
                "mission_title": m.get("title"),
                "trip_id": m.get("trip_id"),
                "photo_url": c["photo_url"],
                "completed_at": c["completed_at"],
            })
    out.sort(key=lambda x: str(x["completed_at"]), reverse=True)
    return out


def add_points(trip_id: str, user_id: str, points: int) -> None:
    for m in members.get(trip_id, []):
        if m["user_id"] == user_id:
            m["total_points"] += points


def leaderboard(trip_id: str) -> list[dict]:
    ms = sorted(get_members(trip_id), key=lambda m: m["total_points"], reverse=True)
    return [{"user_id": m["user_id"], "display_name": m["display_name"],
             "total_points": m["total_points"]} for m in ms]


# ---- Seed data ----
def _seed() -> None:
    """Seed the admin override from env credentials (no hardcode).
    Set ADMIN_EMAIL / ADMIN_PASSWORD; skipped if unset or already present."""
    s = get_settings()
    if not s.admin_email or not s.admin_password:
        return
    if not get_user_by_email(s.admin_email):
        name = s.admin_email.split("@")[0].replace(".", " ").title()
        create_email_user(display_name=name, email=s.admin_email,
                          password=s.admin_password, is_admin=True)


_seed()
