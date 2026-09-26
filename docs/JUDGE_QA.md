# DrainCast — Judge Q&A Preparation

Twelve most-expected questions with precise, confident answers. Keep answers
under 30 seconds each. Where a number helps, use the worked example:
*Velachery Main Road (West) @ 40 mm/hr → 1,165 m³/hr runoff vs 557 m³/hr
drain capacity → 6.9 cm depth → Moderate risk.*

---

### 1. Why did you not use real IMD Doppler Radar data?

> "Access. Live Doppler nowcast feeds (IMD/NCMRWF) are not open APIs — they
> require institutional agreements. So we built the system around a clean
> input contract: a rainfall intensity field with a 0–3 hour horizon. The
> slider and horizon multipliers implement exactly that contract. When a
> nowcast feed is available, it replaces the slider — the coupling engine,
> graph and routing don't change by a single line. That's why the backend
> endpoint `/api/predict/flood-risk` takes an intensity and horizon, not a
> mouse drag."

### 2. What do you mean by Rainfall–Drainage–Terrain Coupling?

> "Three models in one computation. Rainfall gives the load: rational-method
> runoff over each road's paved catchment. Drainage gives the limit: the
> directed pipe graph's carrying capacity at the road's connected node.
> Terrain gives the behaviour: low-lying pockets retain nearly all excess
> water, elevated corridors shed some. Risk is what's left: excess water,
> as depth, on that street. Remove any one of the three and the prediction
> stops being street-level — that's why coupling is the whole idea."

### 3. Why a Directed Graph for the drainage network?

> "Because water has direction. A pipe from junction A to B with 85 m³/hr
> capacity tells you nothing about B to A — there may be no pipe, or a
> smaller one. We model nodes as manholes/inlets/junctions and directed
> edges as pipes with capacity. Node outflow, flow paths to the outfall,
> and downstream surcharge all fall out of the graph naturally — we use
> NetworkX for exactly this in the backend. An undirected or tabular model
> cannot express 'this inlet's trunk can only carry 55 m³/hr downstream'."

### 4. How are you estimating water depth without hydraulic equations?

> "We use a lumped volumetric model instead of full Saint-Venant/SWMM
> hydraulics: excess flow (m³/hr) spread over the ponding fraction of the
> carriageway gives depth. It's the standard first-order approach for
> nowcasting at street granularity, and it's honest about being an
> estimate — we report depth bands, not millimetre precision. The upgrade
> path is SWMM-style dynamic wave routing, which slots into the same
> engine output: the backend architecture is built for that swap."

### 5. How is DrainCast different from weather apps showing rainfall alerts?

> "Weather apps answer 'will it rain?'. DrainCast answers 'where will water
> stand, how deep, and where can I still drive?'. The difference is
> infrastructure-aware: the same rainfall over two adjacent roads gives two
> different risks in our system, because their drains and elevations differ.
> Plus routing: we don't just inform, we re-route."

### 6. Why is your solution feasible for SIH?

> "Every input already exists in India: IMD/NCMRWF radar nowcasts, municipal
> stormwater asset registers (GCC maintains one for Chennai), and open DEMs
> like SRTM/Cartosat. Our entire pipeline runs client-side or on a single
> Flask worker — no GPU, no ML training, no exotic infra. Pilot cost is
> data-cleaning effort, not technology risk."

### 7. Why did you keep the backend separate and not connect it to the frontend?

> "Presentation reliability and honesty. The frontend runs fully
> client-side so the demo works offline, on any projector, with zero setup —
> no 'please wait for the server' moments on stage. The Flask + NetworkX
> backend demonstrates the production architecture: same constants, same
> numbers, documented endpoints. Connecting them is one fetch call per
> panel; the response shapes already match road-for-road."

### 8. Which area did you choose and why?

> "Velachery, Chennai — Ward 175/181, Zone 13. It's a textbook urban flood
> basin: a former lake catchment next to the Pallikaranai marsh, elevation
> falling from about 9 metres at the Taramani interface to 5.2 at the marsh
> fringe, and a documented flood history — Cyclone Michaung in December 2023
  put most of it underwater. If a nowcasting prototype works here, it works
  anywhere in the city."

### 9. Can this scale to other Indian cities?

> "Yes — the pipeline is data-driven, not Velachery-hardcoded. You swap
> three datasets: road network, drainage assets, DEM. The engine, the risk
> taxonomy, the graph model and the UI carry over untouched. The backend
> was structured exactly for this: per-ward JSON today, PostGIS + a queue
> for city-wide tomorrow. Number of roads changes; the physics doesn't."

### 10. What is your Unique Selling Point (USP)?

> "Explainable coupling with routing built in. Most flood dashboards show a
> coloured map; ours shows the arithmetic — catchment, inlets, the exact
> drainage node, pipe capacity, excess, terrain — and then converts the
> same prediction into an actionable route. Judges can audit any single
> colour on screen in under a minute. That auditability is what makes a
> corporation actually trust and deploy it."

### 11. How does 0–3 hour nowcasting help?

> "Zero to three hours is the operational window. It's long enough to
> preposition pumps and close underpasses before the water arrives, and
> short enough that the forecast is physics-driven rather than
> probabilistic — you're propagating a measured radar echo, not guessing a
> day ahead. For citizens it covers the commute decision; for the GCC
> control room it covers the deployment decision."

### 12. How can a Municipal Corporation use this system?

> "Three ways. Operations: the alerts feed and 0–3 hour timeline become the
> control-room screen — which corridors to pump, which underpasses to close.
> Planning: the same engine identifies chronically under-drained corridors —
> capacity upgrades can be simulated by editing pipe capacities in the graph
> and re-running. Public communication: street-level advisories and
> flood-safe routes replace blanket 'heavy rain' warnings."

---

## Rapid-fire backups (if judges push further)

- **"Why 85% imperviousness?"** — Standard rational-method coefficient for
  dense urban catchment (pavement + roofs); conservative and citable.
- **"What about backflow?"** — Modelled as capacity exhaustion: a surcharged
  node stops accepting upstream flow, which our per-road excess calculation
  captures; dynamic backflow needs SWMM routing (future scope, documented).
- **"Data volume?"** — This ward: 20 roads, 14 nodes, 15 pipes, ~26 KB JSON.
  A city of 200 wards stays well under PostGIS basics.
- **"Accuracy?"** — We report depth *bands* and confidence comes from
  explainability; calibration against observed flood reports is listed as
  future work, deliberately not claimed.
