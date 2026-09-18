// Locations are surfaced as Google Maps links (no Maps grounding API needed).
// Given a place name (+ optional address) from the backend/LLM, build a search
// URL the user taps to view, navigate, or verify the spot.

export function mapsLink(name?: string | null, address?: string | null): string | null {
  const parts = [name, address].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(parts.join(", "))
  );
}
