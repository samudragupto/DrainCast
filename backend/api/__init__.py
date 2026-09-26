"""Blueprint registration for the DrainCast REST API."""

from flask import Blueprint

from api import routes_drainage, routes_nowcast, routes_prediction, routes_roads, routes_routing, routes_terrain
from utils.constants import RISK_COLORS, RISK_LABELS, TIME_HORIZONS

api_bp = Blueprint("api", __name__, url_prefix="/api")

api_bp.register_blueprint(routes_terrain.terrain_bp)
api_bp.register_blueprint(routes_drainage.drainage_bp)
api_bp.register_blueprint(routes_roads.roads_bp)
api_bp.register_blueprint(routes_prediction.prediction_bp)
api_bp.register_blueprint(routes_nowcast.nowcast_bp)
api_bp.register_blueprint(routes_routing.routing_bp)


@api_bp.get("/meta")
def meta():
    """Shared taxonomy so any client can render risk consistently."""
    return {
        "ok": True,
        "riskLevels": RISK_LABELS,
        "riskColors": RISK_COLORS,
        "timeHorizons": TIME_HORIZONS,
    }
