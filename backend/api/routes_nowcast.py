"""0–3 hour nowcast endpoints."""

from flask import Blueprint, jsonify, request

from core.nowcast_engine import nowcast_series
from utils.constants import RAINFALL_MAX, RAINFALL_MIN
from utils.helpers import error_response

nowcast_bp = Blueprint("nowcast", __name__, url_prefix="/nowcast")


@nowcast_bp.get("/0-3hr")
def zero_to_three_hr():
    """Nowcast sweep across Now / +1h / +2h / +3h horizons.

    Query params: rainfall_mm_hr (default 40, range 5–80)
    """
    intensity = request.args.get("rainfall_mm_hr", type=float, default=40.0)
    if not RAINFALL_MIN <= intensity <= RAINFALL_MAX:
        return error_response(f"rainfall_mm_hr must be between {RAINFALL_MIN} and {RAINFALL_MAX}")

    return jsonify({"ok": True, **nowcast_series(intensity)})
