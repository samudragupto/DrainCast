# DrainCast Backend Architecture

## Objective

The backend exists to prove the production architecture behind the hackathon
demo: the same coupling engine that runs client-side, exposed as a scalable
REST service with a real graph database of the stormwater network, ready to
ingest live radar nowcasts instead of slider values.

```
                       ┌──────────────────────────────────────────┐
   Browser / GIS  ───▶ │  Flask app (app.py — application factory) │
   clients            │  CORS · error handlers · /api/health      │
                       └───────────────┬──────────────────────────┘
                                       │  Blueprint registry (api/)
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
   routes_terrain  routes_drainage  routes_roads  routes_prediction  routes_nowcast / routing
        │              │               │               │              │
        └──────────────┴───────┬───────┴───────────────┴──────────────┘
                               ▼
                     ┌──────────────────────┐        ┌─────────────────┐
                     │  core/ domain logic  │◀──────▶│  data/ (JSON)   │
                     │  flood_engine        │        │  roads, nodes,  │
                     │  nowcast_engine      │        │  pipes, DEM,    │
                     │  routing_engine      │        │  ward info      │
                     │  graph_builder       │        └─────────────────┘
                     │  runoff_calculator   │
                     │  terrain_analyzer    │        ┌─────────────────┐
                     └──────────┬───────────┘◀──────▶│ models/schemas  │
                                │                    │  dataclasses    │
                     ┌──────────▼───────────┐        └─────────────────┘
                     │  NetworkX DiGraph    │
                     │  (stormwater network)│
                     └──────────────────────┘
```

## Layering rules

1. **`api/` never computes.** Blueprints validate input, call one `core/`
   function, and serialise the result. This keeps HTTP concerns testable and
   the domain logic reusable (a CLI, a batch job, or a queue worker could call
   `core/` directly).
2. **`core/` never imports Flask.** The engine is a pure-Python library.
   `flood_engine` orchestrates; `runoff_calculator`, `terrain_analyzer` and
   `graph_builder` each own exactly one physical process.
3. **`models/schemas.py` is the single source of truth for shapes.** Every API
   response is built from a dataclass, so the contract cannot drift.
4. **`utils/constants.py` mirrors the frontend engine.** One file, all model
   constants — when the science changes, both engines change together.

## How NetworkX is used

The stormwater network is modelled as a **`nx.DiGraph`** built once and cached
(`lru_cache`) by `core/graph_builder.py`:

- **Nodes** — every manhole, stormwater inlet and junction, annotated with
  `type`, `position` and `elevation_m` (from `drainage_nodes.json`).
- **Edges** — every underground pipe, annotated with `capacity_m3h` and
  direction of gravity flow (`drainage_pipes.json`).

Graph operations the API relies on:

| Operation | NetworkX facility | Used by |
| --- | --- | --- |
| Rated node outflow | `out_edges(node, data=True)` → max capacity | `runoff_calculator.drain_capacity_m3h` |
| Flow path to outfall | `shortest_path` to sinks (`out_degree == 0`) | `drainage/nodes` |
| Network stats | `is_directed`, degree, weak connectivity | `drainage/graph` |
| Flood-aware routing | `dijkstra_path` with dynamic edge weights | `routing_engine` |

Routing deserves a note: the **road** network (not the pipe network) is walked
by `routing_engine`. It builds an undirected `nx.Graph` whose junctions are
snapped road endpoints (70 m clustering) and whose edge cost is
`length × risk_penalty`. `nx.dijkstra_path` runs twice — once risk-weighted
(flood-aware) and once plain (conventional) — which is exactly the A/B
comparison the UI renders.

## Scaling path

| Demo (today) | Production (designed for) |
| --- | --- |
| Slider input | IMD/NCMRWF Doppler nowcast tiles via an ingestion queue |
| JSON files | PostGIS (roads, DEM tiles) + graph persisted server-side |
| Recompute per request | Celery/Redis workers; results cached per ward × horizon |
| Single Flask process | Gunicorn + Nginx behind a load balancer |
| 20 roads / 15 pipes | City-wide GCC stormwater asset registry |

## Why the frontend stays disconnected

The React app ships its own copy of the engine and data so the SIH demo needs
**zero infrastructure**: open the deployed URL, everything works offline.
Connecting it later is a one-line `fetch` per panel — the response shapes are
already identical (`utils/constants.py` mirrors the TS constants, and the
numbers agree road-for-road).
