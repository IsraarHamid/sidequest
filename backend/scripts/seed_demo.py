"""Seed a polished demo trip so the app looks real on stage.

Runs the REAL API flow (create/join/start/complete/rank) against a running
backend, so all data lands in Supabase exactly as a user would produce it.
Uses generic travel images (picsum) for completed-mission photos.

Usage:
    # backend running on :8000, .env has ADMIN_EMAIL/ADMIN_PASSWORD + Supabase
    python scripts/seed_demo.py
"""
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv(".env")
BASE = os.environ.get("SEED_API_BASE", "http://localhost:8000")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "betterbash@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "betterbash")

IMG = lambda s: f"https://picsum.photos/seed/{s}/900/700"  # noqa: E731 generic images

MEMBERS = [
    {"name": "Thandi Mokoena", "email": "thandi@demo.sidequest", "password": "demo1234",
     "interests": ["food", "photography", "nature"], "diet": "vegetarian"},
    {"name": "Sipho Ndlovu", "email": "sipho@demo.sidequest", "password": "demo1234",
     "interests": ["adventure", "history", "local-culture"]},
]


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=60)

    # --- admin ---
    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        sys.exit(f"admin login failed ({r.status_code}) — check ADMIN_* env / backend")
    admin = r.json()
    ah = {"X-User-Id": admin["id"]}

    # --- cleanup admin's previous demo/test trips (Supabase cascade) ---
    try:
        from supabase import create_client
        sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
        sb.table("trips").delete().eq("created_by", admin["id"]).execute()
        print("cleaned admin's previous trips")
    except Exception as exc:  # noqa: BLE001
        print(f"(cleanup skipped: {exc})")

    c.put("/users/me/preferences", headers=ah,
          json={"interests": ["food", "nature", "photography"], "adventure_level": "adventurous"})

    # --- create the demo trip ---
    trip = c.post("/trips", headers=ah, json={
        "name": "Garden Route Crew", "origin": "Cape Town", "destination": "Knysna",
        "vibe": "food, nature & photography", "start_date": "2026-10-12", "end_date": "2026-10-18",
    }).json()
    tid, code = trip["id"], trip["join_code"]
    print(f"created trip '{trip['name']}'  code={code}")

    # --- members register + join ---
    member_headers = []
    for m in MEMBERS:
        rr = c.post("/auth/register", json={"display_name": m["name"], "email": m["email"], "password": m["password"]})
        if rr.status_code == 409:
            rr = c.post("/auth/login", json={"email": m["email"], "password": m["password"]})
        uid = rr.json()["id"]
        mh = {"X-User-Id": uid}
        c.put("/users/me/preferences", headers=mh,
              json={"interests": m["interests"], "diet": m.get("diet")})
        c.post("/trips/join", headers=mh, json={"join_code": code})
        member_headers.append((m["name"], mh))
        print(f"  joined: {m['name']}")

    # --- generate missions ---
    missions = c.post(f"/trips/{tid}/start", headers=ah).json()
    print(f"generated {len(missions)} missions ({set(m['generated_by'] for m in missions)})")

    # --- complete a spread of missions across members, with generic photos ---
    all_players = [("Better Bash", ah)] + member_headers
    solo = [m for m in missions if m["type"] == "solo"]
    completions = 0
    for i, mission in enumerate(solo[:6]):
        name, hdr = all_players[i % len(all_players)]
        photo = IMG(f"sidequest-{tid[:6]}-{i}")
        rc = c.post(f"/missions/{mission['id']}/complete", headers=hdr,
                    json={"photo_url": photo})
        if rc.status_code == 200:
            completions += 1
    print(f"completed {completions} missions (with generic photos)")

    # --- a few votes for friendly competition ---
    done = [m for m in solo[:6]]
    if done:
        for cat in ("funniest", "best_photo", "most_creative"):
            c.post(f"/missions/{done[0]['id']}/rankings", headers=ah, json={"category": cat})

    lb = c.get(f"/trips/{tid}/leaderboard", headers=ah).json()
    print("\nLeaderboard:")
    for e in lb:
        print(f"  {e['display_name']}: {e['total_points']} pts")
    print(f"\n✅ Demo seeded. Trip code: {code}")


if __name__ == "__main__":
    main()
