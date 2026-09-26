"""Ward & terrain endpoints."""

from flask import Blueprint, jsonify

from core.terrain_analyzer import terrain_summary
from utils.helpers import load_json

terrain_bp = Blueprint("terrain", __name__, url_prefix="/terrain")
ward_bp = Blueprint("ward", __name__, url_prefix="/ward")


@ward_bp.get("/info")
def ward_info():
    """Velachery ward details: demography, drainage context, flood history."""
    info = load_json("ward_info.json")
    boundary = load_json("ward_boundary.json")
    return jsonify(
        {
            "ok": True,
            "ward": info,
            "boundary": boundary,
        }
    )


@terrain_bp.get("/analysis")
def terrain_analysis():
    """DEM-derived elevation, slope and terrain classification per zone."""
    roads = load_json("velachery_roads.json")["roads"]
    summary = terrain_summary(roads)
    zones = summary.pop("zones")
    return jsonify(
        {
            "ok": True,
            "summary": summary,
            "zones": zones,
        }
    )
