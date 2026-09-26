import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { velacheryRoads } from '../../data/velacheryRoads'
import type { Coord } from '../../types'

const NETWORK_BOUNDS = L.latLngBounds(
  velacheryRoads.flatMap((r) => r.coordinates.map(([lat, lng]) => L.latLng(lat, lng))),
)

interface MapEffectsProps {
  selectedRoadId: string | null
  selectedRoadCoords: Coord[] | null
}

export function MapEffects({ selectedRoadId, selectedRoadCoords }: MapEffectsProps) {
  const map = useMap()

  useEffect(() => {
    const wide = map.getSize().x >= 1280
    const pad: L.PointExpression = wide ? [348, 84] : [28, 28]
    map.fitBounds(NETWORK_BOUNDS, {
      paddingTopLeft: pad,
      paddingBottomRight: pad,
      animate: false,
      maxZoom: 16.25,
    })
  }, [map])

  useEffect(() => {
    if (!selectedRoadCoords) return
    map.flyToBounds(L.latLngBounds(selectedRoadCoords.map(([lat, lng]) => L.latLng(lat, lng))), {
      paddingTopLeft: [80, 70],
      paddingBottomRight: [80, 320],
      duration: 0.9,
      maxZoom: 16.5,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoadId])

  return null
}
