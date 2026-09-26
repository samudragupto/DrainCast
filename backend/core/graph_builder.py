"""Builds the stormwater drainage network as a NetworkX directed graph.

Manholes and stormwater inlets are NODES; underground pipes are DIRECTED
EDGES carrying a `capacity_m3h` weight. Edge direction follows gravity flow
from the Taramani interface down to the Pallikaranai marsh outfall.
"""

from functools import lru_cache

import networkx as nx

from utils.helpers import load_json


@lru_cache(maxsize=1)
def drainage_graph() -> nx.DiGraph:
    """Return the cached directed drainage graph for Velachery."""
    nodes = load_json("drainage_nodes.json")["nodes"]
    pipes = load_json("drainage_pipes.json")["pipes"]

    graph = nx.DiGraph(name="velachery-stormwater-network")

    for node in nodes:
        graph.add_node(
            node["id"],
            kind="drainage_node",
            name=node["nodeName"],
            type=node["type"],
            position=node["position"],
            elevation_m=node["elevationM"],
        )

    for pipe in pipes:
        graph.add_edge(
            pipe["from"],
            pipe["to"],
            kind="drainage_pipe",
            pipe_id=pipe["id"],
            capacity_m3h=pipe["capacityM3Hr"],
        )

    return graph


def node_outflow_capacity_m3h(node_id: str) -> float:
    """Rated outflow of a node: its highest-capacity outgoing pipe.

    Terminal nodes (the marsh outfall) are credited with the assumed rated
    outfall capacity instead of zero, matching the frontend model.
    """
    from utils.constants import OUTFALL_CAPACITY_M3H

    graph = drainage_graph()
    if graph.out_degree(node_id) == 0:
        return OUTFALL_CAPACITY_M3H
    return max(d["capacity_m3h"] for _, _, d in graph.out_edges(node_id, data=True))


def downstream_path_to_outfall(node_id: str) -> list:
    """Gravity flow path from a node to the nearest sink (outfall)."""
    graph = drainage_graph()
    sinks = [n for n in graph.nodes if graph.out_degree(n) == 0]
    best: list = []
    for sink in sinks:
        try:
            path = nx.shortest_path(graph, node_id, sink)
        except nx.NetworkXNoPath:
            continue
        if not best or len(path) < len(best):
            best = path
    return best


def graph_summary() -> dict:
    """Human-readable graph statistics for the /api/drainage/graph endpoint."""
    graph = drainage_graph()
    capacities = [d["capacity_m3h"] for _, _, d in graph.edges(data=True)]
    return {
        "graphType": "Directed Graph (Node–Edge Model)",
        "networkxGraphType": str(type(graph).__name__),
        "isDirected": graph.is_directed(),
        "nodeCount": graph.number_of_nodes(),
        "edgeCount": graph.number_of_edges(),
        "avgPipeCapacityM3Hr": round(sum(capacities) / len(capacities), 1),
        "totalPipeCapacityM3Hr": round(sum(capacities), 1),
        "sinks": [n for n in graph.nodes if graph.out_degree(n) == 0],
        "sources": [n for n in graph.nodes if graph.in_degree(n) == 0],
        "connected": nx.is_weakly_connected(graph),
    }
