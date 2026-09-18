"""Badge catalog + award rules (pure logic; the store does the DB writes).

Icons are lucide names the frontend passport maps to components.
"""
BADGE_CATALOG = [
    {"code": "first_mission",   "name": "First mission", "icon": "Zap"},
    {"code": "five_missions",   "name": "High five",     "icon": "Users"},
    {"code": "first_to_finish", "name": "Speed demon",   "icon": "Zap"},
    {"code": "group_complete",  "name": "Team player",   "icon": "Users"},
    {"code": "photo_pro",       "name": "Shutterbug",    "icon": "Camera"},
]
BADGE_BY_CODE = {b["code"]: b for b in BADGE_CATALOG}


def earned_codes(mission: dict, completion: dict, completion_count: int) -> list[str]:
    """Which badge codes this completion qualifies the user for."""
    codes = []
    if completion_count == 1:
        codes.append("first_mission")
    if completion_count >= 5:
        codes.append("five_missions")
    if completion.get("is_first"):
        codes.append("first_to_finish")
    if mission.get("type") == "group":
        codes.append("group_complete")
    if completion.get("photo_url"):
        codes.append("photo_pro")
    return codes
