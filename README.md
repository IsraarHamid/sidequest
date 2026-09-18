# SideQuest

Every journey generates a temporary multiplayer game. Players get AI-generated
missions along the route, complete them, earn points and badges, and rank each
other — the product exists entirely between **START → ARRIVED**.

BuildersTable Hackathon 2026 · Theme: Travel (the journey, not the destination)

## Repo layout

| Path | What |
|---|---|
| `backend/` | FastAPI API (missions, trips, plan) + LLM integration |
| `frontend/` | Next.js app (Paper Chaos design) |
| `design/` | Design system + assets |
| [`BACKEND.md`](BACKEND.md) | Backend architecture, contracts, decisions |
| [`DATABASE.md`](DATABASE.md) | DB schema + ER diagram (kept up to date per change) |
| [`INTEGRATION.md`](INTEGRATION.md) | How frontend + backend fit together |
| [`DEPLOY.md`](DEPLOY.md) | Run locally + free live-link hosting, step by step |
| `backend/mission_generator.md` | The rich mission-generation prompt |
| [`supabase/schema.sql`](supabase/schema.sql) | Runnable Postgres schema (paste into Supabase SQL Editor) |

## Database schema

Full details + SQL in [`DATABASE.md`](DATABASE.md); runnable file at
[`supabase/schema.sql`](supabase/schema.sql). Legend: 🟢 MVP · 🔵 later · 🟣 roadmap.

```mermaid
erDiagram
    users ||--o| user_preferences : has
    users ||--o{ trip_members : joins
    users ||--o{ trips : creates
    trips ||--o{ trip_members : contains
    trips ||--o{ missions : has
    trips ||--o{ feed_posts : has
    users ||--o{ missions : "assigned (nullable)"
    missions ||--o{ mission_completions : "completed via"
    users ||--o{ mission_completions : completes
    mission_completions ||--o{ rankings : "rated by"
    users ||--o{ rankings : casts
    businesses ||--o{ missions : "tagged in"
    businesses ||--o{ feed_posts : "tagged in"
    badges ||--o{ user_badges : awarded
    users ||--o{ user_badges : earns
    trips ||--o{ user_badges : "earned during"
    mission_completions ||--o| feed_posts : "shared as"
    competitions ||--o{ competition_trips : includes
    trips ||--o{ competition_trips : "competes in"
    battle_passes ||--o{ user_passes : "sold as"
    users ||--o{ user_passes : buys

    users {
        uuid id PK
        text email UK
        text display_name
        text password_hash
        enum auth_provider
        text google_id UK
        bool is_admin
        text avatar_color
        text initials
        timestamptz created_at
    }
    user_preferences {
        uuid user_id PK
        text_arr interests
        text diet
        text adventure_level
        text budget
        text free_text
    }
    trips {
        uuid id PK
        text name
        text origin
        text destination
        text vibe
        enum status
        text join_code UK
        uuid created_by FK
        date start_date
        date end_date
        timestamptz ends_at
        jsonb plan
        timestamptz created_at
    }
    trip_members {
        uuid id PK
        uuid trip_id FK
        uuid user_id FK
        enum role
        int total_points
        timestamptz joined_at
    }
    missions {
        uuid id PK
        uuid trip_id FK
        uuid assignee_user_id FK "null = group"
        text title
        text description
        enum type
        enum rarity
        int points
        bool is_secret
        enum status
        uuid business_id FK
        text business_name
        timestamptz expires_at
        text generated_by
    }
    mission_completions {
        uuid id PK
        uuid mission_id FK
        uuid user_id FK
        text photo_url
        bool is_first
        int points_awarded
        timestamptz completed_at
    }
    rankings {
        uuid id PK
        uuid completion_id FK
        uuid voter_user_id FK
        text category
        int score
    }
    badges {
        uuid id PK
        text code UK
        text name
        text icon
    }
    user_badges {
        uuid id PK
        uuid user_id FK
        uuid badge_id FK
        uuid trip_id FK
        timestamptz earned_at
    }
    businesses {
        uuid id PK
        text name
        text location
        text category
        bool is_promoted
        numeric rating
        float lat
        float lng
    }
    feed_posts {
        uuid id PK
        uuid completion_id FK
        uuid trip_id FK
        uuid business_id FK
        text caption
    }
    competitions {
        uuid id PK
        text name
        text destination
        timestamptz starts_at
        timestamptz ends_at
    }
    competition_trips {
        uuid competition_id PK
        uuid trip_id PK
        int score
    }
    battle_passes {
        uuid id PK
        text name
        int price_cents
        jsonb perks
        bool active
    }
    user_passes {
        uuid id PK
        uuid user_id FK
        uuid pass_id FK
        timestamptz expires_at
    }
```

## Quickstart (local)

**Backend** (terminal 1):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add GEMINI_API_KEY etc. (optional — runs on fallbacks)
uvicorn app.main:app --reload    # http://localhost:8000  (/docs, /health)
```

**Frontend** (terminal 2):
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                      # http://localhost:3000 (or 3001 if 3000 is busy)
```

**Or everything in Docker:**
```bash
docker compose up --build        # frontend :3000, backend :8000
```

It runs with **zero keys** (in-memory store + fallback missions). Add
`GEMINI_API_KEY` for real place discovery + the rich mission plan. `/health` shows
what's active.

## Deploying a live link

See [`DEPLOY.md`](DEPLOY.md) — free options (Render recommended; Fly.io / Cloud
Run / Vercel) with step-by-step guides and secret-safety notes.

## Demo prep

Seed a realistic, populated demo (trip + crew + completed missions with photos +
points + badges) so the boards look alive on stage:
```bash
cd backend && source .venv/bin/activate
python scripts/seed_demo.py     # backend must be running; uses ADMIN_* + Supabase
```
Then sign in as the admin to see the "Garden Route Crew" trip fully populated.

**Missions** come from Claude if `ANTHROPIC_API_KEY` is set, else **Gemini**, else a
destination-aware fallback deck (so a live demo always has legitimate-looking
missions even if the LLM is rate-limited).

## Notes

- **Persistence:** **Supabase** when `SUPABASE_URL` + service key are set (the
  backend auto-selects it; schema in `supabase/schema.sql`); falls back to an
  in-memory store otherwise. User mission photos use **Supabase Storage**.
- **Secrets:** backend-only, via env vars; never committed or baked into images.
  Admin override is seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` into the DB.
