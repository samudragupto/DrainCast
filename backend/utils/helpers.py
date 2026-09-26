"""Small shared helpers: JSON loading, risk classification, formatting."""

import json
import math
from typing import Any

from .constants import RAINFALL_CATEGORIES, RISK_LEVELS

EARTH_RADIUS_M = 6_371_000


def load_json(filename: str) -> Any:
    """Load a data file from the configured data directory."""
    from config import DATA_DIR

    with open(DATA_DIR / filename, encoding="utf-8") as fh:
        return json.load(fh)


def classify_rainfall(mm_per_hr: float) -> str:
    for upper, label in RAINFALL_CATEGORIES:
        if mm_per_hr < upper:
            return label
    return RAINFALL_CATEGORIES[-1][1]


def classify_risk(depth_cm: float) -> str:
    if depth_cm < 2.5:
        return "safe"
    if depth_cm < 6.5:
        return "low"
    if depth_cm < 12.5:
        return "moderate"
    if depth_cm < 20.5:
        return "high"
    return "severe"


def risk_rank(risk: str) -> int:
    return RISK_LEVELS.index(risk)


def recommendation_for(risk: str) -> str:
    if risk in ("safe", "low"):
        return "Safe"
    if risk in ("moderate", "high"):
        return "Caution"
    return "Avoid During Heavy Rainfall"


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in metres between two WGS84 points."""
    to_rad = math.radians
    d_lat = to_rad(lat2 - lat1)
    d_lon = to_rad(lon2 - lon1)
    s = (
        math.sin(d_lat / 2) ** 2
        + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lon / 2) ** 2
    )
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(s))


def fmt_int(n: float) -> int:
    return int(round(n))


def error_response(message: str, status: int = 400):
    return {"ok": False, "error": message}, status
