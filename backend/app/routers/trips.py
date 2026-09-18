from fastapi import APIRouter, Depends, HTTPException

from app import store
from app.deps import get_current_user
from app.models import (JoinIn, LeaderboardEntry, MissionOut, TripCreate,
                        TripOut)
from app.services.ai import generate_missions
from app.services.mission_planner import generate_plan
from app.services.places import fetch_places_along_route
from app.services.timers import is_expired

router = APIRouter(prefix="/trips", tags=["trips"])


def _trip_out(trip: dict) -> dict:
    return {**trip, "members": store.get_members(trip["id"])}


@router.get("", response_model=list[TripOut])
def my_trips(current=Depends(get_current_user)):
    """All trips the current user belongs to (for the dashboard)."""
    return store.list_trips_for_user(current["id"])


@router.post("", response_model=TripOut)
def create_trip(body: TripCreate, current=Depends(get_current_user)):
    trip = store.create_trip(current["id"], body.model_dump())
    return _trip_out(trip)


@router.post("/join", response_model=TripOut)
def join_trip(body: JoinIn, current=Depends(get_current_user)):
    trip = store.join_trip(body.join_code.upper(), current["id"])
    if not trip:
        raise HTTPException(status_code=404, detail="Invalid join code")
    return _trip_out(trip)


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: str, current=Depends(get_current_user)):
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _trip_out(trip)


@router.post("/{trip_id}/start", response_model=list[MissionOut])
def start_trip(trip_id: str, current=Depends(get_current_user)):
    """Set trip active and generate the AI mission deck for all members."""
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    players = [
        {"id": m["user_id"], "name": m["display_name"],
         "preferences": (store.get_user(m["user_id"]) or {}).get("preferences", {})}
        for m in store.get_members(trip_id)
    ]

    # Discover real places along the route (Gemini Maps grounding; [] if disabled)
    interests = sorted({
        i for p in players for i in (p["preferences"].get("interests") or [])
    })
    places = fetch_places_along_route(
        origin=trip.get("origin"), destination=trip.get("destination"),
        vibe=trip.get("vibe"), interests=interests,
    )
    name_to_business_id = store.save_businesses(places)

    mission_dicts = generate_missions(trip, players, places=places)

    # Link missions tagged with a real place to its business record
    for m in mission_dicts:
        bn = m.get("business_name")
        if bn and bn in name_to_business_id:
            m["business_id"] = name_to_business_id[bn]

    saved = store.save_missions(trip_id, mission_dicts)
    store.set_trip_status(trip_id, "active")
    return saved


@router.post("/{trip_id}/plan")
def plan_trip(trip_id: str, current=Depends(get_current_user)):
    """Rich, route-aware plan via mission_generator.md + the LLM.

    Returns legs, per-member checkpoints (each with a Google Maps link), shared
    checkpoints, scoring, and a summary. Needs GEMINI_API_KEY; 503 if unavailable.
    """
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    members = []
    for m in store.get_members(trip_id):
        prefs = (store.get_user(m["user_id"]) or {}).get("preferences", {})
        constraints = [prefs["diet"]] if prefs.get("diet") else []
        if prefs.get("adventure_level"):
            constraints.append(prefs["adventure_level"])
        members.append({
            "name": m["display_name"],
            "preferences": prefs.get("interests") or [],
            "dislikes": [],
            "constraints": constraints,
            "budget_per_person": prefs.get("budget"),
        })

    plan = generate_plan(trip, members)
    if not plan:
        raise HTTPException(
            status_code=503,
            detail="Mission planner unavailable (set GEMINI_API_KEY / check quota).",
        )
    store.save_plan(trip_id, plan)
    store.set_trip_status(trip_id, "active")
    return plan


@router.get("/{trip_id}/plan")
def get_plan(trip_id: str, current=Depends(get_current_user)):
    """Fetch a previously generated plan (404 if none yet)."""
    plan = store.get_plan(trip_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No plan generated yet")
    return plan


@router.post("/{trip_id}/arrive", response_model=TripOut)
def arrive(trip_id: str, current=Depends(get_current_user)):
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    store.set_trip_status(trip_id, "arrived")
    return _trip_out(store.get_trip(trip_id))


@router.get("/{trip_id}/missions", response_model=list[MissionOut])
def list_missions(trip_id: str, current=Depends(get_current_user)):
    """Return missions visible to the current user (others' secrets hidden)."""
    all_missions = store.get_missions_for_trip(trip_id)
    visible = [
        m for m in all_missions
        if not m["is_secret"] or m["assignee_user_id"] == current["id"]
    ]
    # Annotate computed expiry so the client can render timed-out missions.
    return [{**m, "is_expired": is_expired(m)} for m in visible]


@router.get("/{trip_id}/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(trip_id: str, current=Depends(get_current_user)):
    """Poll this every 3-5s from the client (see BACKEND.md decision log)."""
    return store.leaderboard(trip_id)
