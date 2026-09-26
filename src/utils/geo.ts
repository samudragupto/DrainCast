import type { Coord } from '../types'

const EARTH_RADIUS_M = 6371000
const toRad = (deg: number) => (deg * Math.PI) / 180

export function haversineM(a: Coord, b: Coord): number {
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s))
}

export function polylineLengthM(coords: Coord[]): number {
  let length = 0
  for (let i = 1; i < coords.length; i++) length += haversineM(coords[i - 1], coords[i])
  return length
}

export function boundsOf(coords: Coord[]): { minLat: number; minLng: number; maxLat: number; maxLng: number } {
  let minLat = 90
  let minLng = 180
  let maxLat = -90
  let maxLng = -180
  coords.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat)
    minLng = Math.min(minLng, lng)
    maxLat = Math.max(maxLat, lat)
    maxLng = Math.max(maxLng, lng)
  })
  return { minLat, minLng, maxLat, maxLng }
}
