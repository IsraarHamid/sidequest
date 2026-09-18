"""Real-place discovery via Gemini.

Returns real businesses/POIs along a route so missions can reference verifiable
places (name / category / address). This powers the small-business-checkpoint
feature and reduces the "AI invented a fake place" risk.

Two modes (auto-selected):
- **Plain (default, FREE):** Gemini lists real, well-known places from its own
  knowledge. Works on the free tier (~requests/day per model).
- **Maps grounding (opt-in):** live Google Maps data (ratings/coords). Requires a
  BILLING-enabled Gemini project — the free tier returns 429 for grounding. Enable
  with GEMINI_USE_MAPS_GROUNDING=true once billing is on; we then try grounding
  first and fall back to plain automatically.

Fully defensive: no GEMINI_API_KEY, SDK missing, quota/errors -> returns [] and
the mission engine proceeds without real places.
"""
import json

from app.config import get_settings


def _build_prompt(origin, destination, vibe, interests, limit) -> str:
    if origin and destination:
        where = f"along the route between {origin} and {destination}"
    else:
        where = f"near {destination or origin or 'the traveller'}"
    interest_str = ", ".join(interests) if interests else \
        "food, culture, nature, quirky local spots"
    vibe_str = f" The trip vibe is: {vibe}." if vibe else ""
    return (
        f"List up to {limit} real, currently-operating local places {where} that "
        f"would make great travel-game checkpoints. Prefer small and independent "
        f"businesses. Match these interests: {interest_str}.{vibe_str} "
        "Return ONLY a JSON array (no prose, no markdown fences). Each item: "
        '{"name": string, "category": string, "address": string, '
        '"rating": number or null, "lat": number or null, "lng": number or null}.'
    )


def _parse_places(text: str, limit: int) -> list[dict]:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t[:4].lower() == "json":
            t = t[4:]
    start, end = t.find("["), t.rfind("]")
    if start != -1 and end != -1:
        t = t[start:end + 1]
    data = json.loads(t)
    out: list[dict] = []
    for p in data[:limit]:
        if not isinstance(p, dict) or not p.get("name"):
            continue
        out.append({
            "name": p["name"],
            "category": p.get("category"),
            "address": p.get("address"),
            "rating": p.get("rating"),
            "lat": p.get("lat"),
            "lng": p.get("lng"),
        })
    return out


def fetch_places_along_route(origin=None, destination=None, vibe=None,
                             interests=None, limit=8) -> list[dict]:
    settings = get_settings()
    if not settings.places_enabled:
        return []

    prompt = _build_prompt(origin, destination, vibe, interests or [], limit)
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(timeout=45000),
        )

        # Prefer live Maps grounding only when explicitly enabled (needs billing),
        # then fall back to the free plain-knowledge call.
        modes = [True, False] if settings.gemini_use_maps_grounding else [False]
        for use_grounding in modes:
            try:
                if use_grounding:
                    cfg = types.GenerateContentConfig(
                        tools=[types.Tool(google_maps=types.GoogleMaps())])
                else:
                    cfg = types.GenerateContentConfig(
                        response_mime_type="application/json")
                resp = client.models.generate_content(
                    model=settings.gemini_model, contents=prompt, config=cfg)
                places = _parse_places(getattr(resp, "text", ""), limit)
                if places:
                    return places
            except Exception as exc:  # noqa: BLE001
                mode = "grounded" if use_grounding else "plain"
                print(f"[places] Gemini ({mode}) failed: {exc}")
    except Exception as exc:  # noqa: BLE001 - never break a request over places
        print(f"[places] Gemini unavailable: {exc}")
    return []
