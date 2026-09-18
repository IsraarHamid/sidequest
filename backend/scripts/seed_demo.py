"""Seed realistic South-African demo data via the REAL API flow.

Everything lands in Supabase exactly as a user would produce it:
- A populated trip the admin hosts (missions, completions, real uploaded photos,
  points, badges, votes).
- A second OPEN trip (admin is NOT a member) whose join code you can use to test
  the join flow in the UI.
Photos are downloaded and UPLOADED to Supabase Storage (compressed) — first-party.

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


def img_bytes(seed: str) -> bytes | None:
    try:
        r = httpx.get(f"https://picsum.photos/seed/{seed}/1000/750",
                      timeout=30, follow_redirects=True)
        return r.content if r.status_code == 200 else None
    except Exception:  # noqa: BLE001
        return None


def upload_and_complete(c, hdr, mission_id, seed):
    """Upload a realistic image to Supabase, then complete the mission with it."""
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
    return photo_url


def user(c, name, email, interests, diet=None):
    r = c.post("/auth/register", json={"display_name": name, "email": email, "password": "demo1234"})
    if r.status_code == 409:
        r = c.post("/auth/login", json={"email": email, "password": "demo1234"})
    h = {"X-User-Id": r.json()["id"]}
    c.put("/users/me/preferences", headers=h, json={"interests": interests, "diet": diet})
    return h


def build_trip(c, host_hdr, members, trip_body, complete_n):
    trip = c.post("/trips", headers=host_hdr, json=trip_body).json()
    tid, code = trip["id"], trip["join_code"]
    for mh in members:
        c.post("/trips/join", headers=mh, json={"join_code": code})
    missions = c.post(f"/trips/{tid}/start", headers=host_hdr).json()
    players = [host_hdr] + members
    solo = [m for m in missions if m["type"] == "solo"]
    for i, m in enumerate(solo[:complete_n]):
        upload_and_complete(c, players[i % len(players)], m["id"], f"{tid[:6]}-{i}")
    # a few votes on the first completed mission
    if solo:
        for cat in ("funniest", "best_photo", "most_creative"):
            c.post(f"/missions/{solo[0]['id']}/rankings", headers=host_hdr, json={"category": cat})
    return trip, code, len(missions)


def main() -> None:
    c = httpx.Client(base_url=BASE, timeout=90)

    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        sys.exit(f"admin login failed ({r.status_code})")
    admin = r.json()
    ah = {"X-User-Id": admin["id"]}

    # Wipe ALL trips (cascades missions/members/completions) for a pristine demo.
    # This is a demo DB; the seed is the source of truth for demo state.
    try:
        from supabase import create_client
        sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
        sb.table("trips").delete().not_.is_("id", "null").execute()
        print("cleaned all previous trips (fresh demo state)")
    except Exception as exc:  # noqa: BLE001
        print(f"(cleanup skipped: {exc})")

    c.put("/users/me/preferences", headers=ah,
          json={"interests": ["food", "nature", "photography"], "adventure_level": "adventurous"})

    thandi = user(c, "Thandi Mokoena", "thandi@demo.sidequest", ["food", "photography", "nature"], "vegetarian")
    sipho = user(c, "Sipho Ndlovu", "sipho@demo.sidequest", ["adventure", "history", "local-culture"])
    lerato = user(c, "Lerato Khumalo", "lerato@demo.sidequest", ["food", "shopping", "nightlife"])

    # --- Trip A: the populated demo trip (admin hosts) ---
    print("\nSeeding Trip A (populated demo)…")
    tripA, codeA, nA = build_trip(
        c, ah, [thandi, sipho],
        {"name": "Garden Route Crew", "origin": "Cape Town", "destination": "Knysna",
         "vibe": "food, nature & photography", "start_date": "2026-10-12", "end_date": "2026-10-18"},
        complete_n=6,
    )
    print(f"  '{tripA['name']}'  ({nA} missions, photos uploaded)  code={codeA}")

    # --- Trip B: OPEN trip for testing the JOIN flow (admin is NOT a member) ---
    print("Seeding Trip B (open — for join testing)…")
    tripB, codeB, nB = build_trip(
        c, thandi, [sipho, lerato],
        {"name": "Kruger Safari Squad", "origin": "Johannesburg", "destination": "Kruger National Park",
         "vibe": "wildlife & adventure", "start_date": "2026-11-02", "end_date": "2026-11-07"},
        complete_n=3,
    )
    print(f"  '{tripB['name']}'  ({nB} missions)  code={codeB}")

    lb = c.get(f"/trips/{tripA['id']}/leaderboard", headers=ah).json()
    print("\nTrip A leaderboard:")
    for e in lb:
        print(f"  {e['display_name']}: {e['total_points']} pts")

    print("\n" + "=" * 52)
    print("DEMO READY (all data in Supabase, all trips in South Africa)")
    print(f"  Sign in:            {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"  Populated trip:     Garden Route Crew (Knysna)")
    print(f"  TEST JOINING -> code: {codeB}   (Kruger Safari Squad)")
    print("    (admin is not in Trip B — use Join and enter the code above)")
    print("=" * 52)


if __name__ == "__main__":
    main()
