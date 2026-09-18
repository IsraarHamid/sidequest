"""Hardcoded fallback mission deck.

Used when the AI call is unavailable or returns invalid JSON twice, so a live
demo NEVER breaks. Missions are generic-but-fun and get assigned to players.
"""
import random

RARITY_POINTS = {"common": 100, "rare": 250, "legendary": 500}

_SOLO = [
    ("Order something you can't pronounce", "Bonus points if you finish it."),
    ("Snap the most South African thing you see", "A boerie roll counts."),
    ("Find a stranger with a better story than yours", "Ask, then report back."),
    ("Photograph the view you'd never post", "The unglamorous one."),
    ("Buy something from a roadside vendor", "Support the little guy."),
    ("Learn one phrase in a local language", "Use it on the group."),
]

_GROUP = [
    ("Get the whole crew in one photo — no selfies", "Ask a stranger to take it."),
    ("Agree on the trip's official theme song", "It must be played at the next stop."),
    ("Find a spot none of you have ever been", "Prove it with a photo."),
]

_SECRET = [
    ("Secretly get {target} to say 'shame' three times", None),
    ("Convince {target} to try the weirdest item on the menu", None),
    ("Get {target} to take a photo they didn't want to take", None),
    ("Make {target} laugh so hard they snort", None),
]


def build_fallback_missions(trip: dict, players: list[dict], counts: dict,
                            places: list[dict] | None = None) -> list[dict]:
    out: list[dict] = []
    solo_n = counts.get("solo_per_player", 2)
    secret_n = counts.get("secret_per_player", 1)
    places = places or []

    for p in players:
        picks = random.sample(_SOLO, min(solo_n, len(_SOLO)))
        for title, desc in picks:
            # ~1 in 4 missions is a timed "flash" challenge; the rest are untimed.
            timed = random.random() < 0.25
            out.append({
                "assignee_user_id": p["id"],
                "title": ("⚡ " + title) if timed else title,
                "description": desc,
                "type": "solo",
                "rarity": "rare" if timed else "common",
                "points": RARITY_POINTS["rare"] if timed else RARITY_POINTS["common"],
                "is_secret": False,
                "time_limit_minutes": random.choice([15, 30]) if timed else None,
                "generated_by": "fallback",
            })
        # secret mission targeting another player
        others = [o for o in players if o["id"] != p["id"]]
        if others and secret_n:
            target = random.choice(others)
            title, _ = random.choice(_SECRET)
            out.append({
                "assignee_user_id": p["id"],
                "title": title.format(target=target["name"]),
                "type": "secret", "rarity": "rare",
                "points": RARITY_POINTS["rare"], "is_secret": True,
                "generated_by": "fallback",
            })

    # one group mission
    title, desc = random.choice(_GROUP)
    out.append({
        "assignee_user_id": None,
        "title": title, "description": desc,
        "type": "group", "rarity": "legendary",
        "points": RARITY_POINTS["legendary"], "is_secret": False,
        "generated_by": "fallback",
    })

    # real-place checkpoint missions (from Gemini Maps grounding, if available)
    for place, player in zip(places[:2], players):
        out.append({
            "assignee_user_id": player["id"],
            "title": f"Check in at {place['name']}",
            "description": place.get("category") or "A real local spot on your route.",
            "type": "solo", "rarity": "common",
            "points": RARITY_POINTS["common"], "is_secret": False,
            "business_name": place["name"],
            "generated_by": "fallback",
        })
    return out
