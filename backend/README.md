# DrainCast Backend — Flask + NetworkX Reference API

A production-grade reference backend for **DrainCast — Urban Flood Nowcasting by
Rainfall–Drainage–Terrain Coupling** (SIH26085). It exposes the full prediction
pipeline as a REST API: terrain analysis, the directed stormwater-drainage graph,
street-level flood prediction, 0–3 hour nowcasts and flood-aware routing.

> **Why is this backend not connected to the frontend?**
> The React demo runs 100% in the browser with its own embedded data and
> prediction engine, so the hackathon presentation works offline with zero
> setup. This service demonstrates the scalable full-stack architecture the
> system is designed for: swap the client-side engine for these endpoints and
> the same UI works ward-by-ward across a city.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Flask 3.1 (application factory + blueprints) |
| Language | Python 3.11 |
| Graph engine | NetworkX 3.4 (directed graph for the drainage network) |
| Data | JSON + dataclasses |
| CORS | flask-cors (enabled, unused by the demo frontend) |
| Config | python-dotenv |

## Project Structure

```
backend/
├── app.py                  # Application factory + /api/health
├── config.py               # Env-driven configuration
├── requirements.txt
├── .env.example
├── api/                    # REST blueprints (one domain per file)
│   ├── __init__.py         # Blueprint registration
│   ├── routes_terrain.py   # Ward info + DEM terrain analysis
│   ├── routes_drainage.py  # Directed graph, nodes, pipes
│   ├── routes_roads.py     # Road segments (+ live predictions)
│   ├── routes_prediction.py# POST flood-risk + risk-summary analytics
│   ├── routes_nowcast.py   # 0–3 hour nowcast sweep
│   └── routes_routing.py   # Flood-aware route evaluation
├── core/                   # Domain logic (no Flask imports)
│   ├── graph_builder.py    # NetworkX DiGraph of the drain network
│   ├── runoff_calculator.py# Rational-method runoff + drain capacity
│   ├── terrain_analyzer.py # Zone lookups, retention, summaries
│   ├── flood_engine.py     # Rainfall–Drainage–Terrain coupling
│   ├── nowcast_engine.py   # Horizon multipliers + sweep
│   └── routing_engine.py   # Risk-weighted Dijkstra over roads
├── data/                   # Mock data (mirrors the frontend dataset)
├── models/
│   └── schemas.py          # Dataclasses for every API entity
├── utils/
│   ├── constants.py        # Shared model constants (mirrors frontend)
│   └── helpers.py          # JSON loading, classification, geo math
└── docs/
    ├── API_DOCUMENTATION.md
    ├── BACKEND_ARCHITECTURE.md
    └── ALGORITHM_EXPLANATION.md
```

## Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API is now live at `http://localhost:5000`:

```bash
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/nowcast/0-3hr?rainfall_mm_hr=75"
curl -X POST http://localhost:5000/api/predict/flood-risk \
  -H "Content-Type: application/json" \
  -d '{"rainfall_intensity_mm_hr": 55, "time_horizon": "1h"}'
```

Full request/response examples for every endpoint live in
**[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**.

## Endpoint Map

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server health check |
| GET | `/api/ward/info` | Velachery ward details + boundary |
| GET | `/api/terrain/analysis` | DEM, elevation, slope & terrain classification |
| GET | `/api/drainage/graph` | Complete directed graph (nodes + edges + stats) |
| GET | `/api/drainage/nodes` | All drainage nodes with rated outflow |
| GET | `/api/drainage/pipes` | All directed pipes with capacity |
| GET | `/api/roads` | Road segments (+ optional live predictions) |
| POST | `/api/predict/flood-risk` | Rainfall–Drainage–Terrain flood prediction |
| GET | `/api/nowcast/0-3hr` | 0, +1, +2, +3 hour nowcast data |
| POST | `/api/routing/flood-aware` | Flood-aware route evaluation (A/B) |
| GET | `/api/predict/analytics/risk-summary` | Aggregated risk statistics |
| GET | `/api/routing/locations` | Origin/destination options |
| GET | `/api/meta` | Risk taxonomy + horizon definitions |

## Verification

The backend engine is **numerically identical** to the frontend engine — the
same constants, formulas and thresholds are mirrored in `utils/constants.py`,
so a prediction made in the browser and one made through the API agree on
every road. Example at 40 mm/hr, "Now": `{safe: 12, low: 7, moderate: 1,
high: 0, severe: 0}`, max depth 6.9 cm — from either side.
