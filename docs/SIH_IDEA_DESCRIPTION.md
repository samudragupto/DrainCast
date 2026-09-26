# SIH Idea Description — DrainCast

**Title:** DrainCast — Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling
**Tagline:** *Know which streets will flood before they do.*
**Problem Code:** SIH26085 · Software Edition · Theme: Disaster Management

## Problem Statement (SIH26085, abridged)

Design an early-warning system for urban flooding by coupling spatial rainfall
nowcasts (Doppler radar), high-resolution terrain data, and a directed
storm-drain network with hydraulic capacities — to predict street-level flood
depth through a 0–3 hour window and issue flood-aware route advisories.

## Proposed Solution

DrainCast couples the three required physical systems into one explainable,
street-level nowcast, delivered as a GIS web application:

1. **Rainfall nowcast input** — an intensity field (5–80 mm/hr) with 0–3 hour
   horizon multipliers (1.00 / 1.15 / 1.30 / 1.45), designed to accept radar
   nowcasts directly.
2. **Terrain model** — DEM-derived elevation, slope and terrain classes per
   locality, driving a retention factor (low-lying pockets retain more water).
3. **Directed drainage graph** — manholes/inlets/junctions as nodes,
   underground pipes as directed edges with rated capacity (m³/hr); node
   outflow defines each road's drain limit.
4. **Coupling engine** — per road: rational-method runoff (C = 0.85), minus
   graph drain capacity, times terrain retention → predicted water depth (cm)
   and a five-level risk class with depth bands 0–2 / 3–6 / 7–12 / 13–20 /
   21–35 cm.
5. **GIS visualisation** — a live map of all road corridors recolouring with
   risk, drainage network overlay, terrain zones, high-risk alerts with
   fly-to, and full per-road explainability ("Why is this road at this
   risk?").
6. **Flood-aware routing** — risk-weighted Dijkstra over the road network,
   presented as an A/B comparison against the conventional shortest path.

## Novelty

- Risk emerges from **infrastructure-aware coupling**, not rainfall intensity
  alone — adjacent streets can hold different risk classes under one storm.
- Every prediction is **fully auditable on screen** — catchment, inlets, node,
  pipe capacity, excess, terrain and depth, in plain language.
- The **routing output is first-class**, converting the nowcast into citizen
  and emergency-response value.

## Scope of Prototype

- **Area:** Velachery ward, Chennai (Ward 175/181, Zone 13 – Adyar, GCC) —
  20 road corridors, 14 drainage nodes, 15 directed pipes, 17 terrain zones,
  6 routing locations.
- **Frontend:** fully interactive React + TypeScript application, dark/light
  themes, deployable to any static host.
- **Backend (designed, unconnected):** Flask + NetworkX REST API implementing
  the identical engine server-side, documented for production scale-up.

## Future Enhancements

1. Ingest live IMD/NCMRWF Doppler nowcast tiles.
2. Calibrate constants against GCC flood reports and observed depths.
3. SWMM-style dynamic hydraulic routing (surcharge/backflow propagation).
4. City-wide deployment on PostGIS + worker queue.
5. Public flood-safe route API for navigation apps; crowdsourced depth
  reports as a bias-correction signal.

## Team

*Team placeholder — add members, roles and mentor details here before
submission.*

## References

- SIH 2026 Problem Statement SIH26085 — Ministry of Earth Sciences / NCMRWF
- SRTM 30 m DEM (elevation/slope methodology)
- OpenStreetMap (road alignments, © OpenStreetMap contributors)
- OSRM / Leaflet Routing Machine (routing baseline)
- GCC ward and stormwater asset structure (Chennai)
