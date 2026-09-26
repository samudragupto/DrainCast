import { Circle, Tooltip } from 'react-leaflet'
import { terrainData } from '../../data/terrainData'
import type { TerrainClass } from '../../types'

const ZONE_STYLES: Record<TerrainClass, { stroke: string; fill: string }> = {
  'Low-Lying': { stroke: 'rgba(220, 38, 38, 0.32)', fill: 'rgba(220, 38, 38, 0.06)' },
  'Moderately Low': { stroke: 'rgba(245, 158, 11, 0.25)', fill: 'rgba(245, 158, 11, 0.045)' },
  'Slightly Elevated': { stroke: 'rgba(34, 197, 94, 0.22)', fill: 'rgba(34, 197, 94, 0.035)' },
}

export function TerrainLayer({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <>
      {terrainData.map((zone) => {
        const style = ZONE_STYLES[zone.terrainClass]
        return (
          <Circle
            key={zone.areaName}
            center={zone.center}
            radius={zone.radiusM}
            className="terrain-zone"
            pathOptions={{
              color: style.stroke,
              weight: 1,
              dashArray: '4 8',
              fillColor: style.fill,
              fillOpacity: 1,
            }}
          >
            <Tooltip>
              <div className="text-[11px] font-semibold text-ink">{zone.areaName}</div>
              <div className="mt-0.5 font-mono text-[10px] text-ink-2">
                {zone.terrainClass} · {zone.avgElevationM.toFixed(1)} m ·{' '}
                {zone.avgSlopeDeg.toFixed(1)}° slope
              </div>
            </Tooltip>
          </Circle>
        )
      })}
    </>
  )
}
