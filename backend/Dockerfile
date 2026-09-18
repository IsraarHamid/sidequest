# SideQuest backend (FastAPI) — container image.
# Secrets are NEVER baked in: they come from runtime env vars (see .dockerignore
# excludes .env). Listens on $PORT (Render/Cloud Run set this) or 8000.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copies app/ and mission_generator.md (planner reads it at /app/mission_generator.md)
COPY . .

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
