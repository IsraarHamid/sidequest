"""Pydantic request/response schemas — these are the API contract.

Keep these in sync with DATABASE.md. Frontend and backend both code to these.
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

MissionType = Literal["solo", "group", "secret"]
Rarity = Literal["common", "rare", "legendary"]
TripStatus = Literal["draft", "active", "arrived", "ended"]


# ---- Users / preferences ----
class Preferences(BaseModel):
    interests: list[str] = Field(default_factory=list)
    diet: Optional[str] = None
    adventure_level: Optional[str] = None
    budget: Optional[str] = None
    free_text: Optional[str] = None


class UserOut(BaseModel):
    id: str
    display_name: str
    email: Optional[str] = None
    is_admin: bool = False
    auth_provider: str = "anonymous"
    avatar_url: Optional[str] = None
    avatar_color: Optional[str] = None
    initials: Optional[str] = None
    preferences: Preferences = Field(default_factory=Preferences)


class AnonIn(BaseModel):
    display_name: str = "Player"


class LoginIn(BaseModel):
    email: str
    password: str


class RegisterIn(BaseModel):
    display_name: str
    email: str
    password: str


class UpdateProfileIn(BaseModel):
    display_name: str


# ---- Trips ----
QuestType = Literal["solo", "together"]


class TripCreate(BaseModel):
    name: str
    origin: Optional[str] = None        # start destination (journey planning)
    destination: Optional[str] = None   # end destination (journey planning)
    vibe: Optional[str] = None
    quest_type: Optional[QuestType] = None  # solo = mostly per-player, together = group
    start_date: Optional[str] = None    # e.g. "2026-10-12" (display + planning)
    end_date: Optional[str] = None
    ends_at: Optional[datetime] = None  # optional overall trip countdown


class MemberOut(BaseModel):
    user_id: str
    display_name: str
    role: Literal["host", "player"]
    total_points: int = 0
    avatar_color: Optional[str] = None
    initials: Optional[str] = None


class TripOut(BaseModel):
    id: str
    name: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    vibe: Optional[str] = None
    quest_type: Optional[QuestType] = None
    status: TripStatus
    join_code: str
    created_by: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    ends_at: Optional[datetime] = None  # optional overall trip countdown
    cover_photo_url: Optional[str] = None  # first mission photo by any member
    members: list[MemberOut] = Field(default_factory=list)


class JoinIn(BaseModel):
    join_code: str


# ---- Missions ----
class MissionOut(BaseModel):
    id: str
    trip_id: str
    assignee_user_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    type: MissionType
    rarity: Rarity
    points: int
    is_secret: bool = False
    status: Literal["open", "completed"] = "open"
    business_id: Optional[str] = None
    business_name: Optional[str] = None    # real place name (Gemini Maps grounding)
    expires_at: Optional[datetime] = None  # optional per-mission timer (null = no limit)
    is_expired: bool = False               # computed convenience for the client
    generated_by: Literal["ai", "fallback"] = "ai"


class CompleteIn(BaseModel):
    photo_url: Optional[str] = None


class RankingIn(BaseModel):
    category: str    # e.g. funniest | best_photo | most_creative


class CompletionOut(BaseModel):
    id: str
    mission_id: str
    user_id: str
    photo_url: Optional[str] = None
    completed_at: datetime
    is_first: bool
    points_awarded: int


# ---- Leaderboard ----
class LeaderboardEntry(BaseModel):
    user_id: str
    display_name: str
    total_points: int
