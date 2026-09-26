import { useState } from 'react'
import { Polyline, Tooltip } from 'react-leaflet'
import type { PredictedRoad, RoadType } from '../../types'
import { RISK_COLORS, RISK_SHORT } from '../../utils/floodPredictionEngine'

const BASE_WEIGHT: Record<RoadType, number> = {
  'Main Road': 5,
  'Arterial Road': 4.5,
  'Residential Street': 3.5,
}

interface RoadLayerProps {
  roads: PredictedRoad[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RoadLayer({ roads, selectedId, onSelect }: RoadLayerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const selected = roads.find((r) => r.road.id === selectedId) ?? null

  return (
    <>
      {roads.map(({ road, prediction }) => {
        const isSelected = road.id === selectedId
        const isHovered = road.id === hoveredId
        const base = BASE_WEIGHT[road.roadType]

        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            className="road-line"
            pathOptions={{
              color: RISK_COLORS[prediction.risk],
              weight: isSelected ? base + 2.5 : isHovered ? base + 1.75 : base,
              opacity: 0.92,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => onSelect(road.id),
              mouseover: () => setHoveredId(road.id),
              mouseout: () => setHoveredId((h) => (h === road.id ? null : h)),
            }}
          >
            <Tooltip sticky>
              <div className="text-[11.5px] font-semibold text-ink">{road.roadName}</div>
              <div
                className="mt-0.5 font-mono text-[10px]"
                style={{ color: RISK_COLORS[prediction.risk] }}
              >
                {RISK_SHORT[prediction.risk]} · {prediction.waterDepthCm.toFixed(1)} cm
              </div>
            </Tooltip>
          </Polyline>
        )
      })}

      {selected && (
        <Polyline
          positions={selected.road.coordinates}
          interactive={false}
          pathOptions={{
            color: '#F8FAFC',
            weight: 2,
            opacity: 0.9,
            dashArray: '3 7',
            className: 'road-selected-dash',
          }}
        />
      )}
    </>
  )
}
