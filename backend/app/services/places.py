"""Real-place discovery via Gemini + Google Maps grounding.

Returns real, currently-operating businesses/POIs along a route so missions can
reference verifiable places (name / address / rating / coords). This powers the
small-business-checkpoint feature and kills the "AI invented a fake place" risk.

Fully OPTIONAL and defensive:
- No GEMINI_API_KEY  -> returns [] (mission engine proceeds without real places).
- SDK missing / API error / bad JSON -> returns [] (never crashes a request).

Free tier is ample for the demo (Maps grounding ~5000 free prompts/month).
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
        f"Find up to {limit} real, currently-operating local places {where} that "
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
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        tools = [types.Tool(google_maps=types.GoogleMaps())]
        resp = client.models.generate_content(
            model=settings.gemini_model,
            contents=_build_prompt(origin, destination, vibe, interests or [], limit),
            config=types.GenerateContentConfig(tools=tools),
        )
        return _parse_places(getattr(resp, "text", ""), limit)
    except Exception as exc:  # noqa: BLE001 - never break a request over places
        print(f"[places] Gemini Maps grounding unavailable: {exc}")
        return []
