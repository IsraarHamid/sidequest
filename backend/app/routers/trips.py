from fastapi import APIRouter, Depends, HTTPException

from app import store
from app.deps import get_current_user
from app.models import (JoinIn, LeaderboardEntry, MissionOut, TripCreate,
                        TripOut)
from app.services.ai import (generate_missions, generate_trip_plan,
                             plan_checkpoints)
from app.services.timers import is_expired

router = APIRouter(prefix="/trips", tags=["trips"])


def _trip_out(trip: dict) -> dict:
    return {**trip, "members": store.get_members(trip["id"])}


def _players(trip_id: str) -> list[dict]:
    """Members with their saved preferences, in the shape the mission engine takes."""
    return [
        {"id": m["user_id"], "name": m["display_name"],
         "preferences": (store.get_user(m["user_id"]) or {}).get("preferences", {})}
        for m in store.get_members(trip_id)
    ]


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
    """Set trip active and generate the mission deck for all members.

    Runs mission_generator.md once: the rich plan is saved on the trip (GET
    /plan), its checkpoints become business rows, and the flattened missions are
    what this returns. No AI key / AI failure -> fallback deck, no plan.
    """
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    players = _players(trip_id)
    plan = generate_trip_plan(trip, players)

    name_to_business_id: dict[str, str] = {}
    if plan:
        store.save_plan(trip_id, plan)
        name_to_business_id = store.save_businesses(plan_checkpoints(plan))

    mission_dicts = generate_missions(trip, players, plan=plan)

    # Link each mission to the business row for its checkpoint
    for m in mission_dicts:
        bn = m.get("business_name")
        if bn and bn in name_to_business_id:
            m["business_id"] = name_to_business_id[bn]

    saved = store.save_missions(trip_id, mission_dicts)
    store.set_trip_status(trip_id, "active")
    return saved


@router.post("/{trip_id}/plan")
def plan_trip(trip_id: str, current=Depends(get_current_user)):
    """Rich, route-aware plan via mission_generator.md + the LLM, without the
    flat mission deck. Legs, per-member checkpoints (coords + map links), shared
    checkpoints, scoring, summary. 503 if no AI provider is configured/working.
    """
    trip = store.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    plan = generate_trip_plan(trip, _players(trip_id))
    if not plan:
        raise HTTPException(
            status_code=503,
            detail="Mission planner unavailable (set REPLICATE_API_KEY or "
                   "GEMINI_API_KEY / check quota).",
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
