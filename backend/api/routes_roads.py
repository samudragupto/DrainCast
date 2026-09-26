"""Road network endpoints."""

from flask import Blueprint, jsonify, request

from core.flood_engine import predict_road
from utils.constants import RISK_COLORS, RISK_LABELS, TIME_HORIZONS
from utils.helpers import error_response, load_json

roads_bp = Blueprint("roads", __name__, url_prefix="/roads")


@roads_bp.get("")
def list_roads():
    """All road segments; optionally enriched with live predictions.

    Query params:
      intensity_mm_hr — rainfall intensity (5–80, default 40)
      horizon         — now | 1h | 2h | 3h
      risk            — filter by risk level
    """
    intensity = request.args.get("intensity_mm_hr", type=float, default=40.0)
    horizon = request.args.get("horizon", "now")
    risk_filter = request.args.get("risk")

    if not 5 <= intensity <= 80:
        return error_response("intensity_mm_hr must be between 5 and 80")
    if horizon not in TIME_HORIZONS:
        return error_response("horizon must be one of: now, 1h, 2h, 3h")

    meta = TIME_HORIZONS[horizon]
    effective = intensity * meta["multiplier"]

    roads = load_json("velachery_roads.json")["roads"]
    enriched = []
    for road in roads:
        prediction = predict_road(road, effective, meta["label"]).to_dict()
        entry = {k: road[k] for k in ("id", "roadName", "areaName", "roadType", "roadLengthM")}
        entry["prediction"] = prediction
        enriched.append(entry)

    if risk_filter:
        if risk_filter not in RISK_LABELS:
            return error_response(f"risk must be one of: {', '.join(RISK_LABELS)}")
        enriched = [e for e in enriched if e["prediction"]["risk"] == risk_filter]

    return jsonify(
        {
            "ok": True,
            "count": len(enriched),
            "params": {
                "intensityMmHr": intensity,
                "horizon": horizon,
                "effectiveIntensityMmHr": effective,
            },
            "riskColors": RISK_COLORS,
            "roads": enriched,
        }
    )
