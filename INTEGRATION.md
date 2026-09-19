# SideQuest — Frontend ↔ Backend Integration

> How the pieces fit into one working product, and how to run them together.
> Pairs with [`BACKEND.md`](BACKEND.md), [`DATABASE.md`](DATABASE.md), and
> [`backend/mission_generator.md`](backend/mission_generator.md).

## The shape of the system

```
Next.js frontend (frontend/)          FastAPI backend (backend/)
  screens + Paper Chaos design   ──►   REST API  ──►  LLM (Gemini today; Claude when keyed)
  lib/api.ts  (typed client)           in-memory store (→ Supabase later)
  lib/maps.ts (location links)         mission_generator.md (the rich prompt)
```

- **Frontend** renders the flow (onboarding → preferences → trip → missions →
  vote → leaderboard → passport). It currently ships with mock data
  (`lib/trip-quest-data.ts`); migrate screens to the real API via `lib/api.ts`
  one at a time.
- **Backend** owns game state + mission generation and returns JSON.

## Two mission-generation paths (both live)

1. **Simple loop** — `POST /trips/{id}/start` → flat missions (solo / group /
   secret, points, timers, optional real business via Gemini places). Powers the
   fast core demo loop.
2. **Rich plan** — `POST /trips/{id}/plan` → the **route-aware** plan from
   `mission_generator.md`: legs, per-member checkpoints (each with a **Google
   Maps link**), shared checkpoints, scoring, and a group-chat summary. This is
   the "prompt generator working with the API." Fetch a saved plan with
   `GET /trips/{id}/plan`.

> The rich plan is the direction for the full product; the simple loop stays as
> the low-risk fallback for the demo.

## Locations = links (decision)

We do **not** use a Maps grounding API (it needs billing). The LLM returns a
place `name` + `address` (+ coordinates, + a `verify` flag). The backend attaches
a `maps_url` (Google Maps search link) to every checkpoint; the frontend can also
build one with `mapsLink()` in `lib/maps.ts`. The user taps the link to view /
navigate / verify — free, no billing, no grounding quota.

## Run both locally

**Backend** (see [`backend/README.md`](backend/README.md)):
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload      # http://localhost:8000  (/docs, /health)
```
Optional keys in `backend/.env`: `GEMINI_API_KEY` (real places + rich plan),
`REPLICATE_API_KEY` (Claude missions via Replicate). Without keys it uses the fallback deck.

**Frontend**:
```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev                        # http://localhost:3000
```
CORS on the backend already allows `http://localhost:3000`.

## The API client (`frontend/lib/api.ts`)

- `api.signInAnon(name)` → creates an anonymous user; the id is stored in
  `localStorage` and sent as `X-User-Id` on every call.
- Trips: `createTrip`, `joinTrip`, `getTrip`, `arrive`.
- Simple loop: `startTrip`, `listMissions`, `completeMission`, `leaderboard`.
- Rich plan: `generatePlan`, `getPlan`.
- Preferences: `setPreferences`, `me`.

Types mirror `backend/app/models.py`. Migrating a screen = replacing its
`trip-quest-data.ts` import with the matching `api.*` call.

## Shareable join flow (wired)

- **Create** (`/trips/new`): calls `ensureUser()` + `api.createTrip()`, then shows the
  **real `join_code`** with Copy + Share-link (Web Share API → `joinLink(code)`,
  falls back to clipboard). Continue → `/trips/{realId}/preferences`.
- **Join** (`/trips/join`): code input prefilled from an invite link (`?code=…`),
  `api.joinTrip(code)` → shows the real trip + members → Continue.
- No schema change — uses the existing `trips.join_code` + `trip_members`.

## Auth flow (wired)

- **Welcome first:** the dashboard (`/`) checks `api.me()`; if not signed in it
  redirects to `/login`.
- **`/login`** offers **Google sign-in** (currently 501 → shows "in development"),
  **email/password** sign-in, and **register**. Landing here clears any session
  (so it doubles as "log out").
- **Admin override:** `betterbash@gmail.com` / `betterbash` (seeded, `is_admin`)
  — the bypass while Google is in development.
- Dashboard shows the **real** signed-in user + their trips (`GET /trips`), with an
  empty state for new users. No more sample "Jackie" data.

## Status / next steps

- ✅ Backend API + both generation paths working (validated live).
- ✅ Auth: anonymous, email/password (+ admin override), Google stub; `is_admin`.
- ✅ **Welcome-first flow + real dashboard** (create/join already wired).
- ⏳ Wire remaining screens (preferences, missions, leaderboard, passport) to `lib/api.ts`.
- ⏳ Real Google OAuth (replace the 501 stub).
- ⏳ Swap the in-memory store for Supabase (schema in `DATABASE.md`).
