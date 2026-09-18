"""TRIP QUEST backend — FastAPI entrypoint.

Run locally:
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env      # fill in keys when ready (optional for first run)
    uvicorn app.main:app --reload

Interactive API docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import missions, trips, users

settings = get_settings()

app = FastAPI(
    title="TRIP QUEST API",
    version="0.1.0",
    description="Multiplayer travel game — AI-generated missions between START and ARRIVED.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(trips.router)
app.include_router(missions.router)


@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "env": settings.app_env,
        "supabase": settings.supabase_enabled,   # False => using in-memory store
        "ai": settings.ai_enabled,               # False => using fallback missions
        "places": settings.places_enabled,       # False => no real-place discovery
    }
