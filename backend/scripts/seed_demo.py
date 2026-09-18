"""Seed the prototype with ONLY the real team users.

Crew: Israar (you), MJ, Jackie.  Outsider: Better Bash (the admin account).
All data lands in Supabase via the real API. Photos are uploaded to Storage.

Usage:  python scripts/seed_demo.py   (backend running; .env has ADMIN_* + Supabase)
"""
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv(".env")
BASE = os.environ.get("SEED_API_BASE", "http://localhost:8000")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "betterbash@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "betterbash")

CREW_PASSWORD = "demo1234"
CREW = [
    {"name": "Israar", "email": "israar@demo.sidequest",
     "interests": ["food", "photography", "adventure"]},
    {"name": "MJ", "email": "mj@demo.sidequest",
     "interests": ["nature", "local-culture", "food"], "diet": "vegan"},
    {"name": "Jackie", "email": "jackie@demo.sidequest",
     "interests": ["photography", "nightlife", "shopping"]},
]
# The only accounts allowed to exist in the prototype.
KEEP_EMAILS = {ADMIN_EMAIL.lower(), *[m["email"].lower() for m in CREW]}


def img_bytes(seed: str) -> bytes | None:
    try:
        r = httpx.get(f"https://picsum.photos/seed/{seed}/1000/750", timeout=30, follow_redirects=True)
        return r.content if r.status_code == 200 else None
    except Exception:  # noqa: BLE001
        return None


def upload_and_complete(c, hdr, mission_id, seed):
    photo_url = None
    data = img_bytes(seed)
    if data:
        try:
            r = c.post(f"/missions/{mission_id}/photo", headers=hdr,
                       files={"file": (f"{seed}.jpg", data, "image/jpeg")})
            if r.status_code == 200:
                photo_url = r.json()["photo_url"]
        except Exception as exc:  # noqa: BLE001
            print(f"    upload note: {exc}")
    c.post(f"/missions/{mission_id}/complete", headers=hdr, json={"photo_url": photo_url})


def user(c, name, email, interests, diet=None):
    r = c.post("/auth/register", json={"display_name": name, "email": email, "password": CREW_PASSWORD})
    if r.status_code == 409:
        r = c.post("/auth/login", json={"email": email, "password": CREW_PASSWORD})
    h = {"X-User-Id": r.json()["id"]}
    c.put("/users/me/preferences", headers=h, json={"interests": interests, "diet": diet})
    return h


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=90)

    if c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).status_code != 200:
        sys.exit("admin login failed — check ADMIN_* env / backend")

    # Reset the prototype: wipe all trips, and remove every user except the 4 allowed.
    from supabase import create_client
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    sb.table("trips").delete().not_.is_("id", "null").execute()
    removed = 0
    for u in (sb.table("users").select("id,email").execute().data or []):
        if (u.get("email") or "").lower() not in KEEP_EMAILS:
            sb.table("users").delete().eq("id", u["id"]).execute()
            removed += 1
    print(f"reset: wiped all trips; removed {removed} non-team users")

    # Crew
    israar = user(c, "Israar", CREW[0]["email"], CREW[0]["interests"])
    mj = user(c, "MJ", CREW[1]["email"], CREW[1]["interests"], CREW[1].get("diet"))
    jackie = user(c, "Jackie", CREW[2]["email"], CREW[2]["interests"])

    # The crew trip — hosted by Israar, with MJ + Jackie.
    trip = c.post("/trips", headers=israar, json={
        "name": "Garden Route Crew", "origin": "Cape Town", "destination": "Knysna",
        "vibe": "food, nature & photography", "start_date": "2026-10-12", "end_date": "2026-10-18",
    }).json()
    tid, code = trip["id"], trip["join_code"]
    for h in (mj, jackie):
        c.post("/trips/join", headers=h, json={"join_code": code})

    missions = c.post(f"/trips/{tid}/start", headers=israar).json()
    players = [israar, mj, jackie]
    solo = [m for m in missions if m["type"] == "solo"]
    for i, m in enumerate(solo[:6]):
        upload_and_complete(c, players[i % len(players)], m["id"], f"{tid[:6]}-{i}")
    if solo:
        for cat in ("funniest", "best_photo", "most_creative"):
            c.post(f"/missions/{solo[0]['id']}/rankings", headers=israar, json={"category": cat})

    lb = c.get(f"/trips/{tid}/leaderboard", headers=israar).json()
    print(f"\n'{trip['name']}' — {len(missions)} missions, photos uploaded")
    print("Leaderboard:")
    for e in lb:
        print(f"  {e['display_name']}: {e['total_points']} pts")

    print("\n" + "=" * 56)
    print("PROTOTYPE SEEDED — team users only (South Africa)")
    print("  Crew (log in as yourself):")
    print(f"    Israar  -> israar@demo.sidequest / {CREW_PASSWORD}")
    print(f"    MJ      -> mj@demo.sidequest / {CREW_PASSWORD}")
    print(f"    Jackie  -> jackie@demo.sidequest / {CREW_PASSWORD}")
    print(f"  Outsider (admin): {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"  Join code (outsider can join the crew trip): {code}")
    print("=" * 56)


if __name__ == "__main__":
    main()
