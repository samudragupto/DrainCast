import { drainageNodeById, drainageNodes } from '../data/drainageNodes'
import { drainagePipes } from '../data/drainagePipes'
import { terrainByArea, terrainData } from '../data/terrainData'
import { NETWORK_LENGTH_M, velacheryRoads } from '../data/velacheryRoads'
import { wardInfo } from '../data/wardInfo'
import type {
  DrainageSummary,
  HorizonSummary,
  NetworkPrediction,
  PredictedRoad,
  RainfallCategory,
  Recommendation,
  RiskDistribution,
  RiskLevel,
  RoadPrediction,
  RoadSegment,
  RoadType,
  TerrainClass,
  TerrainInfluence,
  TerrainSummary,
  TimeHorizon,
} from '../types'
import { fmtInt } from './format'

/* ------------------------------------------------------------------ */
/* Model constants — explainable in one sentence each                  */
/* ------------------------------------------------------------------ */

export const RAINFALL_MIN = 5
export const RAINFALL_MAX = 80
export const DEFAULT_RAINFALL = 40

/** Share of a dense urban catchment that is paved/roofed (rational method). */
export const IMPERVIOUSNESS = 0.85
/** One stormwater inlet every N metres of carriageway (GCC norm ~140 m). */
export const INLET_SPACING_M = 140
/** Field efficiency of the drain network (blockage, design margin). */
export const NETWORK_EFFICIENCY = 0.92
/** Share of the carriageway over which excess water actually ponds. */
export const LOCAL_POOL_FRACTION = 0.22
/** Rated outflow assumed at a terminal node with no downstream pipe. */
export const OUTFALL_CAPACITY_M3H = 90

export const HORIZONS: { id: TimeHorizon; label: string; short: string; multiplier: number }[] = [
  { id: 'now', label: 'Now', short: 'NOW', multiplier: 1.0 },
  { id: '1h', label: '+1 Hour', short: '+1 HR', multiplier: 1.15 },
  { id: '2h', label: '+2 Hours', short: '+2 HR', multiplier: 1.3 },
  { id: '3h', label: '+3 Hours', short: '+3 HR', multiplier: 1.45 },
]

export const TIME_MULTIPLIERS: Record<TimeHorizon, number> = {
  now: 1.0,
  '1h': 1.15,
  '2h': 1.3,
  '3h': 1.45,
}

export const RAINFALL_SCENARIOS: { label: string; intensity: number }[] = [
  { label: 'Drizzle', intensity: 12 },
  { label: 'Moderate', intensity: 25 },
  { label: 'Heavy', intensity: 40 },
  { label: 'Very Heavy', intensity: 55 },
  { label: 'Cloudburst', intensity: 75 },
]

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#22C55E',
  low: '#A3E635',
  moderate: '#F59E0B',
  high: '#F97316',
  severe: '#DC2626',
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  safe: 'No Risk',
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  severe: 'Severe Risk',
}

export const RISK_SHORT: Record<RiskLevel, string> = {
  safe: 'SAFE',
  low: 'LOW',
  moderate: 'MODERATE',
  high: 'HIGH',
  severe: 'SEVERE',
}

export const RISK_ORDER: RiskLevel[] = ['safe', 'low', 'moderate', 'high', 'severe']

export const RISK_DEPTH_BANDS: Record<RiskLevel, string> = {
  safe: '0–2 cm',
  low: '3–6 cm',
  moderate: '7–12 cm',
  high: '13–20 cm',
  severe: '21–35 cm',
}

export const RAINFALL_CATEGORY_COLORS: Record<RainfallCategory, string> = {
  'Light Rain': '#22C55E',
  'Moderate Rain': '#A3E635',
  'Heavy Rain': '#F59E0B',
  'Very Heavy Rain': '#F97316',
  Cloudburst: '#DC2626',
}

const CARRIAGE_WIDTH_M: Record<RoadType, number> = {
  'Main Road': 22,
  'Arterial Road': 18,
  'Residential Street': 11,
}

const TERRAIN_RETENTION: Record<TerrainClass, number> = {
  'Low-Lying': 1.0,
  'Moderately Low': 0.85,
  'Slightly Elevated': 0.7,
}

const TERRAIN_INFLUENCE: Record<TerrainClass, TerrainInfluence> = {
  'Low-Lying': 'Low-Lying',
  'Moderately Low': 'Moderate',
  'Slightly Elevated': 'Relatively Higher',
}

const RISK_RANK: Record<RiskLevel, number> = {
  safe: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
}

/* ------------------------------------------------------------------ */
/* Rainfall classification (IMD-style hourly intensity bands)          */
/* ------------------------------------------------------------------ */

export function rainfallCategory(mmHr: number): RainfallCategory {
  if (mmHr < 16) return 'Light Rain'
  if (mmHr < 31) return 'Moderate Rain'
  if (mmHr < 51) return 'Heavy Rain'
  if (mmHr < 71) return 'Very Heavy Rain'
  return 'Cloudburst'
}

/* ------------------------------------------------------------------ */
/* Drainage network lookups                                            */
/* ------------------------------------------------------------------ */

const pipesFromNode = new Map<string, typeof drainagePipes>()
drainagePipes.forEach((pipe) => {
  const arr = pipesFromNode.get(pipe.from) ?? []
  arr.push(pipe)
  pipesFromNode.set(pipe.from, arr)
})

export function nodeOutflowCapacityM3Hr(nodeId: string): number {
  const out = pipesFromNode.get(nodeId)
  if (!out || out.length === 0) return OUTFALL_CAPACITY_M3H
  return Math.max(...out.map((p) => p.capacityM3Hr))
}

export function outgoingPipeOf(nodeId: string) {
  const out = pipesFromNode.get(nodeId)
  if (!out || out.length === 0) return null
  return out.reduce((best, p) => (p.capacityM3Hr > best.capacityM3Hr ? p : best), out[0])
}

export function nodeById(nodeId: string) {
  return drainageNodeById.get(nodeId) ?? drainageNodes[0]
}

export function drainageSummary(): DrainageSummary {
  const total = drainagePipes.reduce((s, p) => s + p.capacityM3Hr, 0)
  return {
    nodeCount: drainageNodes.length,
    pipeCount: drainagePipes.length,
    avgCapacityM3Hr: Math.round(total / drainagePipes.length),
    totalCapacityM3Hr: total,
    graphType: 'Directed Graph (Node–Edge Model)',
  }
}

export function terrainSummaryBase(): Omit<TerrainSummary, 'lowLyingAtRisk'> {
  const elevations = drainageNodes.map((n) => n.elevationM)
  const slopes = terrainData.map((z) => z.avgSlopeDeg)
  const counts = new Map<TerrainClass, number>()
  velacheryRoads.forEach((r) => {
    const cls = terrainByArea.get(r.areaName)?.terrainClass ?? 'Moderately Low'
    counts.set(cls, (counts.get(cls) ?? 0) + 1)
  })
  const dominantClass = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  return {
    dominantClass,
    elevationMinM: Math.min(...elevations),
    elevationMaxM: Math.max(...elevations),
    slopeMinDeg: Math.min(...slopes),
    slopeMaxDeg: Math.max(...slopes),
  }
}

export const TERRAIN_KEY_REASON =
  'Lower elevation zones tend to accumulate surface runoff faster due to gravity flow.'

/* ------------------------------------------------------------------ */
/* Prediction engine                                                   */
/* ------------------------------------------------------------------ */

function classifyRisk(depthCm: number): RiskLevel {
  if (depthCm < 2.5) return 'safe'
  if (depthCm < 6.5) return 'low'
  if (depthCm < 12.5) return 'moderate'
  if (depthCm < 20.5) return 'high'
  return 'severe'
}

function recommendationFor(risk: RiskLevel): Recommendation {
  if (risk === 'safe' || risk === 'low') return 'Safe'
  if (risk === 'moderate' || risk === 'high') return 'Caution'
  return 'Avoid During Heavy Rainfall'
}

function buildWhy(
  road: RoadSegment,
  p: {
    runoffM3Hr: number
    drainCapacityM3Hr: number
    excessM3Hr: number
    waterDepthCm: number
    terrainInfluence: TerrainInfluence
    inletCount: number
  },
  effectiveRainfallMmHr: number,
  horizonLabel: string,
): string {
  const node = nodeById(road.connectedDrainNodeId)
  const runoff = fmtInt(p.runoffM3Hr)
  const capacity = fmtInt(p.drainCapacityM3Hr)
  const depth = p.waterDepthCm.toFixed(1)

  const load = `At an effective intensity of ${effectiveRainfallMmHr.toFixed(
    0,
  )} mm/hr (${horizonLabel} horizon), the ${road.areaName} catchment along ${road.roadName} generates about ${runoff} m³/hr of surface runoff — roughly 85% of this corridor is paved, so nearly all of the rain arrives as flow instead of soaking into the ground.`

  const drain =
    p.excessM3Hr <= 0
      ? ` Its ${p.inletCount} inlets discharge into ${node.nodeName}, whose downstream trunk is rated for ${capacity} m³/hr — the drain keeps pace, so water clears almost as fast as it falls.`
      : ` Its ${p.inletCount} inlets discharge into ${node.nodeName}, whose downstream trunk is rated for only ${capacity} m³/hr. That leaves roughly ${fmtInt(
          p.excessM3Hr,
        )} m³/hr of water with nowhere to go.`

  const terrain =
    p.excessM3Hr <= 0
      ? ''
      : ` The corridor sits in ${p.terrainInfluence.toLowerCase()} terrain, so runoff leaves the surface slower and the excess ponds on the carriageway to an estimated ${depth} cm.`

  return load + drain + terrain
}

export function predictRoad(
  road: RoadSegment,
  rainfallMmHr: number,
  horizonLabel = "Now",
): RoadPrediction {
  const width = CARRIAGE_WIDTH_M[road.roadType]
  const catchmentAreaM2 = road.roadLengthM * width
  const terrainClass = terrainByArea.get(road.areaName)?.terrainClass ?? 'Moderately Low'

  const runoffM3Hr = (rainfallMmHr / 1000) * catchmentAreaM2 * IMPERVIOUSNESS

  const inletCount = Math.max(1, Math.round(road.roadLengthM / INLET_SPACING_M))
  const drainCapacityM3Hr =
    nodeOutflowCapacityM3Hr(road.connectedDrainNodeId) * inletCount * NETWORK_EFFICIENCY

  const utilizationPct = (runoffM3Hr / drainCapacityM3Hr) * 100
  const excessM3Hr = Math.max(0, runoffM3Hr - drainCapacityM3Hr)

  const terrainFactor = TERRAIN_RETENTION[terrainClass]
  const retainedM3Hr = excessM3Hr * terrainFactor
  const waterDepthCm =
    catchmentAreaM2 > 0 ? (retainedM3Hr / (catchmentAreaM2 * LOCAL_POOL_FRACTION)) * 100 : 0

  const risk = classifyRisk(waterDepthCm)
  const terrainInfluence = TERRAIN_INFLUENCE[terrainClass]

  const partial = {
    runoffM3Hr,
    drainCapacityM3Hr,
    excessM3Hr,
    waterDepthCm,
    terrainInfluence,
    inletCount,
  }

  const node = nodeById(road.connectedDrainNodeId)
  const reason =
    excessM3Hr <= 0
      ? `Drain keeping pace — ${fmtInt(runoffM3Hr)} m³/hr runoff against ${fmtInt(
          drainCapacityM3Hr,
        )} m³/hr rated capacity at ${node.nodeName}.`
      : `${node.nodeName} surcharged by ${fmtInt(excessM3Hr)} m³/hr; ${terrainInfluence.toLowerCase()} terrain ponds the excess to ~${waterDepthCm.toFixed(1)} cm.`

  const why = buildWhy(road, partial, rainfallMmHr, horizonLabel)

  return {
    effectiveRainfallMmHr: rainfallMmHr,
    catchmentAreaM2,
    runoffM3Hr,
    inletCount,
    drainCapacityM3Hr,
    utilizationPct,
    excessM3Hr,
    retainedM3Hr,
    waterDepthCm,
    risk,
    terrainClass,
    terrainInfluence,
    terrainFactor,
    reason,
    why,
    recommendation: recommendationFor(risk),
  }
}

function emptyDistribution(): RiskDistribution {
  return { safe: 0, low: 0, moderate: 0, high: 0, severe: 0 }
}

function summarizeHorizon(baseRainfallMmHr: number, horizon: TimeHorizon): HorizonSummary {
  const effective = baseRainfallMmHr * TIME_MULTIPLIERS[horizon]
  const predictions = velacheryRoads.map((road) => predictRoad(road, effective))
  const distribution = emptyDistribution()
  let runoffM3Hr = 0
  let capacityM3Hr = 0
  let highCount = 0
  let severeCount = 0
  let maxDepthCm = 0
  predictions.forEach((p) => {
    distribution[p.risk]++
    runoffM3Hr += p.runoffM3Hr
    capacityM3Hr += p.drainCapacityM3Hr
    if (p.risk === 'high') highCount++
    if (p.risk === 'severe') severeCount++
    maxDepthCm = Math.max(maxDepthCm, p.waterDepthCm)
  })
  return {
    horizon,
    label: HORIZONS.find((h) => h.id === horizon)?.label ?? 'Now',
    multiplier: TIME_MULTIPLIERS[horizon],
    effectiveRainfallMmHr: effective,
    runoffM3Hr,
    capacityM3Hr,
    distribution,
    highCount,
    severeCount,
    maxDepthCm,
  }
}

/** Total network runoff/capacity at a raw intensity, for the load chart. */
export function networkLoadAt(intensityMmHr: number): { runoffM3Hr: number; capacityM3Hr: number } {
  let runoffM3Hr = 0
  let capacityM3Hr = 0
  velacheryRoads.forEach((road) => {
    const p = predictRoad(road, intensityMmHr)
    runoffM3Hr += p.runoffM3Hr
    capacityM3Hr += p.drainCapacityM3Hr
  })
  return { runoffM3Hr, capacityM3Hr }
}

export function predictNetwork(params: {
  rainfallIntensityMmHr: number
  horizon: TimeHorizon
}): NetworkPrediction {
  const { rainfallIntensityMmHr, horizon } = params
  const effectiveRainfallMmHr = rainfallIntensityMmHr * TIME_MULTIPLIERS[horizon]
  const horizonLabel = HORIZONS.find((h) => h.id === horizon)?.label ?? 'Now'

  const roads: PredictedRoad[] = velacheryRoads.map((road) => ({
    road,
    prediction: predictRoad(road, effectiveRainfallMmHr, horizonLabel),
  }))

  const byRoadId: Record<string, RoadPrediction> = {}
  const distribution = emptyDistribution()
  let runoffM3Hr = 0
  let capacityM3Hr = 0
  let lowLyingAtRisk = 0
  roads.forEach(({ road, prediction }) => {
    byRoadId[road.id] = prediction
    distribution[prediction.risk]++
    runoffM3Hr += prediction.runoffM3Hr
    capacityM3Hr += prediction.drainCapacityM3Hr
    if (
      RISK_RANK[prediction.risk] >= RISK_RANK.high &&
      (terrainByArea.get(road.areaName)?.terrainClass ?? 'Moderately Low') === 'Low-Lying'
    ) {
      lowLyingAtRisk++
    }
  })

  const total = roads.length
  const pct = (n: number) => Math.round((n / total) * 100)
  const distributionPct: RiskDistribution = {
    safe: pct(distribution.safe),
    low: pct(distribution.low),
    moderate: pct(distribution.moderate),
    high: pct(distribution.high),
    severe: pct(distribution.severe),
  }

  const atRisk = roads.filter((r) => RISK_RANK[r.prediction.risk] >= RISK_RANK.moderate)
  const atRiskLengthM = atRisk.reduce((sum, r) => sum + r.road.roadLengthM, 0)
  const affectedResidents = Math.round(wardInfo.residents * (atRiskLengthM / NETWORK_LENGTH_M))
  const avgDepthCm = atRisk.length
    ? atRisk.reduce((sum, r) => sum + r.prediction.waterDepthCm, 0) / atRisk.length
    : 0
  const maxDepthCm = roads.reduce((peak, r) => Math.max(peak, r.prediction.waterDepthCm), 0)

  return {
    rainfallIntensityMmHr,
    effectiveRainfallMmHr,
    rainfallCategory: rainfallCategory(rainfallIntensityMmHr),
    horizon,
    horizonLabel,
    roads,
    byRoadId,
    totals: {
      runoffM3Hr,
      capacityM3Hr,
      utilizationPct: (runoffM3Hr / capacityM3Hr) * 100,
    },
    distribution,
    distributionPct,
    noLowCount: distribution.safe + distribution.low,
    moderateCount: distribution.moderate,
    highCount: distribution.high,
    severeCount: distribution.severe,
    maxDepthCm,
    atRiskCount: atRisk.length,
    atRiskLengthM,
    affectedResidents,
    avgDepthCm,
    drainage: drainageSummary(),
    terrain: { ...terrainSummaryBase(), lowLyingAtRisk },
    horizonSeries: HORIZONS.map((h) => summarizeHorizon(rainfallIntensityMmHr, h.id)),
  }
}

export const worstRiskOf = (levels: RiskLevel[]): RiskLevel =>
  levels.reduce((worst, l) => (RISK_RANK[l] > RISK_RANK[worst] ? l : worst), 'safe' as RiskLevel)
