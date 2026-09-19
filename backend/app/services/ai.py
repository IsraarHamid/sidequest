"""Mission engine — the core magic.

The prompt is `backend/mission_generator.md`: it owns every rule about legs,
checkpoints, locations, coordinates, map links, safety and scoring. This module
only fills in the trip, sends it to the LLM, and shapes the answer.

Two entry points:
  generate_trip_plan() -> the full plan exactly as the prompt describes it
                          (legs / missions / shared_checkpoints / scoring), or None.
  generate_missions()  -> that plan flattened into the mission dicts the store and
                          API already speak (BACKEND.md §8) — one mission per
                          checkpoint, one group mission per shared checkpoint.

Defensive by design:
  1. Claude on Replicate if REPLICATE_API_KEY is set, else Gemini if keyed.
  2. Each provider gets one retry on a failed call or invalid JSON.
  3. Nothing works -> the hardcoded fallback deck, so a live demo never breaks.
"""
import json
from collections.abc import Callable
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.config import get_settings
from app.data.fallback_missions import RARITY_POINTS, build_fallback_missions

PROMPT_PATH = Path(__file__).resolve().parents[2] / "mission_generator.md"

# The plan is long (legs x members x checkpoints, each with coords and two URLs).
# A truncated response is invalid JSON, so give the model room.
MAX_TOKENS = 8000

# Everything above this line in mission_generator.md is a note to us, not to the model.
_PROMPT_DIVIDER = "\n---\n"


# ---- Prompt ---------------------------------------------------------------

def _load_template() -> str:
    text = PROMPT_PATH.read_text()
    _, sep, body = text.partition(_PROMPT_DIVIDER)
    return body.strip() if sep else text


def _members_for_prompt(players: list[dict]) -> list[dict]:
    """Map our Preferences shape onto the member shape the prompt expects.

    players: [{"id", "name", "preferences": {interests, diet, adventure_level,
               budget, free_text}}, ...]
    """
    members = []
    for p in players:
        prefs = p.get("preferences") or {}
        preferences = list(prefs.get("interests") or [])
        if prefs.get("free_text"):
            preferences.append(prefs["free_text"])
        constraints = []
        if prefs.get("diet"):
            constraints.append(prefs["diet"])
        if prefs.get("adventure_level"):
            constraints.append(f"adventure level: {prefs['adventure_level']}")
        members.append({
            "name": p["name"],
            "preferences": preferences,
            "dislikes": list(prefs.get("dislikes") or []),
            "constraints": constraints,
            "budget_per_person": prefs.get("budget"),
        })
    return members


def build_prompt(trip: dict, players: list[dict]) -> str:
    """Fill every {{placeholder}} in mission_generator.md for this trip."""
    departure = trip.get("departure") or trip.get("start_time") or trip.get("start_date")
    arrive_by = trip.get("arrive_by") or trip.get("ends_at") or trip.get("end_date")
    fills = {
        "{{origin}}": trip.get("origin") or "",
        "{{destination}}": trip.get("destination") or "",
        "{{departure_datetime}}": str(departure or ""),
        "{{arrival_deadline}}": str(arrive_by or ""),
        "{{travel_mode}}": trip.get("travel_mode") or "driving",
        "{{leg_count}}": str(trip.get("leg_count") or "auto"),
        "{{trip_style}}": trip.get("trip_style") or "solo",
        "{{members}}": json.dumps(_members_for_prompt(players), ensure_ascii=False),
    }
    prompt = _load_template()
    for key, value in fills.items():
        prompt = prompt.replace(key, value)
    if vibe := trip.get("vibe"):
        prompt += f"\n\nThe group describes the vibe they want as: {vibe}"
    return prompt


# ---- Providers -------------------------------------------------------------

def _call_replicate(prompt: str) -> str:
    import replicate

    settings = get_settings()
    client = replicate.Client(api_token=settings.replicate_api_key)
    output = client.run(settings.replicate_model,
                        input={"prompt": prompt, "max_tokens": MAX_TOKENS})
    # run() streams back an iterator of text chunks for language models.
    return output if isinstance(output, str) else "".join(str(c) for c in output)


def _call_gemini(prompt: str) -> str:
    from google import genai
    from google.genai import types

    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key,
                          http_options=types.HttpOptions(timeout=120000))
    resp = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            max_output_tokens=MAX_TOKENS,
        ),
    )
    return getattr(resp, "text", "")


def _providers() -> list[tuple[str, Callable[[str], str]]]:
    settings = get_settings()
    providers = []
    if settings.ai_enabled:
        providers.append(("replicate", _call_replicate))
    if settings.gemini_api_key:
        providers.append(("gemini", _call_gemini))
    return providers


# ---- Parsing ---------------------------------------------------------------

def _parse_plan(raw: str) -> dict:
    """Pull the JSON object out of the reply, fences and stray prose included."""
    text = (raw or "").strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object in the model response")
    return json.loads(text[start:end + 1])


def _validate_plan(plan: dict, players: list[dict]) -> dict:
    """Enforce the structural promises at the bottom of mission_generator.md."""
    legs = {leg["leg_number"] for leg in plan.get("legs", [])}
    if not legs:
        raise ValueError("plan has no legs")
    missions = plan.get("missions") or []
    if not missions and not plan.get("shared_checkpoints"):
        raise ValueError("plan has no missions or shared checkpoints")

    names = {p["name"].lower() for p in players}
    got = [m.get("member", "").lower() for m in missions]
    if len(got) != len(set(got)) or set(got) - names:
        raise ValueError(f"plan members {got} do not match players {sorted(names)}")

    for m in missions:
        for cp in m.get("checkpoints", []):
            if cp.get("leg_number") not in legs:
                raise ValueError(f"checkpoint {cp.get('name')!r} references unknown leg")
    return plan


# ---- Flatten plan -> mission dicts (BACKEND.md §8) ----------------------------

def _rarity_for(points: int) -> str:
    if points >= RARITY_POINTS["legendary"]:
        return "legendary"
    if points >= RARITY_POINTS["rare"]:
        return "rare"
    return "common"


def _checkpoint_description(cp: dict) -> str:
    """One readable blurb: address, then the reasoning, then price/hours if known."""
    bits = [cp.get("address"), cp.get("why_it_fits") or cp.get("why_it_works_for_everyone")]
    price = cp.get("price") or {}
    if price.get("amount") is not None:
        bits.append(f"~{price.get('currency') or ''}{price['amount']}".strip())
    elif price.get("note"):
        bits.append(price["note"])
    if cp.get("operating_hours"):
        bits.append(f"Open {cp['operating_hours']}")
    if cp.get("verify"):
        bits.append("Details unverified — double-check before you go.")
    return " · ".join(b for b in bits if b)


def flatten_plan(plan: dict, players: list[dict]) -> list[dict]:
    """Turn a mission_generator.md plan into store-ready mission dicts.

    Every member checkpoint becomes that member's solo mission; every shared
    checkpoint becomes one group mission. `business_name` carries the checkpoint
    name so the start endpoint can link it to a business row.
    """
    name_to_id = {p["name"].lower(): p["id"] for p in players}
    out: list[dict] = []

    for mission in plan.get("missions", []):
        user_id = name_to_id.get((mission.get("member") or "").lower())
        for cp in mission.get("checkpoints", []):
            points = int(cp.get("points") or RARITY_POINTS["common"])
            out.append({
                "assignee_user_id": user_id,
                "title": cp.get("activity") or cp.get("name"),
                "description": _checkpoint_description(cp),
                "type": "solo",
                "rarity": _rarity_for(points),
                "points": points,
                "is_secret": False,
                "business_name": cp.get("name"),
                "generated_by": "ai",
                "_order": (cp.get("leg_number", 0), cp.get("sequence", 0)),
            })

    for cp in plan.get("shared_checkpoints", []):
        points = int(cp.get("team_points") or RARITY_POINTS["legendary"])
        description = _checkpoint_description(cp)
        photo = cp.get("team_photo_spot") or {}
        if photo.get("description"):
            description += f" · Team photo: {photo['description']}"
        out.append({
            "assignee_user_id": None,
            "title": cp.get("activity") or cp.get("name"),
            "description": description,
            "type": "group",
            "rarity": _rarity_for(points),
            "points": points,
            "is_secret": False,
            "business_name": cp.get("name"),
            "generated_by": "ai",
            "_order": (cp.get("leg_number", 0), 0),
        })

    out.sort(key=lambda m: m.pop("_order"))
    if not out:
        raise ValueError("plan produced no missions")
    return out


def plan_checkpoints(plan: dict) -> list[dict]:
    """Every distinct location in the plan, shaped for store.save_businesses()."""
    seen: dict[str, dict] = {}
    checkpoints = [cp for m in plan.get("missions", []) for cp in m.get("checkpoints", [])]
    checkpoints += plan.get("shared_checkpoints", [])
    for cp in checkpoints:
        name = cp.get("name")
        if not name or name in seen:
            continue
        coords = cp.get("coordinates") or {}
        seen[name] = {
            "name": name,
            "category": cp.get("category"),
            "address": cp.get("address"),
            "rating": None,
            "lat": coords.get("lat"),
            "lng": coords.get("lng"),
        }
    return list(seen.values())


# ---- Public API -------------------------------------------------------------

def generate_trip_plan(trip: dict, players: list[dict]) -> dict | None:
    """Run mission_generator.md for this trip and return the parsed plan.

    players: [{"id", "name", "preferences": {...}}, ...]
    Returns None when no provider is configured or every attempt fails.
    """
    providers = _providers()
    if not providers:
        return None
    prompt = build_prompt(trip, players)
    for name, call in providers:
        for attempt in range(2):  # try once, retry once
            try:
                plan = _validate_plan(_parse_plan(call(prompt)), players)
                plan["generated_at"] = datetime.now(timezone.utc).isoformat()
                plan["generated_by"] = name
                return plan
            except Exception as exc:  # noqa: BLE001 - demo safety net
                print(f"[ai] {name} attempt {attempt + 1} failed: {exc}")
    return None


def generate_missions(trip: dict, players: list[dict],
                      counts: dict | None = None,
                      plan: dict | None = None) -> list[dict]:
    """Mission dicts for store.save_missions().

    Pass `plan` if you already generated one (the start endpoint does, so it can
    save the rich plan alongside the flat missions without a second LLM call).
    Otherwise this generates it. No plan -> the fallback deck, which is the only
    path that still produces secret or timed missions.
    """
    counts = counts or {"solo_per_player": 2, "group": 1, "secret_per_player": 1}
    plan = plan or generate_trip_plan(trip, players)
    if plan:
        try:
            return _apply_timers(flatten_plan(plan, players))
        except Exception as exc:  # noqa: BLE001
            print(f"[ai] could not flatten plan: {exc}")

    print("[ai] falling back to hardcoded mission deck")
    return _apply_timers(build_fallback_missions(trip, players, counts))


def _apply_timers(missions: list[dict]) -> list[dict]:
    """Convert an optional `time_limit_minutes` into an absolute `expires_at`.

    Plan missions never carry a limit; the fallback deck gives a few. The clock
    starts now (when missions are generated at trip start).
    """
    now = datetime.now(timezone.utc)
    for m in missions:
        minutes = m.pop("time_limit_minutes", None)
        m["expires_at"] = now + timedelta(minutes=int(minutes)) if minutes else None
    return missions
