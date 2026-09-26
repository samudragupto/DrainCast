"""0–3 hour nowcast: applies the horizon multipliers to the rainfall input.

The multipliers stand in for a Doppler-radar nowcast: a storm cell intensifying
over the ward is modelled as the same rainfall field growing through time.
"""

from core.flood_engine import predict_network
from utils.constants import RAINFALL_MAX, RAINFALL_MIN, TIME_HORIZONS
from utils.helpers import classify_rainfall


def nowcast_series(intensity_mm_hr: float) -> dict:
    """Per-horizon summaries plus the full prediction for each horizon."""
    series = []
    for horizon, meta in TIME_HORIZONS.items():
        prediction = predict_network(intensity_mm_hr, horizon)
        series.append(
            {
                "horizon": horizon,
                "label": meta["label"],
                "multiplier": meta["multiplier"],
                "effectiveRainfallMmHr": prediction.effectiveRainfallMmHr,
                "distribution": prediction.distribution,
                "highCount": prediction.distribution["high"],
                "severeCount": prediction.distribution["severe"],
                "maxDepthCm": prediction.maxDepthCm,
                "runoffM3Hr": prediction.totals["runoffM3Hr"],
                "capacityM3Hr": prediction.totals["capacityM3Hr"],
            }
        )

    return {
        "baseIntensityMmHr": intensity_mm_hr,
        "rainfallCategory": classify_rainfall(intensity_mm_hr),
        "validRange": [RAINFALL_MIN, RAINFALL_MAX],
        "series": series,
    }
