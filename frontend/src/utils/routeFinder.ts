import { velacheryRoads } from '../data/velacheryRoads'
import type {
  ComputedRoute,
  Coord,
  RiskLevel,
  RouteExposure,
  RouteLocation,
} from '../types'
import { haversineM } from './geo'

/**
 * Flood-aware routing over the demo road graph.
 * Dijkstra is run twice — once with risk-weighted edge costs (flood-aware)
 * and once with pure distance (conventional shortest) — so the UI can show
 * exactly what the risk weighting avoided.
 */

export const RISK_ROUTE_WEIGHT: Record<RiskLevel, number> = {
  safe: 1,
  low: 1.2,
  moderate: 2,
  high: 3.5,
  severe: 8,
}

const CLUSTER_TOLERANCE_M = 70
const AVG_SPEED_M_PER_MIN = 400 // ~24 km/h mixed urban traffic

interface GraphEdge {
  to: string
  roadId: string
  coords: Coord[]
  lengthM: number
}

interface Graph {
  junctions: Map<string, Coord>
  adjacency: Map<string, GraphEdge[]>
}

let graphCache: Graph | null = null

function buildGraph(): Graph {
  const junctions = new Map<string, Coord>()
  const vertexJunction = new Map<string, string>()

  const nearestJunction = (c: Coord): string | null => {
    let best: string | null = null
    let bestDist = CLUSTER_TOLERANCE_M
    for (const [id, jc] of junctions) {
      const d = haversineM(c, jc)
      if (d < bestDist) {
        bestDist = d
        best = id
      }
    }
    return best
  }

  const attach = (roadId: string, idx: number, c: Coord, force: boolean) => {
    const key = `${roadId}:${idx}`
    const existing = nearestJunction(c)
    if (existing) {
      vertexJunction.set(key, existing)
      return
    }
    if (!force) return
    const id = `J${String(junctions.size).padStart(2, '0')}`
    junctions.set(id, c)
    vertexJunction.set(key, id)
  }

  velacheryRoads.forEach((r) => {
    attach(r.id, 0, r.coordinates[0], true)
    attach(r.id, r.coordinates.length - 1, r.coordinates[r.coordinates.length - 1], true)
  })
  velacheryRoads.forEach((r) => {
    r.coordinates.forEach((c, i) => {
      if (i !== 0 && i !== r.coordinates.length - 1) attach(r.id, i, c, false)
    })
  })

  const adjacency = new Map<string, GraphEdge[]>()
  const push = (from: string, edge: GraphEdge) => {
    const arr = adjacency.get(from) ?? []
    arr.push(edge)
    adjacency.set(from, arr)
  }

  velacheryRoads.forEach((r) => {
    const cuts: { idx: number; junction: string }[] = []
    r.coordinates.forEach((_, i) => {
      const j = vertexJunction.get(`${r.id}:${i}`)
      if (j) cuts.push({ idx: i, junction: j })
    })
    for (let s = 0; s < cuts.length - 1; s++) {
      const a = cuts[s]
      const b = cuts[s + 1]
      const coords = r.coordinates.slice(a.idx, b.idx + 1)
      let lengthM = 0
      for (let i = 1; i < coords.length; i++) lengthM += haversineM(coords[i - 1], coords[i])
      if (lengthM < 1) continue
      push(a.junction, { to: b.junction, roadId: r.id, coords, lengthM })
      push(b.junction, {
        to: a.junction,
        roadId: r.id,
        coords: [...coords].reverse(),
        lengthM,
      })
    }
  })

  return { junctions, adjacency }
}

function getGraph(): Graph {
  if (!graphCache) graphCache = buildGraph()
  return graphCache
}

function snapToJunction(graph: Graph, c: Coord): { id: string; coord: Coord } | null {
  let best: { id: string; coord: Coord } | null = null
  let bestDist = Infinity
  for (const [id, jc] of graph.junctions) {
    const d = haversineM(c, jc)
    if (d < bestDist) {
      bestDist = d
      best = { id, coord: jc }
    }
  }
  return best
}

interface PathResult {
  edges: GraphEdge[]
}

function dijkstra(
  graph: Graph,
  start: string,
  end: string,
  cost: (e: GraphEdge) => number,
): PathResult | null {
  const dist = new Map<string, number>()
  const prev = new Map<string, { node: string; edge: GraphEdge }>()
  const done = new Set<string>()
  dist.set(start, 0)

  for (;;) {
    let cur: string | null = null
    let curDist = Infinity
    for (const [id, d] of dist) {
      if (!done.has(id) && d < curDist) {
        curDist = d
        cur = id
      }
    }
    if (cur === null || cur === end) break
    done.add(cur)
    for (const e of graph.adjacency.get(cur) ?? []) {
      const nd = curDist + cost(e)
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd)
        prev.set(e.to, { node: cur, edge: e })
      }
    }
  }

  if (!dist.has(end)) return null

  const edges: GraphEdge[] = []
  let node = end
  while (node !== start) {
    const p = prev.get(node)
    if (!p) return null
    edges.unshift(p.edge)
    node = p.node
  }
  return { edges }
}

const rank: Record<RiskLevel, number> = { safe: 0, low: 1, moderate: 2, high: 3, severe: 4 }

function assemble(
  start: RouteLocation,
  destination: RouteLocation,
  startJunction: Coord,
  endJunction: Coord,
  path: PathResult,
  riskByRoad: Map<string, RiskLevel>,
): { coords: Coord[]; exposure: RouteExposure } {
  const coords: Coord[] = [start.position]
  let distanceM = haversineM(start.position, startJunction)

  const roadIds: string[] = []
  path.edges.forEach((e) => {
    e.coords.slice(1).forEach((c) => coords.push(c))
    distanceM += e.lengthM
    roadIds.push(e.roadId)
  })

  coords.push(destination.position)
  distanceM += haversineM(endJunction, destination.position)

  const uniqueRoads = [...new Set(roadIds)]
  let highCount = 0
  let severeCount = 0
  let maxRisk: RiskLevel = 'safe'
  uniqueRoads.forEach((id) => {
    const r = riskByRoad.get(id) ?? 'safe'
    if (r === 'high') highCount++
    if (r === 'severe') severeCount++
    if (rank[r] > rank[maxRisk]) maxRisk = r
  })

  const roadNames = uniqueRoads.map(
    (id) => velacheryRoads.find((r) => r.id === id)?.roadName ?? id,
  )

  const durationMin = distanceM / AVG_SPEED_M_PER_MIN + highCount * 1.5 + severeCount * 3

  return {
    coords,
    exposure: { distanceM, durationMin, highCount, severeCount, maxRisk, roadNames },
  }
}

function infeasible(
  query: { start: RouteLocation; destination: RouteLocation },
  message: string,
): ComputedRoute {
  return {
    feasible: false,
    message,
    start: query.start,
    destination: query.destination,
    coords: [],
    distanceM: 0,
    durationMin: 0,
    viaRoadNames: [],
    exposure: {
      distanceM: 0,
      durationMin: 0,
      highCount: 0,
      severeCount: 0,
      maxRisk: 'safe',
      roadNames: [],
    },
    conventional: null,
    sameAsConventional: true,
  }
}

const shortenRoadName = (name: string) => name.replace(/\s\([^)]*\)$/, '')

export function computeRoute(
  query: { start: RouteLocation; destination: RouteLocation },
  riskByRoad: Map<string, RiskLevel>,
): ComputedRoute {
  const graph = getGraph()
  const s = snapToJunction(graph, query.start.position)
  const e = snapToJunction(graph, query.destination.position)

  if (!s || !e) return infeasible(query, 'No network junction near the selected point.')
  if (s.id === e.id)
    return infeasible(
      query,
      'Start and destination snap to the same junction — pick points further apart.',
    )

  const aware = dijkstra(graph, s.id, e.id, (edge) => {
    const risk = riskByRoad.get(edge.roadId) ?? 'safe'
    return edge.lengthM * RISK_ROUTE_WEIGHT[risk]
  })
  const conv = dijkstra(graph, s.id, e.id, (edge) => edge.lengthM)

  if (!aware || !conv)
    return infeasible(query, 'No connected path between these points on the demo network.')

  const awareRes = assemble(query.start, query.destination, s.coord, e.coord, aware, riskByRoad)
  const convRes = assemble(query.start, query.destination, s.coord, e.coord, conv, riskByRoad)

  const sameAsConventional =
    awareRes.exposure.roadNames.join('|') === convRes.exposure.roadNames.join('|')

  return {
    feasible: true,
    start: query.start,
    destination: query.destination,
    coords: awareRes.coords,
    distanceM: awareRes.exposure.distanceM,
    durationMin: awareRes.exposure.durationMin,
    viaRoadNames: awareRes.exposure.roadNames.map(shortenRoadName).slice(0, 3),
    exposure: awareRes.exposure,
    conventional: { ...convRes.exposure, coords: convRes.coords },
    sameAsConventional,
  }
}
