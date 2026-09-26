import { drainageNodeById, drainageNodes } from '../data/drainageNodes'
import { drainagePipes } from '../data/drainagePipes'
import { terrainByArea } from '../data/terrainData'
import { NETWORK_LENGTH_M, velacheryRoads } from '../data/velacheryRoads'
import { wardInfo } from '../data/wardInfo'
import type {
  HorizonSummary,
  NetworkPrediction,
  PredictedRoad,
  RiskDistribution,
  RiskLevel,
  RoadPrediction,
  RoadSegment,
  RoadType,
  TerrainClass,
  TimeHorizon,
} from '../types'
import { fmtInt } from './format'

/* ------------------------------------------------------------------ */
/* Model constants (explainable, presentation-friendly)                */
/* ------------------------------------------------------------------ */

export const IMPERVIOUSNESS = 0.85
export const INLET_SPACING_M = 140
export const NETWORK_EFFICIENCY = 0.92
export const LOCAL_POOL_FRACTION = 0.35
export const OUTFALL_CAPACITY_M3H = 90

export const HORIZONS: { id: TimeHorizon; label: string; multiplier: number }[] = [
  { id: 'now', label: 'Now', multiplier: 1.0 },
  { id: '1h', label: '+1h', multiplier: 1.15 },
  { id: '2h', label: '+2h', multiplier: 1.3 },
  { id: '3h', label: '+3h', multiplier: 1.45 },
]

export const TIME_MULTIPLIERS: Record<TimeHorizon, number> = {
  now: 1.0,
  '1h': 1.15,
  '2h': 1.3,
  '3h': 1.45,
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#22C55E',
  low: '#A3E635',
  moderate: '#F59E0B',
  high: '#F97316',
  severe: '#DC2626',
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  safe: 'No / Minimal Risk',
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
  safe: '< 0.5 cm',
  low: '0.5 – 2.5 cm',
  moderate: '2.5 – 5.5 cm',
  high: '5.5 – 10 cm',
  severe: '≥ 10 cm',
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

const RISK_RANK: Record<RiskLevel, number> = {
  safe: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
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

/* ------------------------------------------------------------------ */
/* Prediction engine                                                   */
/* ------------------------------------------------------------------ */

function classifyRisk(depthCm: number): RiskLevel {
  if (depthCm < 0.5) return 'safe'
  if (depthCm < 2.5) return 'low'
  if (depthCm < 5.5) return 'moderate'
  if (depthCm < 10) return 'high'
  return 'severe'
}

function buildReason(
  risk: RiskLevel,
  road: RoadSegment,
  p: {
    runoffM3Hr: number
    drainCapacityM3Hr: number
    utilizationPct: number
    excessM3Hr: number
    waterDepthCm: number
    terrainClass: TerrainClass
  },
): string {
  const nodeName = nodeById(road.connectedDrainNodeId).nodeName
  const depth = `${p.waterDepthCm.toFixed(1)} cm`
  switch (risk) {
    case 'safe':
      return `Drain keeping pace — ${fmtInt(p.runoffM3Hr)} m³/hr runoff against ${fmtInt(
        p.drainCapacityM3Hr,
      )} m³/hr rated capacity at ${nodeName}.`
    case 'low':
      return `Marginal overload at ${nodeName} (${fmtInt(p.runoffM3Hr)} vs ${fmtInt(
        p.drainCapacityM3Hr,
      )} m³/hr) — shallow ponding of ~${depth} along the ${road.areaName} stretch.`
    case 'moderate':
      return `${nodeName} surcharging — ${fmtInt(p.excessM3Hr)} m³/hr of excess ponds to ~${depth} across the ${road.areaName} corridor.`
    case 'high':
      return `Capacity breached by ${fmtInt(p.excessM3Hr)} m³/hr at ${nodeName}; ${p.terrainClass.toLowerCase()} terrain retains runoff — expect ~${depth} of curb-side accumulation.`
    case 'severe':
      return `Trunk ${nodeName} overwhelmed at ${Math.round(
        p.utilizationPct,
      )}% load on ${p.terrainClass.toLowerCase()} terrain — waterlogging of ~${depth}; corridor likely impassable.`
  }
}

export function predictRoad(road: RoadSegment, rainfallMmHr: number): RoadPrediction {
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

  const partial = {
    runoffM3Hr,
    drainCapacityM3Hr,
    utilizationPct,
    excessM3Hr,
    waterDepthCm,
    terrainClass,
  }

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
    terrainFactor,
    reason: buildReason(risk, road, partial),
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

export function predictNetwork(params: {
  rainfallIntensityMmHr: number
  horizon: TimeHorizon
}): NetworkPrediction {
  const { rainfallIntensityMmHr, horizon } = params
  const effectiveRainfallMmHr = rainfallIntensityMmHr * TIME_MULTIPLIERS[horizon]

  const roads: PredictedRoad[] = velacheryRoads.map((road) => ({
    road,
    prediction: predictRoad(road, effectiveRainfallMmHr),
  }))

  const byRoadId: Record<string, RoadPrediction> = {}
  const distribution = emptyDistribution()
  let runoffM3Hr = 0
  let capacityM3Hr = 0
  roads.forEach(({ road, prediction }) => {
    byRoadId[road.id] = prediction
    distribution[prediction.risk]++
    runoffM3Hr += prediction.runoffM3Hr
    capacityM3Hr += prediction.drainCapacityM3Hr
  })

  const atRisk = roads.filter((r) => RISK_RANK[r.prediction.risk] >= RISK_RANK.moderate)
  const atRiskLengthM = atRisk.reduce((sum, r) => sum + r.road.roadLengthM, 0)
  const affectedResidents = Math.round(wardInfo.residents * (atRiskLengthM / NETWORK_LENGTH_M))
  const avgDepthCm = atRisk.length
    ? atRisk.reduce((sum, r) => sum + r.prediction.waterDepthCm, 0) / atRisk.length
    : 0
  const peakDepthCm = roads.reduce((peak, r) => Math.max(peak, r.prediction.waterDepthCm), 0)

  return {
    rainfallIntensityMmHr,
    effectiveRainfallMmHr,
    horizon,
    roads,
    byRoadId,
    totals: {
      runoffM3Hr,
      capacityM3Hr,
      utilizationPct: (runoffM3Hr / capacityM3Hr) * 100,
    },
    distribution,
    atRiskCount: atRisk.length,
    atRiskLengthM,
    affectedResidents,
    avgDepthCm,
    peakDepthCm,
    horizonSeries: HORIZONS.map((h) => summarizeHorizon(rainfallIntensityMmHr, h.id)),
  }
}

/** Base intensity at which aggregate network demand crosses rated capacity. */
export function networkBreakEvenMmHr(): number {
  let runoffPerMm = 0
  let capacity = 0
  velacheryRoads.forEach((road) => {
    runoffPerMm += (road.roadLengthM * CARRIAGE_WIDTH_M[road.roadType] * IMPERVIOUSNESS) / 1000
    const inlets = Math.max(1, Math.round(road.roadLengthM / INLET_SPACING_M))
    capacity += nodeOutflowCapacityM3Hr(road.connectedDrainNodeId) * inlets * NETWORK_EFFICIENCY
  })
  return capacity / runoffPerMm
}

export function describeRainfall(mmHr: number): { label: string; color: string } {
  if (mmHr < 10) return { label: 'Light Rain', color: RISK_COLORS.safe }
  if (mmHr < 25) return { label: 'Moderate Rain', color: RISK_COLORS.low }
  if (mmHr < 50) return { label: 'Heavy Rain', color: RISK_COLORS.moderate }
  if (mmHr < 65) return { label: 'Intense Downpour', color: RISK_COLORS.high }
  return { label: 'Extreme Cloudburst', color: RISK_COLORS.severe }
}

export const worstRiskOf = (levels: RiskLevel[]): RiskLevel =>
  levels.reduce((worst, l) => (RISK_RANK[l] > RISK_RANK[worst] ? l : worst), 'safe' as RiskLevel)
