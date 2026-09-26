# DrainCast

**Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling**
*"Know which streets will flood before they do."*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0080?logo=framer&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)
![NetworkX](https://img.shields.io/badge/NetworkX-3.4-2C7FB8)

**Problem Code SIH26085** · Smart India Hackathon 2026 · Software Edition · Theme: Disaster Management

---

## Abstract

Indian cities receive rainfall *warnings*, but not street-level *flood*
forecasts. DrainCast closes that gap for urban India by coupling three
physical systems — spatial rainfall intensity (5–80 mm/hr across a 0–3 hour
nowcast window), a **directed stormwater drainage graph** whose edges carry
real hydraulic capacities, and DEM-derived terrain — into a per-road flood
risk class and **predicted water depth in centimetres**, visualised live on a
GIS map with flood-aware routing and full per-road explainability. The
prototype models Velachery ward, Chennai: 20 road corridors, 14 drainage
nodes and 15 directed pipes.

## Problem Statement → Solution Mapping

| SIH26085 asks for | DrainCast implements |
| --- | --- |
| Spatial rainfall nowcast input (Doppler radar) | Intensity field 5–80 mm/hr × 0–3 h horizon multipliers (1.00/1.15/1.30/1.45) with an auto-play sweep — a drop-in contract for radar tiles |
| High-resolution terrain data | 17 DEM-derived zones with elevation, slope and retention classes driving water accumulation |
| Directed storm-drain network with hydraulic capacities | 14 nodes / 15 directed pipes as a node–edge graph (NetworkX `DiGraph` in the backend); node outflow caps each road's drain limit |
| Drainage surcharge & street-level flood depth | Per road: runoff − capacity → excess × terrain retention → depth (cm) in five bands (0–2 / 3–6 / 7–12 / 13–20 / 21–35) |
| 0–3 hour nowcast through a web GIS | Live dashboard: NOW/+1/+2/+3 HR timeline, auto-play, per-horizon risk sweeps |
| Flood-aware routing API | Risk-weighted Dijkstra route finder with A/B conventional comparison, plus a documented `POST /api/routing/flood-aware` endpoint |

## Live Demo

The frontend is a **fully interactive, self-contained prototype** — every
computation (coupling engine, graph lookups, routing) runs client-side:

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

Open `/` for the minimal landing page, then **Open Interactive Dashboard**.
Drag the rainfall slider, play the 0–3 hour nowcast, click any road or alert,
toggle the drainage graph, find a flood-safe route, flip the theme.

## Key Features

- **Full-screen GIS dashboard** — 20 Velachery corridors recolour live with
  five-level flood risk; hover tooltips; click-to-fly road intelligence
- **Rainfall Nowcast Control** — 5–80 mm/hr slider with IMD-style category
  indicator, NOW/+1/+2/+3 HR timeline, **auto-play nowcast**, five quick
  scenarios (Drizzle → Cloudburst), reset
- **Live Risk Overview** — count-up stat tiles for every risk class + max
  predicted depth
- **Flood Risk Legend** — risk colours with depth bands and live counts
- **Drainage Network Insight** — nodes/pipes counts, average capacity, graph
  type, map overlay toggle
- **Drainage Network Graph View** — the full node–edge model: every node
  (ID, type, elevation) and directed pipe (from → to, capacity bar)
- **Terrain & Elevation Insight** — dominant terrain, elevation & slope
  ranges, gravity-flow reasoning, live terrain-impact indicator
- **Rainfall vs Drainage Load** — animated Chart.js panel: network runoff
  curve against total drain capacity, marker on the live intensity
- **High-Risk Road Alerts** — auto-generated feed (name, area, risk, depth,
  excess); click to zoom, pan and highlight on the map
- **Risk Distribution** — animated percentage bars per risk class
- **Selected Road Intelligence** — the full audit trail: catchment, runoff,
  inlets, connected node, pipe capacity, excess, terrain influence, depth,
  risk, **"Why is this road at this risk?"** and a recommendation
  (Safe / Caution / Avoid During Heavy Rainfall)
- **Flood-Safe Route Finder** — Leaflet Routing Machine rendering of a
  risk-weighted route, vs the dashed conventional shortest path, with Clear
- **Dark & Light themes** — full CSS-variable theme system; risk colours
  identical in both

## Why DrainCast Stands Out

1. **Coupling, not colouring** — risk emerges from runoff vs. drain capacity
   vs. terrain; two adjacent streets can hold different classes under the
   same storm.
2. **Explainable to the last metre** — every number on screen traces to a
   sentence a judge or a corporation engineer can audit.
3. **Demo-proof** — fully client-side, works offline after load, zero
   configuration to deploy.
4. **Architecture-ready** — a production-shaped Flask + NetworkX backend is
   designed and documented alongside.
5. **Judge-timed** — the entire story demos in under 3 minutes
   (see `docs/PRESENTATION_SCRIPT_3_MINUTES.md`).

## Core Concept — Rainfall · Terrain · Drainage Coupling

```
 rainfall i (mm/hr) × horizon multiplier
        │
        ▼
 rational method runoff        Q = i/1000 · A · 0.85
        │
        ▼                         A = road length × carriageway width
 drain capacity (graph)        C = node outflow × inlets × 0.92
        │
        ▼
 excess water                  E = max(0, Q − C)
        │
        ▼                         low-lying ×1.00 · moderate ×0.85 · elevated ×0.70
 terrain retention             R = E × retention(zone)
        │
        ▼
 water depth (cm)              D = R / (A × 0.22) × 100
        │
        ▼
 risk class                    0–2 safe · 3–6 low · 7–12 moderate · 13–20 high · 21–35 severe (cm)
```

Worked example — *Velachery Main Road (West) @ 40 mm/hr, Now*:
catchment 34,276 m² → runoff 1,165 m³/hr; 11 inlets → node JN-VEL-03
capacity 557 m³/hr → excess 609 m³/hr → moderate terrain → **6.9 cm →
Moderate Risk**.

## Technology Stack

**Frontend (the interactive demo)**

| | |
| --- | --- |
| Framework | React 18 + TypeScript 5 + Vite 6 |
| Styling | Tailwind CSS v4 (CSS-variable theme system), 8-pt spacing |
| Motion | Framer Motion (150–400 ms ease-out micro-interactions) |
| Map | Leaflet + React-Leaflet + Leaflet Routing Machine (custom offline router) |
| Charts | Chart.js + react-chartjs-2 |
| Icons / utils | Lucide React, clsx + tailwind-merge |

**Backend (designed, unconnected)**

| | |
| --- | --- |
| Framework | Flask 3.1 (application factory, blueprints) |
| Graph engine | NetworkX 3.4 — directed stormwater graph + risk-weighted Dijkstra |
| Language | Python 3.11, dataclasses, python-dotenv |

## Project Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Browser (single page)                       │
│                                                                    │
│  Landing (/)                    Dashboard (/dashboard)             │
│  ───────────                    ───────────────────────            │
│  minimal hero + CTA             Top bar · live clock · theme       │
│                                 ┌──────────────────────────────┐   │
│                                 │         Leaflet map          │   │
│                                 │  roads · drains · zones ·    │   │
│                                 │  routes · terrain zones      │   │
│                                 └──────────────────────────────┘   │
│   floating panels: nowcast control · risk overview · legend ·      │
│   drainage insight · terrain insight · load chart · alerts ·        │
│   distribution · route finder · road intelligence · graph view     │
│                                                                    │
│   src/utils/floodPredictionEngine.ts  ← client-side coupling       │
│   src/utils/routeFinder.ts            ← risk-weighted Dijkstra    │
│   src/data/*                          ← embedded Velachery data   │
└────────────────────────────────────────────────────────────────────┘
              │  (demo runs standalone — no calls made)
              ▼  (designed production path)
┌────────────────────────────────────────────────────────────────────┐
│                  Flask + NetworkX backend (/backend)               │
│   api/ blueprints → core/ engine → data/ JSON                      │
│   directed drainage DiGraph · 0–3 h nowcast · flood-aware routing  │
│   docs/: API_DOCUMENTATION · BACKEND_ARCHITECTURE · ALGORITHM      │
└────────────────────────────────────────────────────────────────────┘
```

## Mock Data

All geography follows real Velachery coordinates (centre 12.9750° N,
80.2210° E; Ward 175/181, Zone 13 – Adyar, Greater Chennai Corporation);
hydraulic values are synthetic and calibrated for demonstration.

| File | Contents |
| --- | --- |
| `frontend/src/data/velacheryRoads.ts` | 20 corridors — real alignment polylines, length, type, catchment, connected node |
| `frontend/src/data/drainageNodes.ts` | 14 manholes / inlets / junctions, elevations 5.2–9.3 m |
| `frontend/src/data/drainagePipes.ts` | 15 directed pipes, capacities 25–95 m³/hr |
| `frontend/src/data/terrainData.ts` | 17 DEM-derived zones — elevation, slope, class, hydrological reasoning |
| `frontend/src/data/wardInfo.ts` | ward demography, drainage context, flood history |
| `frontend/src/data/routeLocations.ts` | 6 origin/destination points for routing |
| `backend/data/*.json` | the same dataset, exported for the reference API |

## Getting Started — Frontend

```bash
cd frontend
npm install
npm run dev            # development → http://localhost:5173
npm run build          # production → dist/
npm run preview        # serve the production build locally
```

Requires Node 18+ (built and tested on Node 22).

## Backend Setup (full-stack design showcase)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                    # → http://localhost:5000/api/health
```

Every endpoint is documented with sample requests/responses in
[`backend/docs/API_DOCUMENTATION.md`](backend/docs/API_DOCUMENTATION.md).
The backend engine is **numerically identical** to the frontend engine —
same constants, same formulas, same output per road.

> **Why keep it unconnected?** The backend is designed to demonstrate
> scalable architecture. The frontend runs as an independent interactive
> demo for a smooth hackathon presentation — zero infrastructure on stage.

## Theme Support

Dark (default) and Light modes, driven by CSS variables
(`frontend/src/context/ThemeContext.tsx`), persisted in `localStorage`, with
a smooth 200 ms cross-fade and theme-matched basemap tiles. **Flood risk
colours are identical in both themes** for map readability.

## Project Structure

```
DrainCast/
├── frontend/                  # React + TypeScript + Vite app
│   ├── public/
│   └── src/
│       ├── components/        # dashboard/ · layout/ · map/ · ui/ · theme/
│       ├── context/           # ThemeContext.tsx
│       ├── data/              # embedded Velachery mock data
│       ├── hooks/             # useClock, useCountUp
│       ├── pages/             # Landing, Dashboard
│       ├── types/             # shared TypeScript interfaces
│       ├── utils/             # floodPredictionEngine, routeFinder, …
│       ├── App.tsx · main.tsx · index.css
│       └── package.json · vite.config.ts · tsconfig.json · index.html
├── backend/                   # Flask + NetworkX reference API (unconnected)
│   ├── api/ · core/ · models/ · utils/ · data/ · docs/
│   ├── app.py · config.py · requirements.txt · .env.example · README.md
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── PRESENTATION_SCRIPT_3_MINUTES.md
│   ├── JUDGE_QA.md
│   ├── SIH_IDEA_DESCRIPTION.md
│   └── SCREENSHOT_GUIDE.md
├── .gitignore · LICENSE · netlify.toml · README.md
```

## Screenshots

*(Capture after deploying — see `docs/SCREENSHOT_GUIDE.md` for the exact
eight-shot list: landing, default dashboard, cloudburst, +3 h escalation,
road intelligence, drainage graph view, flood-safe route A/B, light theme.
Store under `docs/screenshots/` and embed here.)*

## 3-Minute Presentation Summary

| Time | Beat |
| --- | --- |
| 0:00–0:25 | The gap: rainfall prediction exists, street-level flood prediction does not |
| 0:25–0:55 | DrainCast: couple rainfall + drainage graph + terrain → depth & risk per street |
| 0:55–1:15 | The science in four sentences (runoff → capacity → excess → depth) |
| 1:15–1:40 | The directed graph: nodes = manholes/inlets, edges = pipes with capacity |
| 1:40–2:10 | Live demo: slider → Cloudburst, +3 HR, auto-play, recolouring corridors |
| 2:10–2:25 | Road Intelligence: "Why is this road at this risk?" audit trail |
| 2:25–2:40 | Flood-safe routing: cyan aware route vs dashed conventional path |
| 2:40–3:00 | USP, feasibility, impact, close |

Full script with exact lines and pointing guidance:
[`docs/PRESENTATION_SCRIPT_3_MINUTES.md`](docs/PRESENTATION_SCRIPT_3_MINUTES.md).

## Future Enhancements

- Ingest live IMD/NCMRWF Doppler nowcast tiles via a queued ingestion API
- Calibrate catchment, capacity and retention constants against GCC
  storm-water records and observed flood reports
- SWMM-style dynamic hydraulic routing (surcharge/backflow propagation over
  the 0–3 h window)
- City-wide deployment: PostGIS storage, worker queue, per-ward caching
- Public flood-safe route API for navigation apps; crowdsourced depth
  reports as a bias-correction signal

## Team

*Team placeholder — add member names, roles and mentor before submission.*

## References

- [SIH 2026 Problem Statement SIH26085](https://www.sih.gov.in/) — Ministry
  of Earth Sciences / NCMRWF
- [SRTM](https://www2.jpl.nasa.gov/srtm/) — elevation & slope methodology
- [OpenStreetMap](https://www.openstreetmap.org/copyright) — road alignments
  (© OSM contributors)
- [OSRM](https://project-osrm.org/) / [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) — routing baseline
- [CARTO basemaps](https://carto.com/attribution/) — map tiles
- Greater Chennai Corporation — ward structure & stormwater asset context

## Disclaimer

DrainCast is a hackathon prototype built on synthetic, illustrative data. It
must **not** be used for real flood response, evacuation or navigation
decisions. Depths, capacities and risk classes are modelled for
demonstration, not calibrated forecasts.

---

**SIH 2026 Software Edition · Demo Prototype · Problem Statement SIH26085**
