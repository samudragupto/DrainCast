# DrainCast — Project Overview

**DrainCast — Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling**
*"Know which streets will flood before they do."*

| | |
| --- | --- |
| Problem Code | SIH26085 · Smart India Hackathon 2026 · Software Edition |
| Theme | Disaster Management |
| Organisation | Ministry of Earth Sciences / NCMRWF |
| Prototype Area | Velachery Ward, Chennai, Tamil Nadu |
| Stack | React 18 + TypeScript + Vite + Tailwind v4 + Leaflet + Framer Motion (frontend) · Flask 3 + NetworkX (designed backend) |

## The Problem

India's cities get rainfall *warnings* — but a citizen or a corporation
engineer still cannot answer the question that matters in the moment:
**"Which street outside my door will be underwater in the next three hours,
and how deep?"** Weather apps forecast rain over a district; floods happen on
specific roads whose drains, slopes and elevations decide the outcome.

## The Idea

Couple three physical systems into one street-level forecast:

1. **Rainfall** — an intensity input (5–80 mm/hr) standing in for a
   Doppler-radar nowcast, swept across a 0–3 hour window.
2. **Drainage** — the stormwater network as a **directed graph**: manholes
   and inlets are nodes, underground pipes are edges with real carrying
   capacities.
3. **Terrain** — DEM-derived elevation, slope and retention classes.

Per road: runoff load minus drain capacity, modulated by terrain, yields
**risk class and predicted water depth in centimetres** — plus a
flood-aware route that actively avoids high-risk corridors.

## What Judges See (the 3-minute flow)

1. **Landing** → one click into the live dashboard.
2. **Live map of 20 Velachery corridors** recolouring as the rainfall slider
   moves — Drizzle → Cloudburst, Now → +3 hours, auto-play.
3. **Live risk overview, legend with depth bands, alerts feed** — click an
   alert, the map flies to the road.
4. **Road Intelligence panel** — the full audit trail: catchment, runoff,
   inlets, node, capacity, excess, terrain, depth — and *"Why is this road
   at this risk?"* in plain language.
5. **Drainage Graph View** — the actual node–edge model with capacities.
6. **Flood-safe route finder** — cyan flood-aware route vs dashed-red
   conventional shortest path, with the avoided high-risk count.
7. **Dark & light themes**, 8-pt design system, zero backend required.

## Repository Layout

```
DrainCast/
├── frontend/    React + TypeScript + Vite app (the interactive demo)
├── backend/     Flask + NetworkX reference API (documented, not connected)
├── docs/        Presentation script, judge Q&A, overview, screenshot guide
├── README.md    Master README
└── LICENSE      MIT
```

## Why It Can Win

- **Faithful to the problem statement** — every SIH26085 keyword is
  implemented, not just claimed: radar-input slot, directed drain graph with
  hydraulic capacities, 0–3 h nowcast, street-level depth, GIS visualisation,
  flood-aware routing.
- **Explainable** — every pixel of risk traces back to numbers a judge can
  audit on screen.
- **Demo-proof** — fully client-side; it works on a stage laptop with no
  internet after load.
- **Architecture-ready** — the Flask/NetworkX backend shows exactly how the
  demo scales to a city and live radar feeds.
