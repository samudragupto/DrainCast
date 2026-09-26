import { CircleMarker, Polyline, Tooltip } from 'react-leaflet'
import { drainageNodeById, drainageNodes } from '../../data/drainageNodes'
import { drainagePipes } from '../../data/drainagePipes'
import { nodeOutflowCapacityM3Hr } from '../../utils/floodPredictionEngine'
import type { DrainageNodeType } from '../../types'

const NODE_COLORS: Record<DrainageNodeType, string> = {
  Manhole: '#22D3EE',
  'Stormwater Inlet': '#38BDF8',
  Junction: '#9AA3C0',
}

interface DrainageLayerProps {
  showNodes: boolean
  showPipes: boolean
}

export function DrainageLayer({ showNodes, showPipes }: DrainageLayerProps) {
  return (
    <>
      {showPipes &&
        drainagePipes.map((pipe) => {
          const from = drainageNodeById.get(pipe.from)
          const to = drainageNodeById.get(pipe.to)
          if (!from || !to) return null
          return (
            <Polyline
              key={pipe.id}
              positions={[from.position, to.position]}
              className="drain-pipe"
              pathOptions={{
                color: '#38BDF8',
                weight: 1.6,
                opacity: 0.35,
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
          )
        })}

      {showNodes &&
        drainageNodes.map((node) => (
          <CircleMarker
            key={node.id}
            center={node.position}
            radius={5}
            pathOptions={{
              color: '#0B1026',
              weight: 1.5,
              fillColor: NODE_COLORS[node.type],
              fillOpacity: 0.95,
              className: 'drain-node',
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
