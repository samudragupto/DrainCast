import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import { VELACHERY_CENTER } from '../../data/velacheryRoads'
import type { ComputedRoute, PredictedRoad } from '../../types'
import { DrainageLayer } from './DrainageLayer'
import { MapEffects } from './MapEffects'
import { RoadLayer } from './RoadLayer'
import { SafeRouteLayer } from './SafeRouteLayer'
import { TerrainLayer } from './TerrainLayer'

interface DashboardMapProps {
  roads: PredictedRoad[]
  selectedRoadId: string | null
  onSelectRoad: (id: string) => void
  route: ComputedRoute | null
  showNodes: boolean
  showPipes: boolean
  showZones: boolean
}

export function DashboardMap({
  roads,
  selectedRoadId,
  onSelectRoad,
  route,
  showNodes,
  showPipes,
  showZones,
}: DashboardMapProps) {
  const selected = roads.find((r) => r.road.id === selectedRoadId) ?? null

  return (
    <MapContainer
      center={VELACHERY_CENTER}
      zoom={14.5}
      zoomSnap={0.25}
      zoomDelta={0.5}
      minZoom={12}
      maxZoom={18}
      zoomControl={false}
      className="h-full w-full"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={20}
      />

      <MapEffects
        selectedRoadId={selectedRoadId}
        selectedRoadCoords={selected?.road.coordinates ?? null}
      />
      <TerrainLayer visible={showZones} />
      <DrainageLayer showNodes={showNodes} showPipes={showPipes} />
      <RoadLayer roads={roads} selectedId={selectedRoadId} onSelect={onSelectRoad} />
      <SafeRouteLayer route={route} />
    </MapContainer>
  )
}
