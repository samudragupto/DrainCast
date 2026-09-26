export type Coord = [number, number]

export type RoadType = 'Main Road' | 'Arterial Road' | 'Residential Street'

export type TerrainClass = 'Low-Lying' | 'Moderately Low' | 'Slightly Elevated'

export type TerrainInfluence = 'Low-Lying' | 'Moderate' | 'Relatively Higher'

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'severe'

export type TimeHorizon = 'now' | '1h' | '2h' | '3h'

export type RainfallCategory = 'Light Rain' | 'Moderate Rain' | 'Heavy Rain' | 'Very Heavy Rain' | 'Cloudburst'

export type Recommendation = 'Safe' | 'Caution' | 'Avoid During Heavy Rainfall'

export type DrainageNodeType = 'Manhole' | 'Stormwater Inlet' | 'Junction'

export interface RoadSegment {
  id: string
  roadName: string
  coordinates: Coord[]
  connectedDrainNodeId: string
  roadLengthM: number
  roadType: RoadType
  areaName: string
}

export interface DrainageNode {
  id: string
  nodeName: string
  type: DrainageNodeType
  position: Coord
  elevationM: number
}

export interface DrainagePipe {
  id: string
  from: string
  to: string
  capacityM3Hr: number
}

export interface TerrainZone {
  areaName: string
  center: Coord
  radiusM: number
  avgElevationM: number
  avgSlopeDeg: number
  terrainClass: TerrainClass
  reason: string
}

export interface FloodEvent {
  year: number
  event: string
  impact: string
}

export interface WardInfo {
  wardName: string
  city: string
  state: string
  center: Coord
  catchmentAreaKm2: number
  selectionReason: string
  residents: number
  populationNote: string
  drainageContext: string
  floodHistory: FloodEvent[]
  floodHotspots: string[]
}

export interface RoadPrediction {
  effectiveRainfallMmHr: number
  catchmentAreaM2: number
  runoffM3Hr: number
  inletCount: number
  drainCapacityM3Hr: number
  utilizationPct: number
  excessM3Hr: number
  retainedM3Hr: number
  waterDepthCm: number
  risk: RiskLevel
  terrainClass: TerrainClass
  terrainInfluence: TerrainInfluence
  terrainFactor: number
  reason: string
  why: string
  recommendation: Recommendation
}

export interface PredictedRoad {
  road: RoadSegment
  prediction: RoadPrediction
}

export type RiskDistribution = Record<RiskLevel, number>

export interface HorizonSummary {
  horizon: TimeHorizon
  label: string
  multiplier: number
  effectiveRainfallMmHr: number
  runoffM3Hr: number
  capacityM3Hr: number
  distribution: RiskDistribution
  highCount: number
  severeCount: number
  maxDepthCm: number
}

export interface DrainageSummary {
  nodeCount: number
  pipeCount: number
  avgCapacityM3Hr: number
  totalCapacityM3Hr: number
  graphType: string
}

export interface TerrainSummary {
  dominantClass: TerrainClass
  elevationMinM: number
  elevationMaxM: number
  slopeMinDeg: number
  slopeMaxDeg: number
  lowLyingAtRisk: number
}

export interface NetworkPrediction {
  rainfallIntensityMmHr: number
  effectiveRainfallMmHr: number
  rainfallCategory: RainfallCategory
  horizon: TimeHorizon
  horizonLabel: string
  roads: PredictedRoad[]
  byRoadId: Record<string, RoadPrediction>
  totals: { runoffM3Hr: number; capacityM3Hr: number; utilizationPct: number }
  distribution: RiskDistribution
  distributionPct: RiskDistribution
  noLowCount: number
  moderateCount: number
  highCount: number
  severeCount: number
  maxDepthCm: number
  atRiskCount: number
  atRiskLengthM: number
  affectedResidents: number
  avgDepthCm: number
  drainage: DrainageSummary
  terrain: TerrainSummary
  horizonSeries: HorizonSummary[]
}

export interface RouteLocation {
  id: string
  name: string
  area: string
  position: Coord
  category: string
}

export interface RouteExposure {
  distanceM: number
  durationMin: number
  highCount: number
  severeCount: number
  maxRisk: RiskLevel
  roadNames: string[]
}

export interface ComputedRoute {
  feasible: boolean
  message?: string
  start: RouteLocation
  destination: RouteLocation
  coords: Coord[]
  viaRoadNames: string[]
  distanceM: number
  durationMin: number
  exposure: RouteExposure
  conventional: (RouteExposure & { coords: Coord[] }) | null
  sameAsConventional: boolean
}
