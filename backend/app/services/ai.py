"""Mission engine — the core magic.

generate_missions() asks Claude for a personalised, funny mission deck and
returns validated mission dicts. It is defensive by design:
  1. If no ANTHROPIC_API_KEY -> use the fallback deck.
  2. If the AI call fails or returns invalid JSON -> retry once, then fallback.

The output shape is the contract in BACKEND.md §8. Missions returned here map
directly to store.save_missions().
"""
import json
from datetime import datetime, timedelta, timezone

from app.config import get_settings
from app.data.fallback_missions import RARITY_POINTS, build_fallback_missions

SYSTEM_PROMPT = """You are the game master for SideQuest, a multiplayer travel game.
You generate playful "missions" players complete during a road trip / journey.

Rules:
- Personalise each player's missions to their preferences.
- Mix: several SOLO missions per player, ONE overall GROUP mission, and a SECRET
  social mission per player that playfully targets ANOTHER named player.
- Missions must be SAFE, LEGAL, doable in-journey, and FUNNY. Humour is the point.
- Points scale with rarity: common~100, rare~250, legendary~500.
- MOST missions have NO time limit (omit time_limit_minutes / set it null). Give a
  time limit to only a FEW missions (roughly 1 in 4) where urgency adds fun — a
  "quick! do it now" challenge. Timed missions can be worth a bit more.
- If the input includes a "places" list of REAL local businesses, base some
  missions at those places and set "business_name" to EXACTLY one of the provided
  names (copy it verbatim). NEVER invent a place name. Missions that aren't tied to
  a specific place omit business_name (or set it null).
- Return ONLY valid JSON. No prose, no markdown fences.

Return this exact JSON shape:
{
  "missions": [
    {
      "assignee_name": "<player name, or omit/null for a group mission>",
      "title": "<short catchy mission>",
      "description": "<one line, optional>",
      "type": "solo" | "group" | "secret",
      "rarity": "common" | "rare" | "legendary",
      "points": <int>,
      "is_secret": <bool>,
      "time_limit_minutes": <int or null — null for most missions>,
      "business_name": "<one of the provided real place names, or null>"
    }
  ]
}"""


def _build_user_prompt(trip: dict, players: list[dict], counts: dict,
                       places: list[dict] | None = None) -> str:
    return json.dumps({
        "trip": {
            "origin": trip.get("origin"),
            "destination": trip.get("destination"),
            "vibe": trip.get("vibe"),
        },
        "players": [
            {"name": p["name"], "preferences": p.get("preferences", {})}
            for p in players
        ],
        "places": [
            {"name": p["name"], "category": p.get("category")}
            for p in (places or [])
        ],
        "counts": counts,
    }, ensure_ascii=False)


def _parse_and_map(raw_text: str, players: list[dict]) -> list[dict]:
    """Parse Claude JSON and map assignee_name -> assignee_user_id."""
    data = json.loads(raw_text)
    name_to_id = {p["name"].lower(): p["id"] for p in players}
    out: list[dict] = []
    for m in data["missions"]:
        name = (m.get("assignee_name") or "").lower()
        rarity = m.get("rarity", "common")
        out.append({
            "assignee_user_id": name_to_id.get(name),  # None => group mission
            "title": m["title"],
            "description": m.get("description"),
            "type": m.get("type", "solo"),
            "rarity": rarity,
            "points": int(m.get("points", RARITY_POINTS.get(rarity, 100))),
            "is_secret": bool(m.get("is_secret", m.get("type") == "secret")),
            "time_limit_minutes": m.get("time_limit_minutes"),
            "business_name": m.get("business_name"),
            "generated_by": "ai",
        })
    if not out:
        raise ValueError("AI returned no missions")
    return out


def _apply_timers(missions: list[dict]) -> list[dict]:
    """Convert an optional `time_limit_minutes` into an absolute `expires_at`.

    Missions without a time limit get expires_at=None and never expire.
    The clock starts now (when missions are generated at trip start).
    """
    now = datetime.now(timezone.utc)
    for m in missions:
        minutes = m.pop("time_limit_minutes", None)
        m["expires_at"] = now + timedelta(minutes=int(minutes)) if minutes else None
    return missions


def _call_claude(trip: dict, players: list[dict], counts: dict,
                 places: list[dict] | None) -> str:
    from anthropic import Anthropic

    settings = get_settings()
    client = Anthropic(api_key=settings.anthropic_api_key)
    msg = client.messages.create(
        model=settings.claude_model,
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user",
                   "content": _build_user_prompt(trip, players, counts, places)}],
    )
    # Concatenate text blocks
    return "".join(block.text for block in msg.content if block.type == "text")


def generate_missions(trip: dict, players: list[dict],
                      counts: dict | None = None,
                      places: list[dict] | None = None) -> list[dict]:
    """players: [{"id", "name", "preferences": {...}}, ...]
    places: optional real businesses (from services.places) to base missions at.
    """
    counts = counts or {"solo_per_player": 2, "group": 1, "secret_per_player": 1}
    settings = get_settings()

    if not settings.ai_enabled:
        return _apply_timers(build_fallback_missions(trip, players, counts, places))

    for attempt in range(2):  # try once, retry once
        try:
            raw = _call_claude(trip, players, counts, places)
            return _apply_timers(_parse_and_map(raw, players))
        except Exception as exc:  # noqa: BLE001 - demo safety net
            print(f"[ai] mission generation attempt {attempt + 1} failed: {exc}")

    print("[ai] falling back to hardcoded mission deck")
    return _apply_timers(build_fallback_missions(trip, players, counts, places))
