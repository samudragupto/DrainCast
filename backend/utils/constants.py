"""Shared model constants — mirrors frontend/src/utils/floodPredictionEngine.ts.

Every value here is explainable in one sentence during a judge demo.
"""

# Rational-method runoff
IMPERVIOUSNESS = 0.85          # share of dense urban catchment that is paved/roofed
INLET_SPACING_M = 140          # one stormwater inlet every N metres of carriageway
NETWORK_EFFICIENCY = 0.92      # field efficiency of the drain network
LOCAL_POOL_FRACTION = 0.22     # share of carriageway over which excess water ponds
OUTFALL_CAPACITY_M3H = 90      # rated outflow at a terminal node with no downstream pipe

# Slider / scenario bounds (mm/hr)
RAINFALL_MIN = 5
RAINFALL_MAX = 80

# 0–3 hour nowcast horizons and their intensity multipliers
TIME_HORIZONS = {
    "now": {"label": "Now", "multiplier": 1.00},
    "1h": {"label": "+1 Hour", "multiplier": 1.15},
    "2h": {"label": "+2 Hours", "multiplier": 1.30},
    "3h": {"label": "+3 Hours", "multiplier": 1.45},
}

# Rainfall classification (IMD-style hourly intensity bands)
RAINFALL_CATEGORIES = [
    (16, "Light Rain"),
    (31, "Moderate Rain"),
    (51, "Heavy Rain"),
    (71, "Very Heavy Rain"),
    (float("inf"), "Cloudburst"),
]

# Flood risk taxonomy — identical colours in both UI themes
RISK_LEVELS = ["safe", "low", "moderate", "high", "severe"]
RISK_COLORS = {
    "safe": "#22C55E",
    "low": "#A3E635",
    "moderate": "#F59E0B",
    "high": "#F97316",
    "severe": "#DC2626",
}
RISK_LABELS = {
    "safe": "No Risk",
    "low": "Low Risk",
    "moderate": "Moderate Risk",
    "high": "High Risk",
    "severe": "Severe Risk",
}
RISK_DEPTH_BANDS = {
    "safe": "0–2 cm",
    "low": "3–6 cm",
    "moderate": "7–12 cm",
    "high": "13–20 cm",
    "severe": "21–35 cm",
}

# Risk routing penalties for flood-aware path costs
RISK_ROUTE_WEIGHT = {"safe": 1.0, "low": 1.2, "moderate": 2.0, "high": 3.5, "severe": 8.0}

# Effective carriageway width per road class (m) — defines the runoff catchment
CARRIAGE_WIDTH_M = {
    "Main Road": 22,
    "Arterial Road": 18,
    "Residential Street": 11,
}

# Terrain influence on excess water retention
TERRAIN_RETENTION = {
    "Low-Lying": 1.00,
    "Moderately Low": 0.85,
    "Slightly Elevated": 0.70,
}
TERRAIN_INFLUENCE = {
    "Low-Lying": "Low-Lying",
    "Moderately Low": "Moderate",
    "Slightly Elevated": "Relatively Higher",
}

# Flood-aware routing assumptions
AVG_SPEED_M_PER_MIN = 400      # ~24 km/h mixed urban traffic
CLUSTER_TOLERANCE_M = 70       # junction snapping distance for the road graph
