from fastapi import APIRouter, Depends, HTTPException

from app import store
from app.deps import get_current_user
from app.models import (JoinIn, LeaderboardEntry, MissionOut, TripCreate,
                        TripOut)
from app.services.ai import generate_missions
from app.services.timers import is_expired

router = APIRouter(prefix="/trips", tags=["trips"])


def _trip_out(trip: dict) -> dict:
    return {**trip, "members": store.get_members(trip["id"])}


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
    mission_dicts = generate_missions(trip, players)
    saved = store.save_missions(trip_id, mission_dicts)
    store.set_trip_status(trip_id, "active")
    return saved


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
