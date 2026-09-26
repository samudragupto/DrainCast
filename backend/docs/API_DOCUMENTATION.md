# DrainCast API Documentation

Base URL (local): `http://localhost:5000`

All responses are JSON. Every response carries an `"ok": true|false` flag.
Validation failures return HTTP 400 with `{"ok": false, "error": "..."}`.

Error responses are uniform:

```json
{ "ok": false, "error": "rainfall_intensity_mm_hr must be between 5 and 80" }
```

---

## GET /api/health

Liveness probe.

```json
{ "ok": true, "service": "draincast-backend", "version": "1.0.0", "status": "healthy" }
```

---

## GET /api/ward/info

Velachery ward context (demography, drainage context, flood history) plus the
ward boundary polygon.

```json
{
  "ok": true,
  "ward": {
    "wardName": "Velachery",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "center": [12.975, 80.221],
    "catchmentAreaKm2": 4.6,
    "residents": 89000,
    "floodHistory": [ { "year": 2023, "event": "Cyclone Michaung", "impact": "..." } ]
  },
  "boundary": { "wardName": "Velachery", "polygon": [[12.99, 80.21], "..."] }
}
```

---

## GET /api/terrain/analysis

DEM-derived terrain picture for the ward.

**Response (abridged):**

```json
{
  "ok": true,
  "summary": {
    "dominantClass": "Moderately Low",
    "classCounts": { "Low-Lying": 7, "Moderately Low": 9, "Slightly Elevated": 4 },
    "elevationMinM": 5.2,
    "elevationMaxM": 9.3,
    "slopeMinDeg": 0.3,
    "slopeMaxDeg": 1.9,
    "zoneCount": 17,
    "keyReason": "Lower elevation zones tend to accumulate surface runoff faster due to gravity flow."
  },
  "zones": [ { "areaName": "Velachery Main Road", "avgElevationM": 6.8, "avgSlopeDeg": 0.8,
               "terrainClass": "Moderately Low", "reason": "..." } ]
}
```

---

## GET /api/drainage/graph

The complete stormwater network as a directed graph — the core
"graph-based drainage model" required by SIH26085.

```json
{
  "ok": true,
  "summary": {
    "graphType": "Directed Graph (Node–Edge Model)",
    "isDirected": true,
    "nodeCount": 14,
    "edgeCount": 15,
    "avgPipeCapacityM3Hr": 60.3,
    "totalPipeCapacityM3Hr": 905,
    "sinks": ["MH-VEL-10"],
    "sources": ["MH-VEL-01", "SI-VEL-05"],
    "connected": true
  },
  "nodes": [ { "id": "MH-VEL-01", "name": "MH-VEL-01", "type": "Manhole",
               "position": [12.9902, 80.2072], "elevationM": 8.6,
               "inDegree": 0, "outDegree": 1 } ],
  "edges": [ { "pipeId": "P-101", "from": "MH-VEL-01", "to": "SI-VEL-02",
               "capacityM3Hr": 85 } ]
}
```

## GET /api/drainage/nodes

Every node with its rated outflow and gravity path to the outfall.

```json
{
  "ok": true,
  "count": 14,
  "nodes": [
    { "id": "MH-VEL-01", "nodeName": "MH-VEL-01", "type": "Manhole",
      "position": [12.9902, 80.2072], "elevationM": 8.6,
      "outflowCapacityM3Hr": 85,
      "downstreamToOutfall": ["MH-VEL-01", "SI-VEL-02", "JN-VEL-03", "SI-VEL-14", "SI-VEL-08", "JN-VEL-09", "MH-VEL-10"] }
  ]
}
```

## GET /api/drainage/pipes

```json
{ "ok": true, "count": 15, "pipes": [ { "id": "P-101", "from": "MH-VEL-01", "to": "SI-VEL-02", "capacityM3Hr": 85 } ] }
```

---

## GET /api/roads

Road segments, optionally enriched with live predictions.

**Query params:** `intensity_mm_hr` (5–80, default 40), `horizon`
(`now|1h|2h|3h`, default `now`), `risk` (filter by level).

```
GET /api/roads?intensity_mm_hr=75&horizon=3h&risk=severe
```

```json
{
  "ok": true,
  "count": 15,
  "params": { "intensityMmHr": 75, "horizon": "3h", "effectiveIntensityMmHr": 108.75 },
  "riskColors": { "safe": "#22C55E", "low": "#A3E635", "moderate": "#F59E0B", "high": "#F97316", "severe": "#DC2626" },
  "roads": [
    {
      "id": "RD-VMW-01", "roadName": "Velachery Main Road (West)", "areaName": "Velachery Main Road",
      "roadType": "Main Road", "roadLengthM": 1558,
      "prediction": {
        "runoffM3Hr": 3429.5, "drainCapacityM3Hr": 556.7, "excessM3Hr": 2872.8,
        "waterDepthCm": 38.2, "risk": "severe", "riskLabel": "Severe Risk",
        "terrainInfluence": "Moderate", "recommendation": "Avoid During Heavy Rainfall",
        "why": "At an effective intensity of 109 mm/hr (+3 Hours horizon)…"
      }
    }
  ]
}
```

---

## POST /api/predict/flood-risk

The core coupling engine. Predicts every road's flood risk and water depth.

**Request body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `rainfall_intensity_mm_hr` | number | yes | 5–80 |
| `time_horizon` | string | no | `now` (default), `1h`, `2h`, `3h` |

```bash
curl -X POST http://localhost:5000/api/predict/flood-risk \
  -H "Content-Type: application/json" \
  -d '{"rainfall_intensity_mm_hr": 55, "time_horizon": "1h"}'
```

**Response (abridged):**

```json
{
  "ok": true,
  "prediction": {
    "rainfallIntensityMmHr": 55,
    "effectiveRainfallMmHr": 63.25,
    "rainfallCategory": "Very Heavy Rain",
    "horizon": "1h",
    "horizonLabel": "+1 Hour",
    "roads": [ { "roadId": "RD-VMW-01", "runoffM3Hr": 2001.2, "drainCapacityM3Hr": 556.7,
                 "excessM3Hr": 1444.5, "waterDepthCm": 15.4, "risk": "high",
                 "recommendation": "Caution", "why": "…" } ],
    "totals": { "runoffM3Hr": 14825, "capacityM3Hr": 7783, "utilizationPct": 190.5 },
    "distribution": { "safe": 2, "low": 3, "moderate": 11, "high": 4, "severe": 0 },
    "distributionPct": { "safe": 10, "low": 15, "moderate": 55, "high": 20, "severe": 0 },
    "maxDepthCm": 15.4,
    "atRiskCount": 15,
    "drainage": { "nodeCount": 14, "edgeCount": 15, "graphType": "Directed Graph (Node–Edge Model)" },
    "terrain": { "dominantClass": "Moderately Low", "lowLyingAtRisk": 0, "nodeCount": 14 },
    "horizonSeries": [ { "horizon": "now", "label": "Now", "multiplier": 1.0, "…": "…" } ]
  }
}
```

---

## GET /api/nowcast/0-3hr

Sweep across the four nowcast horizons.

**Query params:** `rainfall_mm_hr` (5–80, default 40).

```json
{
  "ok": true,
  "baseIntensityMmHr": 75,
  "rainfallCategory": "Cloudburst",
  "series": [
    { "horizon": "now", "label": "Now", "multiplier": 1.0, "effectiveRainfallMmHr": 75.0,
      "distribution": { "safe": 1, "low": 1, "moderate": 5, "high": 13, "severe": 0 },
      "highCount": 13, "severeCount": 0, "maxDepthCm": 18.4 },
    { "horizon": "3h", "label": "+3 Hours", "multiplier": 1.45, "effectiveRainfallMmHr": 108.75,
      "distribution": { "safe": 0, "low": 0, "moderate": 0, "high": 5, "severe": 15 },
      "highCount": 5, "severeCount": 15, "maxDepthCm": 30.6 }
  ]
}
```

---

## POST /api/routing/flood-aware

Evaluates a flood-aware route and, for comparison, the conventional shortest
path — both as risk-weighted / plain Dijkstra over the road graph.

**Request body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `start_id` | string \| [lat,lng] | yes | location id (see `/api/routing/locations`) or raw coords |
| `destination_id` | string \| [lat,lng] | yes | as above |
| `rainfall_intensity_mm_hr` | number | no | 5–80, default 40 |
| `time_horizon` | string | no | `now` (default), `1h`, `2h`, `3h` |

```bash
curl -X POST http://localhost:5000/api/routing/flood-aware \
  -H "Content-Type: application/json" \
  -d '{"start_id": "phoenix", "destination_id": "ramnagar",
       "rainfall_intensity_mm_hr": 55, "time_horizon": "now"}'
```

**Response (abridged):**

```json
{
  "ok": true,
  "feasible": true,
  "floodAware": {
    "distanceM": 3389.0, "durationMin": 8.5,
    "highCount": 0, "severeCount": 0, "maxRisk": "moderate",
    "steps": [ { "roadId": "RD-…", "roadName": "…", "risk": "low", "waterDepthCm": 3.1, "lengthM": 412.0 } ]
  },
  "conventional": { "distanceM": 3381.0, "highCount": 0, "severeCount": 0, "steps": ["…"] },
  "sameAsConventional": false
}
```

---

## GET /api/predict/analytics/risk-summary

Aggregated statistics across the 0–3 hour window.

**Query params:** `intensity_mm_hr` (default 40).

Returns `current` (distribution, totals, depths) + per-horizon breakdowns +
the drainage summary — one call for an entire dashboard header.

---

## GET /api/meta

Shared taxonomy: risk levels, colors and horizon multipliers, so any client
renders risk identically to the reference UI.
