# DrainCast Coupling Algorithm — Code-Level Explanation

This document walks through the exact computation, file by file, as a judge
would trace it. The identical logic runs in the browser
(`frontend/src/utils/floodPredictionEngine.ts`) and here.

## Inputs

| Input | Demo source | Production source |
| --- | --- | --- |
| Rainfall intensity `i` (mm/hr) | slider / POST body | Doppler-radar nowcast |
| Time horizon `h` | Now/+1h/+2h/+3h buttons | nowcast valid time |
| Road catchment geometry | `velachery_roads.json` | GIS road network |
| Drain network | `drainage_nodes/pipes.json` | stormwater asset registry |
| Terrain | `dem_terrain.json` | SRTM/ALOS DEM |

## Step 1 — Effective rainfall (`core/nowcast_engine.py`)

```python
effective_i = i × multiplier[h]        # 1.00 / 1.15 / 1.30 / 1.45
```

The multiplier models a storm cell intensifying over the ward through the
0–3 hour window — a stand-in for a radar nowcast growth curve.

## Step 2 — Surface runoff (`core/runoff_calculator.py`)

Rational method over the road's paved catchment:

```python
A        = road_length × carriage_width      # catchment area, m²
runoff   = (effective_i / 1000) × A × 0.85   # m³/hr
```

`0.85` is the imperviousness coefficient for dense urban catchment — 85% of
rain becomes flow instead of soaking in. The `/1000` converts mm/hr·m² → m³/hr.

## Step 3 — Drain capacity (`core/runoff_calculator.py` + `graph_builder.py`)

The road's inlets discharge into a node of the **directed drainage graph**:

```python
inlets   = max(1, round(road_length / 140))        # GCC norm: inlet every 140 m
outflow  = max(capacity of node's outgoing pipes)  # from the DiGraph
capacity = outflow × inlets × 0.92                 # 0.92 = field efficiency
```

Because the graph is directed, "capacity" always means *downstream* capacity —
the pipe the water can actually reach. Terminal nodes (the Pallikaranai marsh
outfall) are credited a rated outfall capacity.

## Step 4 — Excess water (`core/flood_engine.py`)

```python
excess = max(0, runoff − capacity)
```

This subtraction is the heart of the coupling: **flood risk emerges when load
exceeds the drain network's ability to carry it** — not merely when it rains.

## Step 5 — Terrain retention (`core/terrain_analyzer.py`)

```python
retention = {Low-Lying: 1.00, Moderately Low: 0.85, Slightly Elevated: 0.70}[zone]
retained  = excess × retention
```

Low-lying pockets (5–6 m elevation, < 1° slope) hold all of the excess on the
surface; gently elevated corridors shed ~30% of it downstream.

## Step 6 — Water depth (`core/flood_engine.py`)

```python
depth_cm = (retained / (A × 0.22)) × 100
```

Excess spread over the ponding fraction (22%) of the carriageway.

## Step 7 — Risk classification (`utils/helpers.py`)

| Depth | Class | Colour | Action |
| --- | --- | --- | --- |
| 0–2 cm | safe | #22C55E | Safe |
| 3–6 cm | low | #A3E635 | Safe |
| 7–12 cm | moderate | #F59E0B | Caution |
| 13–20 cm | high | #F97316 | Caution |
| 21–35 cm | severe | #DC2626 | Avoid During Heavy Rainfall |

## Step 8 — Explainability (`core/flood_engine._why`)

Every road gets a human-readable sentence assembled from its own numbers —
catchment, inlets, node, capacities, excess, terrain, depth — so a judge (or a
corporation engineer) can audit any single prediction in seconds.

## Flood-aware routing (`core/routing_engine.py`)

```python
edge_cost = length_m × {safe:1.0, low:1.2, moderate:2.0, high:3.5, severe:8.0}[risk]
nx.dijkstra_path(graph, start, end, weight=edge_cost)
```

Run twice (with and without the risk penalty) to produce the A/B comparison:
what the flood-aware route avoids versus the conventional shortest path.

## Worked example — Velachery Main Road (West) @ 40 mm/hr, Now

| Quantity | Value |
| --- | --- |
| Catchment (1558 m × 22 m) | 34,276 m² |
| Runoff (0.040 × 34,276 × 0.85) | 1,165 m³/hr |
| Inlets (1558 / 140) | 11 |
| Node JN-VEL-03 rated outflow | 55 m³/hr |
| Capacity (55 × 11 × 0.92) | 557 m³/hr |
| Excess | 609 m³/hr |
| Retention (Moderately Low) | × 0.85 |
| Depth (518 / (34,276 × 0.22) × 100) | **6.9 cm** |
| Class | **Moderate Risk** |

Same engine, both sides of the stack.
