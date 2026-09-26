"""Flood-aware routing endpoints."""

from flask import Blueprint, jsonify, request

from core.routing_engine import evaluate_route
from utils.constants import RAINFALL_MAX, RAINFALL_MIN, TIME_HORIZONS
from utils.helpers import error_response

routing_bp = Blueprint("routing", __name__, url_prefix="/routing")

# Origin/destination options (mirrors the frontend's Velachery location list).
LOCATIONS = [
    {"id": "phoenix", "name": "Phoenix Marketcity", "area": "Velachery", "position": [12.9916, 80.2109]},
    {"id": "checkpost", "name": "Velachery Check Post", "area": "Velachery", "position": [12.9795, 80.2209]},
    {"id": "station", "name": "Velachery MRTS Station", "area": "Velachery", "position": [12.9832, 80.2182]},
    {"id": "bypass", "name": "Taramani 100 Ft Bypass", "area": "Taramani Interface", "position": [12.9902, 80.2072]},
    {"id": "ramnagar", "name": "Ram Nagar Main Road", "area": "Ram Nagar", "position": [12.9701, 80.2235]},
    {"id": "grandmall", "name": "Grand Mall", "area": "Velachery", "position": [12.9768, 80.2266]},
]


def _resolve_location(value):
    """Accept a location id or a raw [lat, lng] pair."""
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return [float(value[0]), float(value[1])], None
    if isinstance(value, str):
        for loc in LOCATIONS:
            if loc["id"] == value:
                return loc["position"], None
        return None, f"unknown location id: {value}"
    return None, "start_id and destination_id are required (location id or [lat, lng])"


@routing_bp.get("/locations")
def locations():
    """Origin/destination options for the route evaluator."""
    return jsonify({"ok": True, "count": len(LOCATIONS), "locations": LOCATIONS})


@routing_bp.post("/flood-aware")
def flood_aware():
    """Evaluate a flood-aware route against the conventional shortest path.

    Body:
      start_id    : location id or [lat, lng] (required)
      destination_id : location id or [lat, lng] (required)
      rainfall_intensity_mm_hr : number 5–80 (default 40)
      time_horizon : now | 1h | 2h | 3h (default now)
    """
    payload = request.get_json(silent=True) or {}

    start_coord, err = _resolve_location(payload.get("start_id"))
    if err:
        return error_response(err)
    dest_coord, err = _resolve_location(payload.get("destination_id"))
    if err:
        return error_response(err)

    intensity = payload.get("rainfall_intensity_mm_hr", 40)
    if not isinstance(intensity, (int, float)) or not RAINFALL_MIN <= intensity <= RAINFALL_MAX:
        return error_response(
            f"rainfall_intensity_mm_hr must be a number between {RAINFALL_MIN} and {RAINFALL_MAX}"
        )

    horizon = payload.get("time_horizon", "now")
    if horizon not in TIME_HORIZONS:
        return error_response("time_horizon must be one of: now, 1h, 2h, 3h")

    result = evaluate_route(start_coord, dest_coord, float(intensity), horizon)
    return jsonify({"ok": True, **result})
