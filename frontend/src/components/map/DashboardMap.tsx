import { MapContainer, TileLayer } from 'react-leaflet'
import { useTheme } from '../../context/ThemeContext'
import { VELACHERY_CENTER } from '../../data/velacheryRoads'
import type { ComputedRoute, PredictedRoad } from '../../types'
import { DrainageLayer } from './DrainageLayer'
import { MapControls } from './MapControls'
import { MapEffects } from './MapEffects'
import { RoadLayer } from './RoadLayer'
import { SafeRouteLayer } from './SafeRouteLayer'
import { TerrainLayer } from './TerrainLayer'

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

interface DashboardMapProps {
  roads: PredictedRoad[]
  selectedRoadId: string | null
  onSelectRoad: (id: string) => void
  route: ComputedRoute | null
  showNetwork: boolean
  showZones: boolean
}

export function DashboardMap({
  roads,
  selectedRoadId,
  onSelectRoad,
  route,
  showNetwork,
  showZones,
}: DashboardMapProps) {
  const { theme } = useTheme()
  const selected = roads.find((r) => r.road.id === selectedRoadId) ?? null

  return (
    <MapContainer
      center={VELACHERY_CENTER}
      zoom={14.6}
      zoomSnap={0.25}
      zoomDelta={0.5}
      minZoom={12}
      maxZoom={18}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key={theme}
        url={
          theme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        }
        attribution={ATTRIBUTION}
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={20}
      />

      <MapEffects
        selectedRoadId={selectedRoadId}
        selectedRoadCoords={selected?.road.coordinates ?? null}
      />
      <TerrainLayer visible={showZones} />
      <DrainageLayer visible={showNetwork} />
      <RoadLayer roads={roads} selectedId={selectedRoadId} onSelect={onSelectRoad} />
      <SafeRouteLayer route={route} />
      <MapControls />
    </MapContainer>
  )
}
