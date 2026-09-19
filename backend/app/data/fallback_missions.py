"""Fallback mission deck — used when the LLM is unavailable/quota-limited.

Written to look hand-crafted and destination-aware so a live demo always has
legitimate-looking missions even without an AI call.
"""
import random

RARITY_POINTS = {"common": 100, "rare": 250, "legendary": 500}

# (title, description) — {dest} is filled with the trip destination.
_SOLO = [
    ("Find the best coffee in {dest}", "Track down a spot only locals rate — no chains."),
    ("Snap {dest}'s best-kept view", "Somewhere off the tourist trail. Golden hour bonus."),
    ("Try a dish you can't pronounce", "Order it, finish it, report back."),
    ("Buy something from a roadside stall", "Support a small local seller."),
    ("Find a mural or piece of street art", "Capture the local colour."),
    ("Take a 20-minute nature detour", "A short trail, a viewpoint, or a beach."),
    ("Get one insider tip from a local", "Ask what they'd do with a free afternoon in {dest}."),
    ("Find the quirkiest sign on the road", "The stranger the better."),
    ("Photograph something older than 100 years", "History hides in plain sight."),
    ("Order the house special anywhere", "Trust the person behind the counter."),
]

_GROUP = [
    ("Crew dish of the day", "Everyone tastes something new, then vote a winner before sunset."),
    ("One photo, whole crew, no selfies", "Ask a friendly stranger to take it."),
    ("Find a spot none of you have been", "Somewhere new to all of you — prove it with a photo."),
]

_SECRET = [
    "Secretly get {target} to say 'lekker' three times",
    "Convince {target} to order the weirdest thing on the menu",
    "Get {target} to pose for a photo they'll pretend to hate",
    "Make {target} laugh so hard they snort",
    "Get {target} to talk to a stranger for 2 minutes",
]


def build_fallback_missions(trip: dict, players: list[dict], counts: dict,
                            places: list[dict] | None = None) -> list[dict]:
    dest = trip.get("destination") or trip.get("origin") or "the area"
    out: list[dict] = []
    solo_n = counts.get("solo_per_player", 2)
    secret_n = counts.get("secret_per_player", 1)
    group_n = counts.get("group", 1)
    places = places or []

    for p in players:
        for title, desc in random.sample(_SOLO, min(solo_n, len(_SOLO))):
            timed = random.random() < 0.25
            out.append({
                "assignee_user_id": p["id"],
                "title": ("⚡ " + title.format(dest=dest)) if timed else title.format(dest=dest),
                "description": desc.format(dest=dest),
                "type": "solo",
                "rarity": "rare" if timed else "common",
                "points": RARITY_POINTS["rare"] if timed else RARITY_POINTS["common"],
                "is_secret": False,
                "time_limit_minutes": random.choice([15, 30]) if timed else None,
                "generated_by": "fallback",
            })
        others = [o for o in players if o["id"] != p["id"]]
        if others and secret_n:
            target = random.choice(others)
            out.append({
                "assignee_user_id": p["id"],
                "title": random.choice(_SECRET).format(target=target["name"]),
                "description": "Only you can see this. Pull it off without them noticing.",
                "type": "secret", "rarity": "rare",
                "points": RARITY_POINTS["rare"], "is_secret": True,
                "time_limit_minutes": None, "generated_by": "fallback",
            })

    # Group missions — count driven by quest type (0 for solo, more for together).
    if group_n > 0:
        pool = _GROUP * (group_n // len(_GROUP) + 1)
        for title, desc in random.sample(pool, min(group_n, len(pool))):
            out.append({
                "assignee_user_id": None,
                "title": title.format(dest=dest), "description": desc.format(dest=dest),
                "type": "group", "rarity": "legendary",
                "points": RARITY_POINTS["legendary"], "is_secret": False,
                "time_limit_minutes": None, "generated_by": "fallback",
            })

    for place, player in zip(places[:2], players):
        out.append({
            "assignee_user_id": player["id"],
            "title": f"Check in at {place['name']}",
            "description": place.get("category") or f"A real local spot near {dest}.",
            "type": "solo", "rarity": "common",
            "points": RARITY_POINTS["common"], "is_secret": False,
            "time_limit_minutes": None, "business_name": place["name"],
            "generated_by": "fallback",
        })
    return out
