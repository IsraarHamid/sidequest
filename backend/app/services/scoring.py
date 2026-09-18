"""Scoring rules — kept isolated so they're easy to tweak and test.

- Base points come from the mission.
- First-to-finish among the group earns a bonus (friendly competition).
- (Later) friend rankings convert to bonus points per category.
"""
FIRST_FINISH_BONUS = 0.5  # +50% for being first to complete a mission


def points_for_completion(mission: dict, is_first: bool) -> int:
    base = int(mission.get("points", 100))
    if is_first:
        return int(base * (1 + FIRST_FINISH_BONUS))
    return base
