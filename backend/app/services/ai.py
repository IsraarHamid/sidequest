"""Mission engine — the core magic.

generate_missions() asks Claude for a personalised, funny mission deck and
returns validated mission dicts. It is defensive by design:
  1. If no ANTHROPIC_API_KEY -> use the fallback deck.
  2. If the AI call fails or returns invalid JSON -> retry once, then fallback.

The output shape is the contract in BACKEND.md §8. Missions returned here map
directly to store.save_missions().
"""
import json

from app.config import get_settings
from app.data.fallback_missions import RARITY_POINTS, build_fallback_missions

SYSTEM_PROMPT = """You are the game master for TRIP QUEST, a multiplayer travel game.
You generate playful "missions" players complete during a road trip / journey.

Rules:
- Personalise each player's missions to their preferences.
- Mix: several SOLO missions per player, ONE overall GROUP mission, and a SECRET
  social mission per player that playfully targets ANOTHER named player.
- Missions must be SAFE, LEGAL, doable in-journey, and FUNNY. Humour is the point.
- Points scale with rarity: common~100, rare~250, legendary~500.
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
      "is_secret": <bool>
    }
  ]
}"""


def _build_user_prompt(trip: dict, players: list[dict], counts: dict) -> str:
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
            "generated_by": "ai",
        })
    if not out:
        raise ValueError("AI returned no missions")
    return out


def _call_claude(trip: dict, players: list[dict], counts: dict) -> str:
    from anthropic import Anthropic

    settings = get_settings()
    client = Anthropic(api_key=settings.anthropic_api_key)
    msg = client.messages.create(
        model=settings.claude_model,
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": _build_user_prompt(trip, players, counts)}],
    )
    # Concatenate text blocks
    return "".join(block.text for block in msg.content if block.type == "text")


def generate_missions(trip: dict, players: list[dict],
                      counts: dict | None = None) -> list[dict]:
    """players: [{"id", "name", "preferences": {...}}, ...]"""
    counts = counts or {"solo_per_player": 2, "group": 1, "secret_per_player": 1}
    settings = get_settings()

    if not settings.ai_enabled:
        return build_fallback_missions(trip, players, counts)

    for attempt in range(2):  # try once, retry once
        try:
            raw = _call_claude(trip, players, counts)
            return _parse_and_map(raw, players)
        except Exception as exc:  # noqa: BLE001 - demo safety net
            print(f"[ai] mission generation attempt {attempt + 1} failed: {exc}")

    print("[ai] falling back to hardcoded mission deck")
    return build_fallback_missions(trip, players, counts)
