import L from 'leaflet'
import { CircleMarker, Marker, Polyline, Tooltip } from 'react-leaflet'
import { drainageNodeById, drainageNodes } from '../../data/drainageNodes'
import { drainagePipes } from '../../data/drainagePipes'
import { nodeOutflowCapacityM3Hr } from '../../utils/floodPredictionEngine'
import { bearingDeg, lerpCoord } from '../../utils/geo'
import type { Coord, DrainageNodeType } from '../../types'

const NODE_COLORS: Record<DrainageNodeType, string> = {
  Manhole: '#22D3EE',
  'Stormwater Inlet': '#38BDF8',
  Junction: '#B6BEDC',
}

const NODE_RADIUS: Record<DrainageNodeType, number> = {
  Manhole: 5,
  'Stormwater Inlet': 4,
  Junction: 6,
}

function arrowIcon(bearing: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="transform: rotate(${bearing}deg); color:#38BDF8; opacity:.75; line-height:1; font-size:11px; font-family:ui-monospace,monospace;">➤</div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

/** Underground stormwater network: directed pipes + junction markers. */
export function DrainageLayer({ visible }: { visible: boolean }) {
  if (!visible) return null

  const arrows: { key: string; at: Coord; bearing: number }[] = []
  const pipes = drainagePipes.map((pipe) => {
    const from = drainageNodeById.get(pipe.from)
    const to = drainageNodeById.get(pipe.to)
    if (from && to) {
      arrows.push({
        key: `${pipe.id}-arrow`,
        at: lerpCoord(from.position, to.position, 0.58),
        bearing: bearingDeg(from.position, to.position),
      })
    }
    return { pipe, from, to }
  })

  return (
    <>
      {pipes.map(({ pipe, from, to }) =>
        from && to ? (
          <Polyline
            key={pipe.id}
            positions={[from.position, to.position]}
            className="drain-pipe"
            pathOptions={{
              color: '#38BDF8',
              weight: 1.6,
              opacity: 0.4,
              dashArray: '3 7',
            }}
          >
            <Tooltip>
              <div className="text-[11px] font-semibold text-ink">
                {pipe.id} · stormwater pipe
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-ink-2">
                {from.nodeName} → {to.nodeName}
              </div>
              <div className="font-mono text-[10px] text-ink-2">
                rated {pipe.capacityM3Hr} m³/hr
              </div>
            </Tooltip>
          </Polyline>
        ) : null,
      )}

      {arrows.map((a) => (
        <Marker key={a.key} position={a.at} icon={arrowIcon(a.bearing)} interactive={false} />
      ))}

      {drainageNodes.map((node) => (
        <CircleMarker
          key={node.id}
          center={node.position}
          radius={NODE_RADIUS[node.type]}
          className="drain-node"
          pathOptions={{
            color: '#070B16',
            weight: 1.5,
            fillColor: NODE_COLORS[node.type],
            fillOpacity: 0.95,
          }}
        >
          <Tooltip>
            <div className="text-[11px] font-semibold text-ink">
              {node.nodeName} · {node.type}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-2">
              invert {node.elevationM.toFixed(1)} m
            </div>
            <div className="font-mono text-[10px] text-ink-2">
              outflow {nodeOutflowCapacityM3Hr(node.id)} m³/hr
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  )
}
