"""Flood-aware route evaluation over the Velachery road graph.

The road corridors are converted into a bidirectional weighted graph:
road endpoints (and shared mid-block vertices) become junction nodes, and
each road becomes edges weighted by length × risk penalty. Two evaluations
are returned — the flood-aware optimum and the conventional shortest path —
so callers can see exactly what the risk weighting avoided.
"""

from functools import lru_cache

import networkx as nx

from core.flood_engine import predict_network
from utils.constants import (
    AVG_SPEED_M_PER_MIN,
    CLUSTER_TOLERANCE_M,
    RISK_ROUTE_WEIGHT,
)
from utils.helpers import haversine_m, load_json


@lru_cache(maxsize=1)
def _road_graph() -> nx.Graph:
    """Undirected junction graph built from the demo road network."""
    roads = load_json("velachery_roads.json")["roads"]

    junctions: dict = {}           # junction_id -> (lat, lng)
    vertex_junction: dict = {}     # "roadId:index" -> junction_id

    def nearest(coord):
        for jid, jc in junctions.items():
            if haversine_m(coord[0], coord[1], jc[0], jc[1]) < CLUSTER_TOLERANCE_M:
                return jid
        return None

    def attach(road_id, idx, coord, force):
        key = f"{road_id}:{idx}"
        existing = nearest(coord)
        if existing:
            vertex_junction[key] = existing
            return
        if not force:
            return
        jid = f"J{len(junctions):02d}"
        junctions[jid] = coord
        vertex_junction[key] = jid

    for road in roads:
        attach(road["id"], 0, road["coordinates"][0], True)
        attach(road["id"], len(road["coordinates"]) - 1, road["coordinates"][-1], True)
    for road in roads:
        for i in range(1, len(road["coordinates"]) - 1):
            attach(road["id"], i, road["coordinates"][i], False)

    graph = nx.Graph(name="velachery-road-network")
    for jid, coord in junctions.items():
        graph.add_node(jid, position=coord)

    for road in roads:
        cuts = [
            (i, vertex_junction[f"{road['id']}:{i}"])
            for i in range(len(road["coordinates"]))
            if f"{road['id']}:{i}" in vertex_junction
        ]
        for (ia, ja), (ib, jb) in zip(cuts, cuts[1:]):
            coords = road["coordinates"][ia : ib + 1]
            length_m = sum(
                haversine_m(coords[k - 1][0], coords[k - 1][1], coords[k][0], coords[k][1])
                for k in range(1, len(coords))
            )
            if length_m < 1 or ja == jb:
                continue
            if graph.has_edge(ja, jb) and graph[ja][jb]["length_m"] <= length_m:
                continue
            graph.add_edge(ja, jb, road_id=road["id"], road_name=road["roadName"], length_m=length_m)

    return graph


def _snap(coord) -> str:
    """Nearest junction to a (lat, lng) position."""
    graph = _road_graph()
    return min(
        graph.nodes,
        key=lambda jid: haversine_m(coord[0], coord[1], *graph.nodes[jid]["position"]),
    )


def _evaluate(graph: nx.Graph, start_j: str, end_j: str, risk_by_road: dict, risk_weighted: bool):
    def edge_cost(u, v, data):
        risk = risk_by_road.get(data["road_id"], "safe")
        penalty = RISK_ROUTE_WEIGHT[risk] if risk_weighted else 1.0
        return data["length_m"] * penalty

    try:
        path = nx.dijkstra_path(graph, start_j, end_j, weight=edge_cost)
    except nx.NetworkXNoPath:
        return None

    steps, distance = [], 0.0
    risks = []
    for u, v in zip(path, path[1:]):
        data = graph[u][v]
        risk = risk_by_road.get(data["road_id"], "safe")
        risks.append(risk)
        distance += data["length_m"]
        steps.append(
            {
                "roadId": data["road_id"],
                "roadName": data["road_name"],
                "risk": risk,
                "lengthM": round(data["length_m"], 1),
            }
        )

    order = ["safe", "low", "moderate", "high", "severe"]
    max_risk = max(risks, key=order.index) if risks else "safe"
    return {
        "distanceM": round(distance, 1),
        "durationMin": round(distance / AVG_SPEED_M_PER_MIN, 1),
        "highCount": risks.count("high"),
        "severeCount": risks.count("severe"),
        "maxRisk": max_risk,
        "steps": steps,
    }


def evaluate_route(start_coord, destination_coord, intensity_mm_hr: float, horizon: str = "now") -> dict:
    """Flood-aware route + conventional comparison at the given prediction."""
    prediction = predict_network(intensity_mm_hr, horizon)
    risk_by_road = {p.roadId: p.risk for p in prediction.roads}
    depth_by_road = {p.roadId: p.waterDepthCm for p in prediction.roads}

    graph = _road_graph()
    start_j = _snap(start_coord)
    end_j = _snap(destination_coord)

    aware = _evaluate(graph, start_j, end_j, risk_by_road, True)
    conventional = _evaluate(graph, start_j, end_j, risk_by_road, False)

    if aware is None:
        return {
            "feasible": False,
            "message": "No connected path between the requested locations.",
        }

    for step in aware["steps"]:
        step["waterDepthCm"] = round(depth_by_road.get(step["roadId"], 0.0), 1)

    return {
        "feasible": True,
        "rainfallIntensityMmHr": intensity_mm_hr,
        "horizon": horizon,
        "floodAware": aware,
        "conventional": conventional,
        "sameAsConventional": [s["roadId"] for s in aware["steps"]]
        == [s["roadId"] for s in conventional["steps"]]
        if conventional
        else False,
    }
