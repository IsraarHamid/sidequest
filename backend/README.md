# TRIP QUEST — Backend

FastAPI backend for TRIP QUEST. See [`../BACKEND.md`](../BACKEND.md) for the full
architecture and contracts, and [`../DATABASE.md`](../DATABASE.md) for the schema.

## Run locally (no keys required for first run)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in keys when ready (optional at first)
uvicorn app.main:app --reload
```

- API docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

**It runs with zero config.** Without Supabase keys it uses an in-memory store;
without an Anthropic key it uses a hardcoded fallback mission deck. Add keys to
`.env` to switch on the real services (`/health` shows what's active).

## Core loop (try it in /docs)

1. `POST /auth/anon` → returns a user. Copy its `id`.
2. Send that id as the **`X-User-Id`** header on every other request
   (in Swagger: "Authorize" isn't used — add the header per request, or use curl).
3. `POST /trips` → create a trip (get a `join_code`).
4. Others `POST /trips/join` with the code.
5. `POST /trips/{id}/start` → generates the AI mission deck.
6. `GET /trips/{id}/missions` → your missions (others' secrets hidden).
7. `POST /missions/{id}/complete` → awards points (+50% if first to finish).
8. `GET /trips/{id}/leaderboard` → poll every 3–5s from the client.
9. `POST /trips/{id}/arrive` → end the journey.

### Quick curl example
```bash
BASE=http://localhost:8000
UID=$(curl -s -X POST $BASE/auth/anon -H 'content-type: application/json' \
  -d '{"display_name":"Israar"}' | python -c 'import sys,json;print(json.load(sys.stdin)["id"])')
curl -s -X POST $BASE/trips -H "X-User-Id: $UID" -H 'content-type: application/json' \
  -d '{"name":"Cape Town run","origin":"Cape Town","destination":"Hermanus","vibe":"foodie"}'
```

## Swapping the in-memory store for Supabase

All persistence lives in [`app/store.py`](app/store.py). Replace each function
body with a Supabase query (schema in `../DATABASE.md`) — the routers won't change.
