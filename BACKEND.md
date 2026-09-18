# SideQuest — Backend Guide

> **Purpose of this file:** Single source of truth for anyone (human teammate or AI agent) working on the **backend**. It defines *what we're building*, *how the backend is shaped*, and *the contracts everyone codes against*. It is intentionally **stack-flexible** — the concepts (entities, endpoints, AI contract) stay stable even if we swap a specific technology. If you change a decision here, **update this file in the same PR.**

---

## 1. Product in one line

> **Every journey generates a temporary multiplayer game.** Players get AI-generated missions tailored to their preferences, complete them along the way (photo or check-off), earn points and badges, and rank each other's experiences. The destination just ends the game — the product lives entirely between **START → ARRIVED**.

**Theme:** Travel — *the journey, not the destination.*

---

## 2. How it works (product spec)

**Multiplayer core**
- Each user has an **account** and sets **preferences** (interests, diet, adventure level, etc.) → the AI uses these to tailor missions.
- Users create **groups**, one per **trip**.
- The AI compiles **missions per player** + one **overall group mission**.
- Missions are completed by **taking a picture** and/or **marking complete**.
- Players earn **points** and **badges** → a custom **travel passport**.

**Gamification — how points are earned**
- Completing missions successfully.
- **First to finish** a mission among friends gets the most points (friendly competition).
- Friends can **rank each other's missions** (best-tasting food, best photo, funniest experience, etc.).

**Later versions (NOT in MVP — keep the schema open for these)**
- Strangers can discover trips and ask to join as a **"travel player."**
- Different groups heading to the same destination compete for **"Best Travel Group"** (esp. peak season).

**Monetization (context — mostly pitch, not built in MVP)**
- Businesses pay to be **ranked / first preference** in missions.
- **Battle passes**: users buy passes for discounts at partner locations.

**Small-business impact (a core differentiator — design for it)**
- Small businesses are **included in missions** for exposure (level 1).
- Each mission checkpoint **tags the business** in the image (level 2).
- A **"travel feed"** shares users' checkpoint images with businesses tagged (level 3).

---

## 3. Guiding principles for this build

1. **MVP first, schema future-proof.** Build the minimum to demo, but shape the data model so later features (strangers, feed, battle passes) don't require a rewrite.
2. **Stack-flexible.** Every tech choice below is a **current default** with named alternatives. Swapping one should not change our API contracts or data concepts.
3. **AI is the magic.** Mission generation is the highest-value component. Treat its input/output as a strict contract (Section 8).
4. **Fail safe for the demo.** External calls (AI, DB) must degrade gracefully — always have a fallback so a live demo never hard-crashes.
5. **Free tier only.** No paid services for the hackathon.

---

## 4. Tech stack (current defaults + alternatives)

| Concern | **Default (use this)** | Alternatives (swappable) | Notes |
|---|---|---|---|
| Language | **Python 3.11+** | — | Team choice |
| API framework | **FastAPI** | Flask, Litestar | Async, auto OpenAPI docs at `/docs` |
| ASGI server | **Uvicorn** | Hypercorn | `uvicorn app.main:app --reload` |
| Data validation | **Pydantic v2** | dataclasses | Models = our contract |
| Database | **Supabase (Postgres)** | Firebase, raw Postgres/Neon | See §5 |
| Auth | **Supabase Auth** | Firebase Auth, custom JWT | Anonymous + email; JWT verified in API |
| Real-time | **Supabase Realtime** | Firebase, WebSockets, polling | For live leaderboard/mission status |
| File/photo storage | **Supabase Storage** ✅ *confirmed* | Cloudinary (free tier — only if heavy image transforms needed), Firebase Storage | Mission checkpoint photos — see storage note below |
| AI / mission engine | **Claude `claude-sonnet-5`** (Anthropic API) | — | Creative mission writing. Server-side only (§8) |
| Real-place discovery | **Gemini** (`services/places.py`) — plain mode (free) by default; Google Maps grounding opt-in (needs billing) | OpenStreetMap Overpass (free, no ratings) | Optional. Real businesses along the route → mission checkpoints. `[]` if `GEMINI_API_KEY` unset. |
| Hosting (API) | **Render / Railway free tier** or **Fly.io** | Any container host | FastAPI needs a Python host (not Vercel-static) |
| Env / secrets | **`.env` + host env vars** | — | Never commit secrets |
| Package mgmt | **`pip` + `requirements.txt`** | `uv`, Poetry | Keep simple for 24h |

> ⚠️ **Deployment note:** Vercel is for the *frontend*. FastAPI is a Python service → deploy to **Render/Railway/Fly.io** (all have free tiers), or run locally + tunnel (ngrok) for the demo if hosting is fiddly.

**Why Supabase (current lean):** Postgres relational model fits our entities (users ↔ groups ↔ missions ↔ rankings ↔ businesses) far better than a document store, and it bundles **Auth + Realtime + Storage** in one free service. If real-time proves painful, fall back to **short polling** for the demo.

### File & photo storage — ✅ Supabase Storage (confirmed)

We store all files (mission checkpoint photos, avatars, feed images) in **Supabase Storage** — same project, same auth, one free tier (~1 GB storage + bandwidth, ample for the hackathon). No second service to manage.

- **Buckets:**
  - `mission-photos` — checkpoint completion images (link to `mission_completion.photo_url`)
  - `avatars` — user profile images (optional in MVP)
  - `feed` — travel-feed images (later)
- **How it works:** backend/client uploads the file to the bucket → we store the **path/URL** on the DB row (e.g. `mission_completion.photo_url`). Serve via **signed URLs** (private bucket) so only trip members can view.
- **MVP posture:** photos are the **first stretch goal**, not core. Ship *mark-complete only* first; add photo upload once the core loop works (it's high demo value for the business-tagging story).
- **Alternative (only if needed):** Cloudinary free tier for on-the-fly image resizing/optimisation — not required for the demo.

---

## 5. Data model (conceptual — stack-agnostic)

Entities and key fields. Exact column types live in migrations; this is the shared mental model.

- **user**: `id`, `email`, `display_name`, `avatar_url`, `created_at`
- **user_preferences**: `user_id`, `interests[]`, `diet`, `adventure_level`, `budget`, `free_text` — feeds the AI
- **trip** (a.k.a. group/game): `id`, `name`, `origin`, `destination`, `start_time`, `status` (`draft|active|arrived|ended`), `join_code`, `created_by`
- **trip_member**: `trip_id`, `user_id`, `role` (`host|player`), `total_points`
- **mission**: `id`, `trip_id`, `assignee_user_id` (null = group mission), `title`, `description`, `type` (`solo|group|secret`), `rarity` (`common|rare|legendary`), `points`, `is_secret`, `status` (`open|completed`), `business_id` (nullable), `generated_by` (`ai|fallback`)
- **mission_completion**: `id`, `mission_id`, `user_id`, `photo_url` (nullable), `completed_at`, `is_first` (first-to-finish bonus flag)
- **ranking**: `id`, `completion_id`, `voter_user_id`, `category` (`best_food|best_photo|funniest|...`), `score` — friends rating each other
- **badge**: `id`, `code`, `name`, `description`, `icon` — catalog
- **user_badge**: `user_id`, `badge_id`, `trip_id`, `earned_at` — the passport
- **business** (for small-business features): `id`, `name`, `location`, `category`, `tags[]`, `is_promoted` (monetization hook)
- **feed_post** (later): `id`, `completion_id`, `trip_id`, `business_id`, `caption`, `created_at` — the travel feed

**Relationships:** `user` 1—N `trip_member` N—1 `trip`; `trip` 1—N `mission` 1—N `mission_completion`; `mission_completion` 1—N `ranking`; `mission` N—1 `business` (optional).

**MVP subset (build these first):** `user`, `user_preferences`, `trip`, `trip_member`, `mission`, `mission_completion`. Everything else is stubbed/optional.

---

## 6. Suggested backend structure

```
backend/
├── app/
│   ├── main.py            # FastAPI app + router registration
│   ├── config.py          # env/settings (Pydantic BaseSettings)
│   ├── db.py              # Supabase/DB client init
│   ├── deps.py            # auth dependency, current_user
│   ├── models/            # Pydantic schemas (request/response)
│   ├── routers/           # one file per resource (trips, missions, ...)
│   ├── services/          # business logic (mission_engine, scoring, ...)
│   │   └── ai.py          # Claude mission-generation (the contract in §8)
│   └── data/
│       └── fallback_missions.py  # hardcoded deck if AI fails (demo safety)
├── requirements.txt
├── .env.example           # documented, no secrets
└── README.md              # how to run (points here for detail)
```

> Structure is a **suggestion**, not law — but keep **AI logic in `services/ai.py`** and **scoring in `services/`** so they're testable and swappable.

---

## 7. API surface (illustrative contract)

Not exhaustive — a shared starting point. All return JSON; auth via `Authorization: Bearer <token>`.

**Auth / users**
- `POST /auth/anon` — anonymous session (fast join for demo)
- `POST /auth/login` — email + password (admin override: `betterbash@gmail.com` / `betterbash`)
- `POST /auth/register` — email + password sign-up
- `POST /auth/google` — Google sign-in (**501 — in development**; use the override)
- `GET /users/me` — current user (includes `is_admin`, `avatar_color`, `initials`)
- `PUT /users/me/preferences` — set preferences

**Trips**
- `GET /trips` — trips the current user belongs to (dashboard)

**Trips (groups)**
- `POST /trips` — create trip → returns `join_code`
- `POST /trips/join` — join by `join_code`
- `GET /trips/{id}` — trip + members
- `POST /trips/{id}/start` — status → `active`, triggers **simple** mission generation
- `POST /trips/{id}/plan` — **rich** route-aware plan via `mission_generator.md` + the LLM (legs, per-member checkpoints with Google Maps links, shared checkpoints, scoring, summary). 503 if no `GEMINI_API_KEY`.
- `GET /trips/{id}/plan` — fetch a previously generated plan
- `POST /trips/{id}/arrive` — status → `arrived`, triggers recap

**Missions**
- `GET /trips/{id}/missions` — missions visible to current user (secret ones filtered to owner)
- `POST /missions/{id}/complete` — mark complete (+ optional `photo_url`) → awards points, sets `is_first`
- `POST /missions/{id}/rankings` — a friend ranks a completion

**Leaderboard / passport**
- `GET /trips/{id}/leaderboard` — points per member (real-time subscribe via Supabase)
- `GET /users/me/passport` — badges earned

**Later:** `GET /feed`, `POST /trips/{id}/discover`, business endpoints.

---

## 8. AI mission engine — the contract (critical)

Lives in `services/ai.py`. **Server-side only** (Claude key never reaches the client).

**Input** → assembled by the backend:
```json
{
  "trip": {"origin": "...", "destination": "...", "vibe": "..."},
  "players": [
    {"id": "u1", "name": "MJ", "preferences": {"interests": ["food"], "diet": "vegan"}},
    {"id": "u2", "name": "Israar", "preferences": {"interests": ["photography"]}}
  ],
  "counts": {"solo_per_player": 3, "group": 1, "secret_per_player": 1}
}
```

**Output** → Claude must return **strict JSON** (validate with Pydantic; retry once on parse failure, then use fallback deck):
```json
{
  "missions": [
    {
      "assignee_name": "Israar",
      "title": "Order something you can't pronounce",
      "description": "...",
      "type": "solo",
      "rarity": "common",
      "points": 100,
      "is_secret": false
    },
    {
      "assignee_name": "MJ",
      "title": "Secretly get Israar to order a vegan meal",
      "type": "secret",
      "is_secret": true,
      "rarity": "rare",
      "points": 250,
      "time_limit_minutes": 20
    }
  ]
}
```

**Rules the prompt must enforce:**
- Missions are **personalised** to each player's preferences.
- Include a mix: `solo`, one `group`, and `secret` per-player missions.
- Secret missions are **social** and playful (target another named player).
- Keep them **safe, legal, doable in-journey, and funny** — the humour is the wow factor.
- Points scale with rarity (`common ~100`, `rare ~250`, `legendary ~500`).
- **Timers are optional and rare:** most missions omit `time_limit_minutes` (or set it
  `null`) and never expire; only ~1 in 4 get a limit for urgency. The engine converts
  `time_limit_minutes` → an absolute `expires_at` at generation time. Completing an
  expired mission is rejected (`409`); the missions list exposes a computed `is_expired`.

**Fallback:** `data/fallback_missions.py` holds a generic-but-fun deck. If the AI call fails or returns invalid JSON twice, serve the fallback so the demo never breaks.

### Real places (Gemini Maps grounding) — `services/places.py`

On trip start, the backend optionally calls **Gemini + Google Maps grounding** to
fetch real, currently-operating businesses along the route (name/category/address/
rating/coords). These are:
1. saved as `businesses` rows (`store.save_businesses`), and
2. passed to the mission engine as candidate checkpoints. Claude may tag a mission
   with `business_name` (copied verbatim from a provided place); the start endpoint
   resolves that to `business_id`.

This powers the **small-business-checkpoint** feature. Fully optional and
defensive: no `GEMINI_API_KEY`, SDK missing, or any error → returns `[]`, and
missions generate normally without real places.

**Modes:** default is **plain (free)** — Gemini lists real, well-known places from
its own knowledge (validated: returns real SA route stops on the free tier). Live
**Google Maps grounding** (ratings/coords) is **opt-in and needs billing** (the
free tier 429s for grounding) — set `GEMINI_USE_MAPS_GROUNDING=true` once billing
is on; we then try grounding first and fall back to plain automatically.
**Privacy note:** on Gemini's *free* tier, inputs/outputs may be used to improve
Google's models — fine for the demo; send nothing sensitive.

---

## 9. Scoring rules (services/scoring.py)

- Completing a mission → award `mission.points`.
- **First to complete** a given mission among the group → bonus (e.g. +50%), set `is_first=true`.
- **Rankings** from friends → convert to bonus points for the winner of each category.
- Badges are awarded on triggers (first mission, 5 missions, group mission complete, etc.) — keep the trigger list in one place.

---

## 10. Environment variables (`.env.example`)

```
# API
APP_ENV=development

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only, never expose

# Anthropic / Claude
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-5

# Gemini (real-place discovery — optional)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
GEMINI_USE_MAPS_GROUNDING=false   # true only with a billing-enabled project
```
**Never commit real values.** Commit only `.env.example`.

> **Gemini free-tier note (validated 2026-09-18):** the API key + plain generation
> work on the free tier (Gemini 3.x Flash ≈ 20 req/day/model). **Live Google Maps
> grounding is NOT free — it 429s without billing enabled.** So `places.py` defaults
> to Gemini's own knowledge (still returns real, well-known places, free). Flip
> `GEMINI_USE_MAPS_GROUNDING=true` after enabling billing to use live Maps data.

---

## 11. Conventions for agents & teammates

- **Read this file before coding.** If your change alters an entity, endpoint, or the AI contract, **edit this file in the same PR.**
- **Contracts first:** define/adjust the Pydantic model, then implement.
- **Small PRs, clear names.** One resource/feature per PR where possible.
- **Keep AI + scoring in `services/`** so they're unit-testable without the DB.
- **Degrade gracefully:** every external call (DB, AI, storage) needs a fallback path.
- **Secrets:** server-side only; never return service keys or the Claude key to clients.
- **`/docs`** (FastAPI auto Swagger) is the live API reference — keep models accurate so it stays useful.

---

## 12. Decisions log (resolved — optimised for speed + zero cost)

- [x] **Database → Supabase (Postgres + Auth + Storage).** One free service covers DB, auth, and files. *Note: free project pauses after ~1 week idle — run a query to wake it before demo day.*
- [x] **Real-time leaderboard → Polling, not Realtime (for MVP).** Client polls `GET /trips/{id}/leaderboard` every 3–5s. ~5 lines, works everywhere, can't break on stage. Upgrade to Supabase Realtime only if we finish early. **Biggest de-risk of the build.**
- [x] **API hosting → Local-first for dev & demo; Render free tier only if a public URL is required.** Run `uvicorn` locally (frontend local too) for the actual demo = zero cost, no cold-start, most reliable. Render free tier = optional public link (⚠️ ~50s cold-start after idle → ping it right before presenting). ngrok only for FE↔local-BE integration testing.
- [x] **File/photo storage → Supabase Storage** (see §4 storage note). Private buckets + signed URLs.
- [x] **Photos → Mark-complete first (core), photo upload as first stretch goal.** Guarantees a working loop; photos added once core works (high demo value for business-tagging story).
- [x] **First-to-finish bonus → Build it for real (it's trivial).** On `POST /missions/{id}/complete`, if no completion exists yet for that `mission_id`, set `is_first=true` + apply bonus. One query, ~10 lines.
- [x] **Locations → Google Maps links, NOT Maps grounding.** Grounding needs billing; instead the LLM returns name+address and we attach a `maps_url` (see `app/locations.py` / frontend `lib/maps.ts`). Free, no quota. Grounding stays opt-in (`GEMINI_USE_MAPS_GROUNDING`).
- [x] **Rich mission generation → use the team prompt `mission_generator.md`** via `services/mission_planner.py` (LLM = Gemini today), exposed at `POST /trips/{id}/plan`. The simple `services/ai.py` loop stays as the low-risk fallback. See [`INTEGRATION.md`](INTEGRATION.md).

### Fastest path to "up and running"
1. Create Supabase project (free) → grab URL + keys.
2. Run MVP tables via Supabase SQL editor (users, preferences, trips, trip_members, missions, mission_completions).
3. Scaffold FastAPI locally → `uvicorn app.main:app --reload` → confirm `/docs`.
4. Wire Supabase client + `.env` → one test read/write.
5. Add Claude mission engine (`services/ai.py`) with JSON contract + fallback deck.
6. Build core loop: create trip → join by code → generate missions → complete (first-to-finish) → poll leaderboard.
7. Stretch: photo upload, badges beyond basics, realtime, feed.

---

*Last updated: 2026-09-18 · Keep this current — it's how we stay aligned.*
