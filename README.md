# DrainCast — Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling

A frontend-only nowcasting prototype that couples rainfall intensity, storm-drain capacity and
terrain into a street-level flood risk forecast for **Velachery, Chennai** — and suggests
flood-safe routes when the water rises. Built as a **Smart India Hackathon 2026 (Software
Edition)** demo for problem statement **SIH26085**.

> **Live demo note** — the app is a fully static build (`npm run build` → `dist/`). Deploy it to
> Vercel, Netlify or Cloudflare Pages with zero configuration, or run the local dev server with
> `npm run dev`. Everything — the coupling engine, routing and map rendering — runs entirely in
> the browser. No backend, no API keys, no sign-in.

**SIH26085 reference** — *"Design an early warning system for urban flooding by coupling
spatial rainfall nowcasts (Doppler radar), high-resolution terrain data, and a directed
storm-drain network with hydraulic capacities, to predict street-level flood depth through a
0–3 hour window and issue flood-aware route advisories."* DrainCast demonstrates that full
pipeline in miniature: a rainfall slider that stands in for radar nowcasts, a directed drain
graph with per-pipe capacities, terrain-weighted runoff, per-road risk and water depth, and a
route finder that actively avoids flooded corridors.

---

## Key Features

- **Full-screen GIS dashboard** — Leaflet map of 20 Velachery road corridors that recolour
  live as rainfall changes, with drainage nodes, underground pipe flow direction and terrain
  zones as toggleable layers.
- **Coupled nowcast engine** — rainfall intensity (5–80 mm/hr) × time horizon (Now, +1h, +2h,
  +3h) → surface runoff vs. drain capacity vs. terrain retention → per-road risk class
  (Safe / Low / Moderate / High / Severe) and predicted water depth in cm.
- **0–3 hour nowcast timeline** — one-click scan across the four horizons with high + severe
  corridor counts per step.
- **Flood-safe route finder** — start/destination search with realistic Velachery locations,
  risk-weighted routing (drawn via Leaflet Routing Machine), and an A/B comparison against the
  conventional shortest path.
- **Live risk statistics & alerts** — count-up tiles for each risk class, average predicted
  depth, and a high-risk road alert feed.
- **Rainfall vs. drainage load chart** — animated Chart.js panel comparing runoff against
  connected drain capacity across the horizon sweep.
- **Selected road deep-dive** — click any road for its catchment, runoff, inlet count, drain
  capacity, excess volume and predicted depth.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 6 + TypeScript 5 |
| UI | React 18, Tailwind CSS v4, Framer Motion, Lucide React |
| Map | Leaflet, React-Leaflet, Leaflet Routing Machine (custom offline router) |
| Charts | Chart.js + react-chartjs-2 |
| Routing (pages) | React Router 6 |
| Styling utilities | clsx + tailwind-merge |

No backend, no environment variables, no API routes — a single static bundle.

## Screenshots

*(Add screenshots here after deploying — a `docs/` folder with the images is the convention.)*

1. **Home** — hero with the two call-to-action buttons and the four capability cards.
2. **Dashboard (default, 50 mm/hr)** — floating control panels over the live map; roads
   already split across safe → high risk.
3. **Dashboard (cloudburst, 78 mm/hr @ +3h)** — most corridors flip to High/Severe; alert
   feed and statistics update with count-up animation.
4. **Flood-safe routing** — the cyan flood-aware route beside the dashed red conventional
   route, with the A/B comparison readout.
5. **How It Works** — the seven-step coupling pipeline with the worked example.

## The Coupling Engine (How the Numbers Are Made)

`src/utils/floodPredictionEngine.ts` is deterministic and fully explainable. For every road
segment, at a given rainfall intensity `R` (mm/hr) and horizon multiplier `m` (1.00 / 1.15 /
1.30 / 1.45):

1. **Effective rainfall** — `R_eff = R × m`, mimicking a radar nowcast through time.
2. **Surface runoff** — `Q_runoff = 0.0036 × R_eff × catchmentArea(m²) × 0.85`, where `0.85`
   is the standard imperviousness coefficient for dense urban catchments and the factor
   `0.0036` converts mm/hr·m² → m³/hr.
3. **Drainage capacity** — the road's inlets are mapped to drainage nodes; the capacities of
   the directed pipes serving each node are summed into `Q_capacity` (m³/hr). A surcharged
   node (pipes already at capacity) reduces effective capacity.
4. **Terrain retention** — the zone's terrain class applies a retention factor
   (depression storage, slope-driven drainage) to the **excess** volume.
5. **Excess & depth** — `excess = Q_runoff − Q_capacity`; if positive, the retained excess
   spreads over the road surface area to yield `depth ≈ (excess × retention) / surfaceArea`,
   reported in centimetres.
6. **Risk class** — thresholds on depth (and runoff/capacity ratio) classify each road as
   Safe, Low, Moderate, High or Severe.

Worked example (100 Ft Road corridor @ 50 mm/hr, Now): catchment ≈ 34,276 m² → runoff
≈ 1,457 m³/hr; 11 inlets feed a node cluster with ≈ 557 m³/hr capacity → excess ≈ 900 m³/hr;
after retention (0.85) the predicted depth is ≈ 6.4 cm → **High risk**. The same math is
printed for any road you click on the dashboard.

## Mock Data

All geography is modelled on real Velachery coordinates (centre ≈ 12.9750° N, 80.2210° E,
Ward 175/181, Zone 13 – Adyar, GCC) but every hydraulic value is synthetic and calibrated for
demonstration:

| File | Contents |
| --- | --- |
| `src/data/velacheryRoads.ts` | 20 road corridors with real alignment coordinates, lengths, lane counts, catchment areas, inlet node mappings |
| `src/data/drainageNodes.ts` | 14 storm-drain nodes (junctions/outfalls), elevations 5.2–9.8 m |
| `src/data/drainagePipes.ts` | 15 directed pipes with hydraulic capacities of 25–95 m³/hr |
| `src/data/terrainData.ts` | terrain zones — elevation, slope, terrain class and a one-line hydrological reasoning |
| `src/data/wardInfo.ts` | Velachery ward/zone context |
| `src/data/routeLocations.ts` | origin/destination suggestions for the route finder |

## Install

```bash
git clone <your-fork-url>
cd DrainCast
npm install
npm run dev        # → http://localhost:5173
```

Requires Node 18+ (built and tested on Node 22).

## Build & Deploy

```bash
npm run build      # → dist/ (static bundle)
npm run preview    # sanity-check the production build locally
```

- **Vercel** — import the repo; framework preset *Vite*; no environment variables needed
  (`vercel.json` is included).
- **Netlify** — import the repo; build command `npm run build`, publish directory `dist`
  (`netlify.toml` is included).
- **Cloudflare Pages** — connect the repo; build command `npm run build`, output `dist`.
- Any static host works — the app is a single `dist/` folder.

## Innovation

- **Coupling, not correlation** — risk is not a colour scale over rainfall; it emerges from
  the *difference* between runoff load and drain capacity, modulated by terrain. Two roads
  under the same rain can hold different risk classes because their drains differ.
- **Drains as a directed graph** — pipes have direction and capacity, so downstream
  surcharge logically propagates upstream, which is exactly how urban flooding behaves.
- **Flood-aware routing as a first-class output** — the SIH26085 problem statement asks for
  route advisories, not just a map; DrainCast's A/B comparison makes the value of
  nowcasting tangible in one glance.
- **Zero-infrastructure demo** — the entire pipeline runs client-side, so the prototype can
  be handed to any stakeholder as a link.

## Future Scope

- Swap the rainfall slider for real IMD/NCMRWF Doppler-radar nowcast tiles via a queued
  ingestion API.
- Calibrate catchment areas, pipe capacities and terrain retention against GCC storm-water
  records and observed flood reports.
- Hydraulic routing (e.g. SWMM-style) instead of static capacity comparison, with
  backflow/surcharge propagation over the 0–3 h window.
- Live crowdsourced depth reports as a bias-correction signal.
- Extend the graph city-wide and expose the route finder as a public API for navigation
  apps.

## Disclaimer

DrainCast is a hackathon prototype with synthetic, illustrative data. **It must not be used
for real flood response, evacuation or navigation decisions.** Depths, capacities and risk
classes are modelled for demonstration, not calibrated forecasts.

---

**SIH 2026 Software Edition – Demo Prototype** · Problem Statement SIH26085
