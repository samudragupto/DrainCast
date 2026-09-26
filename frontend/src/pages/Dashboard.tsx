import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopBar } from '../components/layout/TopBar'
import { DashboardMap } from '../components/map/DashboardMap'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { RainfallControlPanel } from '../components/dashboard/RainfallControlPanel'
import { RiskOverviewPanel } from '../components/dashboard/RiskOverviewPanel'
import { RiskLegendPanel } from '../components/dashboard/RiskLegendPanel'
import { DrainageInsightPanel } from '../components/dashboard/DrainageInsightPanel'
import { TerrainInsightPanel } from '../components/dashboard/TerrainInsightPanel'
import { DrainageGraphViewPanel } from '../components/dashboard/DrainageGraphViewPanel'
import { RainfallChartPanel } from '../components/dashboard/RainfallChartPanel'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { RiskDistributionPanel } from '../components/dashboard/RiskDistributionPanel'
import { RouteFinderPanel } from '../components/dashboard/RouteFinderPanel'
import { RoadIntelligencePanel } from '../components/dashboard/RoadIntelligencePanel'
import { routeLocations } from '../data/routeLocations'
import { computeRoute } from '../utils/routeFinder'
import { DEFAULT_RAINFALL, predictNetwork } from '../utils/floodPredictionEngine'
import type { TimeHorizon } from '../types'

interface RouteQuery {
  startId: string
  destinationId: string
}

const HORIZON_CYCLE: TimeHorizon[] = ['now', '1h', '2h', '3h']
const AUTOPLAY_INTERVAL_MS = 2400

export default function Dashboard() {
  const [rainfall, setRainfall] = useState(DEFAULT_RAINFALL)
  const [horizon, setHorizon] = useState<TimeHorizon>('now')
  const [playing, setPlaying] = useState(false)
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null)
  const [showNetwork, setShowNetwork] = useState(true)
  const [showZones, setShowZones] = useState(false)
  const [graphViewOpen, setGraphViewOpen] = useState(false)
  const [routeQuery, setRouteQuery] = useState<RouteQuery | null>(null)

  const prediction = useMemo(
    () => predictNetwork({ rainfallIntensityMmHr: rainfall, horizon }),
    [rainfall, horizon],
  )

  const riskByRoad = useMemo(
    () => new Map(prediction.roads.map((r) => [r.road.id, r.prediction.risk])),
    [prediction],
  )

  const route = useMemo(() => {
    if (!routeQuery) return null
    const start = routeLocations.find((l) => l.id === routeQuery.startId)
    const destination = routeLocations.find((l) => l.id === routeQuery.destinationId)
    if (!start || !destination || start.id === destination.id) return null
    return computeRoute({ start, destination }, riskByRoad)
  }, [routeQuery, riskByRoad])

  // Auto-play: cycle the 0–3 hour nowcast timeline.
  const playRef = useRef(playing)
  playRef.current = playing
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setHorizon((h) => HORIZON_CYCLE[(HORIZON_CYCLE.indexOf(h) + 1) % HORIZON_CYCLE.length])
    }, AUTOPLAY_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [playing])

  const selectHorizon = useCallback((h: TimeHorizon) => {
    setPlaying(false)
    setHorizon(h)
  }, [])

  const handleSelectRoad = useCallback((id: string) => {
    setSelectedRoadId((current) => (current === id ? null : id))
  }, [])

  const selectedRoad = prediction.roads.find((r) => r.road.id === selectedRoadId) ?? null

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopBar />

      <main className="relative flex flex-1 flex-col xl:h-[calc(100vh-3.5rem)] xl:overflow-hidden">
        {/* Map layer — the heart of the application */}
        <div className="relative h-[52vh] shrink-0 xl:absolute xl:inset-0">
          <ErrorBoundary label="The live map">
            <DashboardMap
              roads={prediction.roads}
              selectedRoadId={selectedRoadId}
              onSelectRoad={handleSelectRoad}
              route={route}
              showNetwork={showNetwork}
              showZones={showZones}
            />
          </ErrorBoundary>
        </div>

        {/* Floating panel system */}
        <div className="relative z-[600] flex flex-col gap-2 p-2 sm:p-3 xl:absolute xl:inset-0 xl:p-3">
          {/* Left — nowcast control */}
          <div className="flex flex-col gap-2 xl:pointer-events-none xl:absolute xl:left-3 xl:top-3 xl:w-[300px]">
            <RainfallControlPanel
              rainfall={rainfall}
              onRainfallChange={(v) => {
                setPlaying(false)
                setRainfall(v)
              }}
              horizon={horizon}
              onHorizonChange={selectHorizon}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
              effectiveRainfall={prediction.effectiveRainfallMmHr}
              delay={0.05}
            />
          </div>

          {/* Right — overview, legend, drainage, terrain */}
          <div className="order-none flex flex-col gap-2 xl:pointer-events-none xl:absolute xl:right-3 xl:top-3 xl:max-h-[calc(100%-1.5rem)] xl:w-[300px] xl:overflow-y-auto xl:pr-0.5">
            <RiskOverviewPanel prediction={prediction} delay={0.1} />
            <RiskLegendPanel prediction={prediction} delay={0.16} />
            <DrainageInsightPanel
              summary={prediction.drainage}
              showNetwork={showNetwork}
              onToggleNetwork={setShowNetwork}
              onOpenGraphView={() => setGraphViewOpen(true)}
              delay={0.22}
            />
            <TerrainInsightPanel
              prediction={prediction}
              showZones={showZones}
              onToggleZones={setShowZones}
              delay={0.28}
            />
          </div>

          {/* Bottom row — chart + route finder (left), alerts (centre), distribution (right) */}
          <div className="flex flex-col gap-2 xl:pointer-events-none xl:absolute xl:bottom-3 xl:left-3 xl:right-3 xl:flex-row xl:items-end">
            <div className="flex w-full flex-col gap-2 xl:w-[340px]">
              <RouteFinderPanel
                route={route}
                onFind={(query) => setRouteQuery(query)}
                onClear={() => setRouteQuery(null)}
              />
              <RainfallChartPanel rainfall={rainfall} horizon={horizon} delay={0.34} />
            </div>

            <div className="min-w-0 flex-1 xl:mx-auto xl:max-w-[520px]">
              <AlertsPanel
                prediction={prediction}
                onSelect={(id) => {
                  setSelectedRoadId(id)
                }}
                delay={0.4}
              />
            </div>

            <div className="xl:w-[300px]">
              <RiskDistributionPanel prediction={prediction} delay={0.46} />
            </div>
          </div>

          {/* Selected road intelligence — slides over the right column */}
          <div className="order-first flex justify-end xl:order-none xl:absolute xl:right-3 xl:top-3 xl:z-[700] xl:h-[calc(100%-1.5rem)] xl:w-[330px]">
            <RoadIntelligencePanel
              selected={selectedRoad}
              rainfall={rainfall}
              horizon={horizon}
              onClose={() => setSelectedRoadId(null)}
            />
          </div>
        </div>
      </main>

      {/* Drainage network graph view — floating modal */}
      <DrainageGraphViewPanel
        open={graphViewOpen}
        onClose={() => setGraphViewOpen(false)}
        visualize={showNetwork}
        onToggleVisualize={setShowNetwork}
      />
    </div>
  )
}
