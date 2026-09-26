# DrainCast — Screenshot Guide

Capture these eight shots after deploying (or from `npm run dev`). Use a
1920×1080 (or 1512×980) window, dark theme unless noted, and hide browser
bookmarks for a clean frame. Save as `docs/screenshots/*.png` and embed them
in the README.

| # | File name | Where | What to set up first | What it proves |
| --- | --- | --- | --- | --- |
| 1 | `01-landing.png` | `/` | Dark theme | Minimal product entry, tagline, single CTA |
| 2 | `02-dashboard-default.png` | `/dashboard` | Default 40 mm/hr, Now | Full workspace: map + all floating panels, top bar clock |
| 3 | `03-dashboard-cloudburst.png` | `/dashboard` | Scenario **Cloudburst 75** | Live recolouring — orange/red corridors, populated alert feed |
| 4 | `04-dashboard-3h.png` | `/dashboard` | Cloudburst 75 **+ 3 HR** | Nowcast horizon escalation (15 severe), distribution bars |
| 5 | `05-road-intelligence.png` | `/dashboard` | Shot 4, then click the worst alert | Full explainability panel: WHY + recommendation |
| 6 | `06-drainage-graph.png` | `/dashboard` | Open **Drainage Graph View** | The directed node–edge model with capacities |
| 7 | `07-route-found.png` | `/dashboard` | Cloudburst 75, find a route (e.g. Phoenix Marketcity → Ram Nagar) | Cyan flood-aware route vs dashed-red conventional A/B |
| 8 | `08-light-theme.png` | `/dashboard` | Toggle **light mode**, Heavy 40 | Theme system; risk colours stay identical |

Tips:

- For shot 5, click an **alert row** — the map flies to the road and the
  panel slides in, which also demonstrates the interaction.
- For shot 7, pick an origin/destination pair where the two routes visibly
  diverge at cloudburst intensity.
- Optional ninth shot: mobile layout at 390×844 to show responsiveness.
- Name files exactly as listed; the README table references these names.
