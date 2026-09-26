"""The Rainfall–Drainage–Terrain coupling engine.

For every road segment, at an effective rainfall intensity:

1. Surface runoff load      — rational method over the paved catchment
2. Drain capacity           — directed-graph outflow of the connected node
3. Excess water             — runoff − capacity (if positive)
4. Terrain retention        — low-lying pockets hold more of the excess
5. Water depth              — retained excess spread over the ponding area
6. Risk class               — depth bands 0–2 / 3–6 / 7–12 / 13–20 / 21–35 cm

The result is fully explainable: every number above is reported per road.
"""

from core.graph_builder import drainage_graph, graph_summary
from core.runoff_calculator import (
    catchment_area_m2,
    drain_capacity_m3h,
    inlet_count,
    surface_runoff_m3h,
)
from core.terrain_analyzer import retention_factor, terrain_class, terrain_influence, terrain_summary
from models.schemas import HorizonSummary, NetworkPrediction, RoadPrediction
from utils.constants import (
    LOCAL_POOL_FRACTION,
    RISK_COLORS,
    RISK_LABELS,
    TIME_HORIZONS,
)
from utils.helpers import (
    classify_rainfall,
    classify_risk,
    fmt_int,
    load_json,
    recommendation_for,
    risk_rank,
)


def _roads() -> list:
    return load_json("velachery_roads.json")["roads"]


def _node_name(node_id: str) -> str:
    graph = drainage_graph()
    if node_id in graph:
        return graph.nodes[node_id]["name"]
    return node_id


def _why(road: dict, p: dict, horizon_label: str) -> str:
    node_name = _node_name(road["connectedDrainNodeId"])
    load = (
        f"At an effective intensity of {p['effectiveRainfallMmHr']:.0f} mm/hr "
        f"({horizon_label} horizon), the {road['areaName']} catchment along "
        f"{road['roadName']} generates about {fmt_int(p['runoffM3Hr'])} m³/hr of "
        "surface runoff — roughly 85% of this corridor is paved, so nearly all of "
        "the rain arrives as flow instead of soaking into the ground."
    )
    if p["excessM3Hr"] <= 0:
        drain = (
            f" Its {p['inletCount']} inlets discharge into {node_name}, whose "
            f"downstream trunk is rated for {fmt_int(p['drainCapacityM3Hr'])} m³/hr "
            "— the drain keeps pace, so water clears almost as fast as it falls."
        )
    else:
        drain = (
            f" Its {p['inletCount']} inlets discharge into {node_name}, whose "
            f"downstream trunk is rated for only {fmt_int(p['drainCapacityM3Hr'])} "
            f"m³/hr. That leaves roughly {fmt_int(p['excessM3Hr'])} m³/hr of water "
            "with nowhere to go."
        )
        drain += (
            f" The corridor sits in {p['terrainInfluence'].lower()} terrain, so "
            "runoff leaves the surface slower and the excess ponds on the "
            f"carriageway to an estimated {p['waterDepthCm']:.1f} cm."
        )
    return load + drain


def predict_road(road: dict, effective_intensity: float, horizon_label: str = "Now") -> RoadPrediction:
    runoff = surface_runoff_m3h(road, effective_intensity)
    capacity = drain_capacity_m3h(road)
    excess = max(0.0, runoff - capacity)
    retention = retention_factor(road["areaName"])
    retained = excess * retention
    area = catchment_area_m2(road)
    depth_cm = (retained / (area * LOCAL_POOL_FRACTION)) * 100 if area > 0 else 0.0
    risk = classify_risk(depth_cm)

    values = {
        "effectiveRainfallMmHr": effective_intensity,
        "runoffM3Hr": runoff,
        "inletCount": inlet_count(road),
        "drainCapacityM3Hr": capacity,
        "excessM3Hr": excess,
        "terrainInfluence": terrain_influence(road["areaName"]),
        "waterDepthCm": depth_cm,
    }

    return RoadPrediction(
        roadId=road["id"],
        roadName=road["roadName"],
        areaName=road["areaName"],
        effectiveRainfallMmHr=effective_intensity,
        catchmentAreaM2=area,
        runoffM3Hr=runoff,
        inletCount=values["inletCount"],
        drainCapacityM3Hr=capacity,
        utilizationPct=(runoff / capacity) * 100 if capacity > 0 else 0.0,
        excessM3Hr=excess,
        retainedM3Hr=retained,
        waterDepthCm=depth_cm,
        risk=risk,
        riskLabel=RISK_LABELS[risk],
        terrainClass=terrain_class(road["areaName"]),
        terrainInfluence=values["terrainInfluence"],
        terrainFactor=retention,
        recommendation=recommendation_for(risk),
        why=_why(road, values, horizon_label),
    )


def _summarize_horizon(base_intensity: float, horizon: str) -> HorizonSummary:
    meta = TIME_HORIZONS[horizon]
    effective = base_intensity * meta["multiplier"]
    predictions = [predict_road(r, effective, meta["label"]) for r in _roads()]

    distribution = {level: 0 for level in RISK_LABELS}
    runoff = capacity = max_depth = 0.0
    for p in predictions:
        distribution[p.risk] += 1
        runoff += p.runoffM3Hr
        capacity += p.drainCapacityM3Hr
        max_depth = max(max_depth, p.waterDepthCm)

    return HorizonSummary(
        horizon=horizon,
        label=meta["label"],
        multiplier=meta["multiplier"],
        effectiveRainfallMmHr=effective,
        runoffM3Hr=runoff,
        capacityM3Hr=capacity,
        distribution=distribution,
        highCount=distribution["high"],
        severeCount=distribution["severe"],
        maxDepthCm=max_depth,
    )


def predict_network(intensity_mm_hr: float, horizon: str = "now") -> NetworkPrediction:
    """Full ward prediction: every road + aggregates + 0–3h horizon series."""
    meta = TIME_HORIZONS[horizon]
    effective = intensity_mm_hr * meta["multiplier"]

    roads = _roads()
    predictions = [predict_road(r, effective, meta["label"]) for r in roads]

    distribution = {level: 0 for level in RISK_LABELS}
    runoff = capacity = 0.0
    for p in predictions:
        distribution[p.risk] += 1
        runoff += p.runoffM3Hr
        capacity += p.drainCapacityM3Hr

    total = len(predictions)
    distribution_pct = {k: round(v * 100 / total) for k, v in distribution.items()}
    at_risk = [p for p in predictions if risk_rank(p.risk) >= risk_rank("moderate")]

    nodes = load_json("drainage_nodes.json")["nodes"]
    low_lying_at_risk = sum(
        1
        for p in at_risk
        if p.risk in ("high", "severe") and terrain_class(p.areaName) == "Low-Lying"
    )

    return NetworkPrediction(
        rainfallIntensityMmHr=intensity_mm_hr,
        effectiveRainfallMmHr=effective,
        rainfallCategory=classify_rainfall(intensity_mm_hr),
        horizon=horizon,
        horizonLabel=meta["label"],
        roads=predictions,
        totals={
            "runoffM3Hr": runoff,
            "capacityM3Hr": capacity,
            "utilizationPct": (runoff / capacity) * 100 if capacity > 0 else 0.0,
        },
        distribution=distribution,
        distributionPct=distribution_pct,
        maxDepthCm=max((p.waterDepthCm for p in predictions), default=0.0),
        atRiskCount=len(at_risk),
        avgDepthCm=(
            sum(p.waterDepthCm for p in at_risk) / len(at_risk) if at_risk else 0.0
        ),
        drainage=graph_summary(),
        terrain={
            "dominantClass": terrain_summary(roads)["dominantClass"],
            "lowLyingAtRisk": low_lying_at_risk,
            "nodeCount": len(nodes),
        },
        horizonSeries=[
            _summarize_horizon(intensity_mm_hr, h) for h in TIME_HORIZONS
        ],
    )


def risk_color(risk: str) -> str:
    return RISK_COLORS[risk]
