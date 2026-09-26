"""Typed dataclasses for every entity the DrainCast API returns."""

from dataclasses import asdict, dataclass, field
from typing import Any, Optional


@dataclass(frozen=True)
class Coord:
    lat: float
    lng: float


@dataclass(frozen=True)
class DrainageNode:
    id: str
    nodeName: str
    type: str            # Manhole | Stormwater Inlet | Junction
    position: tuple      # (lat, lng)
    elevationM: float


@dataclass(frozen=True)
class DrainagePipe:
    id: str
    frm: str
    to: str
    capacityM3Hr: float


@dataclass(frozen=True)
class RoadSegment:
    id: str
    roadName: str
    coordinates: list    # [[lat, lng], ...]
    connectedDrainNodeId: str
    roadLengthM: float
    roadType: str        # Main Road | Arterial Road | Residential Street
    areaName: str


@dataclass(frozen=True)
class TerrainZone:
    areaName: str
    center: tuple
    radiusM: float
    avgElevationM: float
    avgSlopeDeg: float
    terrainClass: str    # Low-Lying | Moderately Low | Slightly Elevated
    reason: str


@dataclass
class RoadPrediction:
    roadId: str
    roadName: str
    areaName: str
    effectiveRainfallMmHr: float
    catchmentAreaM2: float
    runoffM3Hr: float
    inletCount: int
    drainCapacityM3Hr: float
    utilizationPct: float
    excessM3Hr: float
    retainedM3Hr: float
    waterDepthCm: float
    risk: str
    riskLabel: str
    terrainClass: str
    terrainInfluence: str
    terrainFactor: float
    recommendation: str
    why: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class HorizonSummary:
    horizon: str
    label: str
    multiplier: float
    effectiveRainfallMmHr: float
    runoffM3Hr: float
    capacityM3Hr: float
    distribution: dict
    highCount: int
    severeCount: int
    maxDepthCm: float

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class NetworkPrediction:
    rainfallIntensityMmHr: float
    effectiveRainfallMmHr: float
    rainfallCategory: str
    horizon: str
    horizonLabel: str
    roads: list
    totals: dict
    distribution: dict
    distributionPct: dict
    maxDepthCm: float
    atRiskCount: int
    avgDepthCm: float
    drainage: dict
    terrain: dict
    horizonSeries: list = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["roads"] = [r.to_dict() if hasattr(r, "to_dict") else r for r in self.roads]
        d["horizonSeries"] = [h.to_dict() if hasattr(h, "to_dict") else h for h in self.horizonSeries]
        return d


@dataclass
class RouteStep:
    roadId: str
    roadName: str
    risk: str
    waterDepthCm: float
    lengthM: float


@dataclass
class RouteEvaluation:
    startId: str
    destinationId: str
    feasible: bool
    message: Optional[str]
    distanceM: float = 0.0
    durationMin: float = 0.0
    highCount: int = 0
    severeCount: int = 0
    maxRisk: str = "safe"
    steps: list = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["steps"] = [asdict(s) for s in self.steps]
        return d
