import { useMemo, useState } from 'react'
import { DashboardMap } from '../components/map/DashboardMap'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { RainfallControlPanel, type LayerToggles } from '../components/dashboard/RainfallControlPanel'
import { RiskStatsPanel } from '../components/dashboard/RiskStatsPanel'
import { RiskLegendPanel } from '../components/dashboard/RiskLegendPanel'
import { RainfallChartPanel } from '../components/dashboard/RainfallChartPanel'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { NowcastTimeline } from '../components/dashboard/NowcastTimeline'
import { RouteFinderPanel } from '../components/dashboard/RouteFinderPanel'
import { RoadDetailsPanel } from '../components/dashboard/RoadDetailsPanel'
import { routeLocations } from '../data/routeLocations'
import { computeRoute } from '../utils/routeFinder'
import { predictNetwork } from '../utils/floodPredictionEngine'
import type { TimeHorizon } from '../types'

interface RouteQuery {
  startId: string
  destinationId: string
}

export default function Dashboard() {
  const [rainfall, setRainfall] = useState(50)
  const [horizon, setHorizon] = useState<TimeHorizon>('now')
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null)
  const [layers, setLayers] = useState<LayerToggles>({ nodes: true, pipes: false, zones: true })
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

  const selectedRoad = prediction.roads.find((r) => r.road.id === selectedRoadId) ?? null

  const handleSelectRoad = (id: string) =>
    setSelectedRoadId((current) => (current === id ? null : id))

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col xl:h-[calc(100vh-4rem)] xl:overflow-hidden">
      {/* Map layer */}
      <div className="relative h-[56vh] shrink-0 xl:absolute xl:inset-0">
        <ErrorBoundary label="The live map">
          <DashboardMap
            roads={prediction.roads}
            selectedRoadId={selectedRoadId}
            onSelectRoad={handleSelectRoad}
            route={route}
            showNodes={layers.nodes}
            showPipes={layers.pipes}
            showZones={layers.zones}
          />
        </ErrorBoundary>
      </div>

      {/* Floating panels — stacked below the map on small screens */}
      <div className="z-[600] flex flex-col gap-3 p-4 xl:p-0">
        {/* Left column */}
        <div className="flex flex-col gap-3 xl:pointer-events-none xl:absolute xl:left-4 xl:top-4 xl:max-h-[calc(100%-2rem)] xl:w-[322px] xl:overflow-y-auto">
          <RainfallControlPanel
            rainfall={rainfall}
            onRainfallChange={setRainfall}
            horizon={horizon}
            onHorizonChange={setHorizon}
            layers={layers}
            onLayersChange={setLayers}
            effectiveRainfall={prediction.effectiveRainfallMmHr}
            delay={0.05}
          />
          <RainfallChartPanel series={prediction.horizonSeries} horizon={horizon} delay={0.3} />
        </div>

        {/* Right column */}
        <div className="order-none flex flex-col gap-3 xl:pointer-events-none xl:absolute xl:right-4 xl:top-4 xl:max-h-[calc(100%-2rem)] xl:w-[320px] xl:overflow-y-auto">
          <RiskStatsPanel prediction={prediction} delay={0.12} />
          <RiskLegendPanel delay={0.24} />
          <AlertsPanel prediction={prediction} onSelect={setSelectedRoadId} delay={0.36} />
        </div>

        {/* Route finder — top centre overlay */}
        <div className="xl:absolute xl:left-1/2 xl:top-4 xl:w-[460px] xl:max-w-[calc(100%-700px)] xl:-translate-x-1/2">
          <RouteFinderPanel
            route={route}
            onFind={(query) => setRouteQuery(query)}
            onClear={() => setRouteQuery(null)}
          />
        </div>

        {/* Selected road details — slides in above the timeline */}
        <div className="xl:absolute xl:bottom-[7.75rem] xl:left-1/2 xl:w-[400px] xl:max-w-[calc(100%-720px)] xl:-translate-x-1/2">
          <RoadDetailsPanel
            selected={selectedRoad}
            rainfall={rainfall}
            horizon={horizon}
            onClose={() => setSelectedRoadId(null)}
          />
        </div>

        {/* Nowcast timeline — bottom centre */}
        <div className="xl:absolute xl:bottom-4 xl:left-1/2 xl:w-[380px] xl:max-w-[calc(100%-700px)] xl:-translate-x-1/2">
          <NowcastTimeline
            series={prediction.horizonSeries}
            horizon={horizon}
            onChange={setHorizon}
          />
        </div>
      </div>
    </div>
  )
}
