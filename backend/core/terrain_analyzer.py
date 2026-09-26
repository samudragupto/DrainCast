"""Terrain & elevation analysis: zone lookup, retention factors and summaries."""

from functools import lru_cache

from utils.constants import TERRAIN_INFLUENCE, TERRAIN_RETENTION
from utils.helpers import load_json


@lru_cache(maxsize=1)
def _zones() -> dict:
    """areaName → terrain zone record."""
    zones = load_json("dem_terrain.json")["zones"]
    return {z["areaName"]: z for z in zones}


def zone_for_area(area_name: str) -> dict:
    """Terrain zone record for a locality (defaults to Moderately Low)."""
    return _zones().get(area_name) or {
        "areaName": area_name,
        "terrainClass": "Moderately Low",
        "avgElevationM": 7.0,
        "avgSlopeDeg": 1.0,
        "reason": "Zone modelled at ward-average elevation.",
    }


def terrain_class(area_name: str) -> str:
    return zone_for_area(area_name)["terrainClass"]


def retention_factor(area_name: str) -> float:
    """Share of excess water retained on the surface after terrain effects."""
    return TERRAIN_RETENTION[terrain_class(area_name)]


def terrain_influence(area_name: str) -> str:
    return TERRAIN_INFLUENCE[terrain_class(area_name)]


def elevation_m(area_name: str) -> float:
    return zone_for_area(area_name)["avgElevationM"]


def terrain_summary(roads: list) -> dict:
    """Aggregated terrain picture used by /api/terrain/analysis."""
    zones = load_json("dem_terrain.json")["zones"]
    nodes = load_json("drainage_nodes.json")["nodes"]

    counts: dict = {}
    for road in roads:
        cls = terrain_class(road["areaName"])
        counts[cls] = counts.get(cls, 0) + 1
    dominant = max(counts.items(), key=lambda kv: kv[1])[0]

    return {
        "dominantClass": dominant,
        "classCounts": counts,
        "elevationMinM": min(n["elevationM"] for n in nodes),
        "elevationMaxM": max(n["elevationM"] for n in nodes),
        "slopeMinDeg": min(z["avgSlopeDeg"] for z in zones),
        "slopeMaxDeg": max(z["avgSlopeDeg"] for z in zones),
        "zoneCount": len(zones),
        "keyReason": "Lower elevation zones tend to accumulate surface runoff "
        "faster due to gravity flow.",
        "zones": zones,
    }
