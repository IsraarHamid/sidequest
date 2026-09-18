"""Location helpers.

We surface locations as Google Maps links rather than calling a Maps grounding
API (free, no billing). The LLM gives us a place name + address; we turn that
into a clickable search link the user taps to view/navigate/verify.
"""
from urllib.parse import quote_plus


def maps_link(name: str | None, address: str | None = None) -> str | None:
    """Google Maps search URL for a place. None if we have nothing to search."""
    parts = [p for p in (name, address) if p]
    if not parts:
        return None
    query = ", ".join(parts)
    return "https://www.google.com/maps/search/?api=1&query=" + quote_plus(query)
