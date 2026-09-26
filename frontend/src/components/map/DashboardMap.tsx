import { useRef, useState } from 'react'
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

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// All basemaps used here are free and require no API key. CARTO's raster
// basemaps match the app's dark/light aesthetic; if CARTO is unreachable or
// rate-limits us, the layer silently falls back to the standard (light)
// OpenStreetMap tiles so the map never goes blank.
const OSM_FALLBACK_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ERROR_THRESHOLD = 4

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
  const [cartoFailed, setCartoFailed] = useState(false)
  const tileErrorsRef = useRef(0)
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
        key={`${theme}-${cartoFailed ? 'osm' : 'carto'}`}
        url={
          cartoFailed
            ? OSM_FALLBACK_URL
            : theme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        }
        attribution={cartoFailed ? OSM_ATTRIBUTION : CARTO_ATTRIBUTION}
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={20}
        eventHandlers={
          cartoFailed
            ? undefined
            : {
                // A burst of failed tiles => CARTO is unavailable; switch to
                // the keyless OpenStreetMap raster tiles.
                tileerror: () => {
                  tileErrorsRef.current += 1
                  if (tileErrorsRef.current >= TILE_ERROR_THRESHOLD) {
                    setCartoFailed(true)
                  }
                },
              }
        }
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
