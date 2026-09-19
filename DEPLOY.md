# SideQuest — Deployment Guide

How to run SideQuest **locally** (backup) and get a **free live link** without
exposing secrets. Pairs with [`INTEGRATION.md`](INTEGRATION.md),
[`BACKEND.md`](BACKEND.md), [`DATABASE.md`](DATABASE.md).

The stack: **backend** = FastAPI (Python), **frontend** = Next.js. They deploy
as two services. Pick a hosting option below; local + Docker always work as a
fallback.

---

## Secret safety (read first)

- **Real secrets live only in the backend**, provided as **runtime env vars** on
  the host — never committed, never baked into an image. `.env` is gitignored and
  excluded by `.dockerignore` (verified: it's not in the built image).
- **Frontend has no secrets.** Its only config is `NEXT_PUBLIC_API_BASE_URL`,
  which is *public by design* (baked into the browser bundle at build time). Never
  put an LLM key or the Supabase **service-role** key behind `NEXT_PUBLIC_`.
- **Rotate a key** the moment it's exposed (e.g. printed to a terminal/log).
- Two cross-config values you set per environment:
  - Frontend build → `NEXT_PUBLIC_API_BASE_URL` = the backend's public URL.
  - Backend env → `CORS_ORIGINS` = the frontend's public URL (comma-separated).

Backend env vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `REPLICATE_API_KEY` /
`REPLICATE_MODEL` (optional),
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (when wired), `CORS_ORIGINS`, `PORT`.

---

## Option A — Local (backup, no Docker)

Always works; best for fast iteration and as the demo-day fallback.

**Backend** (terminal 1):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add GEMINI_API_KEY etc. (optional — runs on fallbacks)
uvicorn app.main:app --reload      # http://localhost:8000  (/docs, /health)
```

**Frontend** (terminal 2):
```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev                        # http://localhost:3000 (or 3001 if 3000 is busy)
```
Backend CORS already allows any `localhost` port in dev.

---

## Option B — Docker Compose (local containers)

Parity with production images; one command.
```bash
cp backend/.env.example backend/.env     # optional
docker compose up --build
# frontend → http://localhost:3000 , backend → http://localhost:8000
```
If port 3000 is taken (Docker/another app), edit `docker-compose.yml`
`"3000:3000"` → `"3001:3000"` and re-run.

Build images individually if needed:
```bash
docker build -t sidequest-backend ./backend
docker build -t sidequest-frontend --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 ./frontend
```

---

## Free live-link options (compare)

| Host | Best for | Free? | Docker? | Notes |
|---|---|---|---|---|
| **Render** | Both services, easiest | ✅ free web services | ✅ (or native) | ~50s cold start after idle; warm before demo |
| **Fly.io** | Docker-native, global | ✅ small free allowance | ✅ required | Needs `flyctl`; can stay warm |
| **Google Cloud Run** | Scales to zero, robust | ✅ generous free | ✅ required | Needs a GCP account + card (not charged in free tier) |
| **Hugging Face Spaces** | Quick public demo | ✅ free | ✅ (Docker Space) | Public URL, good for showcases |
| **Vercel / Netlify / Cloudflare Pages** | Frontend only | ✅ free | ✖ native Next | Pair with a backend host above |

**Recommended for this hackathon:** **Render for both** (one account, no card,
Docker or native). Use **Fly.io** or **Cloud Run** if you want no cold starts.

---

## Option C — Render (recommended)

One free account hosts **both** services from this GitHub repo.

### Backend (Render Web Service, Docker)
1. Push the repo to GitHub (done).
2. Render dashboard → **New → Web Service** → connect the repo.
3. **Root Directory:** `backend` · **Runtime:** Docker (it detects the `Dockerfile`).
4. **Environment → Add** your vars: `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-3.5-flash`,
   (later) Supabase vars, and `CORS_ORIGINS=https://<your-frontend>.onrender.com`.
   Render provides `PORT` automatically.
5. Create → wait for deploy → note the URL, e.g. `https://sidequest-backend.onrender.com`.
6. Check `https://…/health`.

> Native (no Docker) alternative: Runtime **Python**, Build `pip install -r requirements.txt`,
> Start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Frontend (Render Web Service, Docker)
1. **New → Web Service** → same repo → **Root Directory:** `frontend` → Docker.
2. **Environment → Add** a *build* variable: `NEXT_PUBLIC_API_BASE_URL` =
   the backend URL from above. (In Render, set it as an env var; the Dockerfile
   reads it as a build arg via the platform, or add it under "Docker Build Args".)
3. Create → note the URL, e.g. `https://sidequest.onrender.com`.
4. Go back to the **backend** and set `CORS_ORIGINS` to this frontend URL; redeploy.

Cold-start tip: hit the backend `/health` a minute before presenting to wake it.

---

## Option D — Fly.io (Docker, can stay warm)

```bash
# one-time: install flyctl, then `fly auth login`
cd backend
fly launch --no-deploy            # creates fly.toml (internal_port 8000)
fly secrets set GEMINI_API_KEY=... GEMINI_MODEL=gemini-3.5-flash CORS_ORIGINS=https://<frontend-host>
fly deploy                        # -> https://<app>.fly.dev

cd ../frontend
fly launch --no-deploy            # internal_port 3000
# NEXT_PUBLIC_API_BASE_URL is build-time -> pass as a build arg:
fly deploy --build-arg NEXT_PUBLIC_API_BASE_URL=https://<backend-app>.fly.dev
```
Set the backend `internal_port` to 8000 and the frontend to 3000 in each `fly.toml`.

---

## Option E — Google Cloud Run (Docker, scale-to-zero)

Needs a GCP project with billing enabled (free tier; card required, not charged
at demo volume).
```bash
gcloud auth login && gcloud config set project <PROJECT_ID>

# Backend
gcloud run deploy sidequest-backend --source ./backend --region <region> \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,GEMINI_MODEL=gemini-3.5-flash,CORS_ORIGINS=https://<frontend-url>

# Frontend (NEXT_PUBLIC_* is build-time -> build then deploy)
gcloud builds submit ./frontend --tag gcr.io/<PROJECT_ID>/sidequest-frontend \
  --substitutions _URL=https://<backend-url>   # or bake via cloudbuild build-arg
gcloud run deploy sidequest-frontend --image gcr.io/<PROJECT_ID>/sidequest-frontend \
  --region <region> --allow-unauthenticated
```
Cloud Run sets `$PORT` — both Dockerfiles already honour it.

---

## Frontend-only alternatives (if not containerising the UI)

- **Vercel:** import the repo, set **Root Directory** `frontend`, add
  `NEXT_PUBLIC_API_BASE_URL`, deploy. (Requires a free Vercel account.)
- **Netlify / Cloudflare Pages:** same idea — connect repo, set the env var, deploy.

Pair any of these with a backend on Render/Fly/Cloud Run.

---

## Post-deploy checklist

- [ ] Backend `/health` returns ok on its public URL.
- [ ] Backend `CORS_ORIGINS` includes the exact frontend URL (https).
- [ ] Frontend built with `NEXT_PUBLIC_API_BASE_URL` = backend URL.
- [ ] Create a trip on the live site → the share code + join flow works cross-device.
- [ ] Secrets set only in the host's env dashboard; none in git or images.
- [ ] (When wired) Supabase project not paused; keys set on the backend only.
