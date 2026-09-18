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

# Simple dict "tables"
users: dict[str, dict] = {}
trips: dict[str, dict] = {}
members: dict[str, list[dict]] = {}          # trip_id -> [member dict]
missions: dict[str, dict] = {}               # mission_id -> mission
completions: dict[str, dict] = {}            # completion_id -> completion
businesses: dict[str, dict] = {}             # business_id -> business


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _id() -> str:
    return str(uuid.uuid4())


def _join_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ---- Users ----
def create_user(display_name: str) -> dict:
    uid = _id()
    users[uid] = {
        "id": uid,
        "display_name": display_name or "Player",
        "avatar_url": None,
        "preferences": {"interests": [], "diet": None, "adventure_level": None,
                        "budget": None, "free_text": None},
    }
    return users[uid]


def get_user(user_id: str) -> dict | None:
    return users.get(user_id)


def set_preferences(user_id: str, prefs: dict) -> dict:
    users[user_id]["preferences"] = prefs
    return users[user_id]


# ---- Trips ----
def create_trip(created_by: str, data: dict) -> dict:
    tid = _id()
    trip = {
        "id": tid,
        "name": data["name"],
        "origin": data.get("origin"),
        "destination": data.get("destination"),
        "vibe": data.get("vibe"),
        "status": "draft",
        "join_code": _join_code(),
        "created_by": created_by,
        "ends_at": data.get("ends_at"),
    }
    trips[tid] = trip
    members[tid] = []
    _add_member(tid, created_by, role="host")
    return trip


def _add_member(trip_id: str, user_id: str, role: str) -> dict:
    user = users[user_id]
    member = {"user_id": user_id, "display_name": user["display_name"],
              "role": role, "total_points": 0}
    members[trip_id].append(member)
    return member


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


def add_points(trip_id: str, user_id: str, points: int) -> None:
    for m in members.get(trip_id, []):
        if m["user_id"] == user_id:
            m["total_points"] += points


def leaderboard(trip_id: str) -> list[dict]:
    ms = sorted(get_members(trip_id), key=lambda m: m["total_points"], reverse=True)
    return [{"user_id": m["user_id"], "display_name": m["display_name"],
             "total_points": m["total_points"]} for m in ms]
