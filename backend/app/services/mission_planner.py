"""Mission planner — the rich, route-aware generator.

Uses the team's prompt in `backend/mission_generator.md` (legs → per-member
checkpoints → shared checkpoints → scoring → summary), sends it to the LLM, and
returns the parsed plan with a Google Maps link added to every location.

Currently calls Gemini (we have a working free-tier key). It's provider-agnostic
in spirit — swap `_call_llm` for Claude when that key is available.

Defensive: if no key, SDK missing, quota, or bad JSON -> returns None, and the
caller falls back to the simple mission engine (services/ai.py).
"""
import json
from pathlib import Path

from app.config import get_settings
from app.locations import maps_link

PROMPT_PATH = Path(__file__).resolve().parents[2] / "mission_generator.md"


def _fill_prompt(trip: dict, members: list[dict], travel_mode: str) -> str:
    tmpl = PROMPT_PATH.read_text()
    fills = {
        "{{origin}}": trip.get("origin") or "",
        "{{destination}}": trip.get("destination") or "",
        "{{departure_datetime}}": str(trip.get("departure") or trip.get("start_time") or ""),
        "{{arrival_deadline}}": str(trip.get("arrive_by") or trip.get("ends_at") or ""),
        "{{travel_mode}}": travel_mode,
        "{{group_size}}": str(len(members)),
        "{{members}}": json.dumps(members, ensure_ascii=False),
    }
    for k, v in fills.items():
        tmpl = tmpl.replace(k, v)
    return tmpl


def _parse(text: str) -> dict:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t[:4].lower() == "json":
            t = t[4:]
    s, e = t.find("{"), t.rfind("}")
    if s != -1 and e != -1:
        t = t[s:e + 1]
    return json.loads(t)


def _add_map_links(plan: dict) -> dict:
    """Attach a Google Maps link to every checkpoint / shared location."""
    for m in plan.get("missions", []):
        for cp in m.get("checkpoints", []):
            cp["maps_url"] = maps_link(cp.get("name"), cp.get("address"))
    for c in plan.get("shared_checkpoints", []):
        c["maps_url"] = maps_link(c.get("name"), c.get("address"))
    return plan


def _call_llm(prompt: str) -> str:
    settings = get_settings()
    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(timeout=60000),
    )
    resp = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    return getattr(resp, "text", "")


def generate_plan(trip: dict, members: list[dict],
                  travel_mode: str = "driving") -> dict | None:
    """members: [{name, preferences[], dislikes[], constraints[], budget_per_person}]"""
    settings = get_settings()
    if not settings.gemini_api_key:
        return None
    try:
        prompt = _fill_prompt(trip, members, travel_mode)
        return _add_map_links(_parse(_call_llm(prompt)))
    except Exception as exc:  # noqa: BLE001 - never crash the request
        print(f"[planner] mission plan generation failed: {exc}")
        return None
