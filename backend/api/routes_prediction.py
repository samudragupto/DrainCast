"""Flood prediction endpoints (Rainfall–Drainage–Terrain coupling)."""

from flask import Blueprint, jsonify, request

from core.flood_engine import predict_network
from utils.constants import RAINFALL_MAX, RAINFALL_MIN, TIME_HORIZONS
from utils.helpers import error_response

prediction_bp = Blueprint("prediction", __name__, url_prefix="/predict")


@prediction_bp.post("/flood-risk")
def flood_risk():
    """Street-level flood prediction for the whole ward.

    Body:
      rainfall_intensity_mm_hr : number (5–80, required)
      time_horizon            : "now" | "1h" | "2h" | "3h" (default "now")
    """
    payload = request.get_json(silent=True) or {}
    intensity = payload.get("rainfall_intensity_mm_hr")
    horizon = payload.get("time_horizon", "now")

    if not isinstance(intensity, (int, float)):
        return error_response("rainfall_intensity_mm_hr (number) is required")
    if not RAINFALL_MIN <= intensity <= RAINFALL_MAX:
        return error_response(f"rainfall_intensity_mm_hr must be between {RAINFALL_MIN} and {RAINFALL_MAX}")
    if horizon not in TIME_HORIZONS:
        return error_response("time_horizon must be one of: now, 1h, 2h, 3h")

    return jsonify({"ok": True, "prediction": predict_network(float(intensity), horizon).to_dict()})


@prediction_bp.get("/analytics/risk-summary")
def risk_summary():
    """Aggregated risk statistics across the 0–3 hour window.

    Query params: intensity_mm_hr (default 40)
    """
    intensity = request.args.get("intensity_mm_hr", type=float, default=40.0)
    if not RAINFALL_MIN <= intensity <= RAINFALL_MAX:
        return error_response(f"intensity_mm_hr must be between {RAINFALL_MIN} and {RAINFALL_MAX}")

    prediction = predict_network(intensity, "now")
    series = prediction.horizonSeries

    return jsonify(
        {
            "ok": True,
            "params": {"intensityMmHr": intensity},
            "current": {
                "horizon": prediction.horizon,
                "distribution": prediction.distribution,
                "distributionPct": prediction.distributionPct,
                "totals": prediction.totals,
                "maxDepthCm": prediction.maxDepthCm,
                "atRiskCount": prediction.atRiskCount,
            },
            "horizons": [
                {
                    "horizon": s.horizon,
                    "label": s.label,
                    "effectiveRainfallMmHr": s.effectiveRainfallMmHr,
                    "distribution": s.distribution,
                    "highCount": s.highCount,
                    "severeCount": s.severeCount,
                    "maxDepthCm": s.maxDepthCm,
                }
                for s in series
            ],
            "drainage": prediction.drainage,
        }
    )
