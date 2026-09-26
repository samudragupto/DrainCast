"""Drainage network endpoints — the directed stormwater graph."""

from flask import Blueprint, jsonify

from core.graph_builder import (
    drainage_graph,
    downstream_path_to_outfall,
    graph_summary,
    node_outflow_capacity_m3h,
)
from utils.helpers import load_json

drainage_bp = Blueprint("drainage", __name__, url_prefix="/drainage")


@drainage_bp.get("/graph")
def graph():
    """Complete directed graph: nodes + edges + NetworkX statistics."""
    g = drainage_graph()
    summary = graph_summary()

    nodes = [
        {
            "id": nid,
            "name": d["name"],
            "type": d["type"],
            "position": d["position"],
            "elevationM": d["elevation_m"],
            "inDegree": g.in_degree(nid),
            "outDegree": g.out_degree(nid),
        }
        for nid, d in g.nodes(data=True)
    ]
    edges = [
        {
            "pipeId": d["pipe_id"],
            "from": u,
            "to": v,
            "capacityM3Hr": d["capacity_m3h"],
        }
        for u, v, d in g.edges(data=True)
    ]
    return jsonify({"ok": True, "summary": summary, "nodes": nodes, "edges": edges})


@drainage_bp.get("/nodes")
def nodes():
    """All manholes / inlets / junctions with rated outflow."""
    records = load_json("drainage_nodes.json")["nodes"]
    for record in records:
        record["outflowCapacityM3Hr"] = node_outflow_capacity_m3h(record["id"])
        record["downstreamToOutfall"] = downstream_path_to_outfall(record["id"])
    return jsonify({"ok": True, "count": len(records), "nodes": records})


@drainage_bp.get("/pipes")
def pipes():
    """All directed pipes with hydraulic capacity."""
    records = load_json("drainage_pipes.json")["pipes"]
    return jsonify({"ok": True, "count": len(records), "pipes": records})
