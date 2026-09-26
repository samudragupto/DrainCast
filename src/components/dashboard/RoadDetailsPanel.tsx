import { AnimatePresence, motion } from 'framer-motion'
import { Mountain, Waves, Workflow, X } from 'lucide-react'
import { EASE_OUT } from '../ui/FloatingPanel'
import { RiskBadge } from '../ui/RiskBadge'
import {
  HORIZONS,
  RISK_COLORS,
  nodeById,
  outgoingPipeOf,
  predictRoad,
} from '../../utils/floodPredictionEngine'
import { terrainByArea } from '../../data/terrainData'
import { fmtInt } from '../../utils/format'
import type { PredictedRoad, TimeHorizon } from '../../types'

interface RoadDetailsPanelProps {
  selected: PredictedRoad | null
  rainfall: number
  horizon: TimeHorizon
  onClose: () => void
}

export function RoadDetailsPanel({ selected, rainfall, horizon, onClose }: RoadDetailsPanelProps) {
  const projection = selected
    ? HORIZONS.map((h) => ({
        horizon: h.id,
        label: h.label,
        depthCm: predictRoad(selected.road, rainfall * h.multiplier).waterDepthCm,
        risk: predictRoad(selected.road, rainfall * h.multiplier).risk,
      }))
    : []

  return (
    <AnimatePresence>
      {selected && (
        <motion.aside
          key="road-details"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="pointer-events-auto max-h-[52vh] overflow-y-auto rounded-xl border border-line bg-surface/95 shadow-raised backdrop-blur-md xl:max-h-[calc(100%-7rem)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line/60 px-4 py-3">
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold leading-tight text-ink">
                {selected.road.roadName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
                <span>{selected.road.areaName}</span>
                <span className="text-line">|</span>
                <span>{selected.road.roadType}</span>
                <span className="text-line">|</span>
                <span>{selected.road.roadLengthM} m</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close road details"
              onClick={onClose}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line text-ink-3 transition-colors hover:text-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                  Projected water depth
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className="font-mono text-[26px] font-semibold leading-none tabular-nums"
                    style={{ color: RISK_COLORS[selected.prediction.risk] }}
                  >
                    {selected.prediction.waterDepthCm.toFixed(1)}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">cm</span>
                </div>
              </div>
              <RiskBadge risk={selected.prediction.risk} />
            </div>

            <div className="space-y-2.5">
              <BarRow
                label="Surface runoff"
                value={selected.prediction.runoffM3Hr}
                max={Math.max(selected.prediction.runoffM3Hr, selected.prediction.drainCapacityM3Hr)}
                color="#22D3EE"
              />
              <BarRow
                label="Drain capacity"
                value={selected.prediction.drainCapacityM3Hr}
                max={Math.max(selected.prediction.runoffM3Hr, selected.prediction.drainCapacityM3Hr)}
                color="#22C55E"
              />
              <div className="font-mono text-[9.5px] leading-relaxed text-ink-3">
                {selected.prediction.utilizationPct.toFixed(0)}% utilization ·{' '}
                {selected.prediction.inletCount} inlets ×{' '}
                {fmtInt(selected.prediction.drainCapacityM3Hr / (selected.prediction.inletCount * 0.92))}{' '}
                m³/hr · 92% efficiency
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 border-t border-line/60 pt-3 sm:grid-cols-2">
              <div className="rounded-lg border border-line/70 bg-elevated/40 p-2.5">
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  <Workflow className="h-3 w-3 text-accent-2" /> connected drain
                </div>
                {(() => {
                  const node = nodeById(selected.road.connectedDrainNodeId)
                  const pipe = outgoingPipeOf(node.id)
                  return (
                    <div className="mt-1.5 space-y-0.5">
                      <div className="text-[12px] font-medium text-ink">
                        {node.nodeName}{' '}
                        <span className="font-normal text-ink-3">· {node.type}</span>
                      </div>
                      <div className="font-mono text-[9.5px] text-ink-3">
                        invert {node.elevationM.toFixed(1)} m
                      </div>
                      {pipe && (
                        <div className="font-mono text-[9.5px] text-ink-3">
                          {pipe.id} → {pipe.to} · {pipe.capacityM3Hr} m³/hr
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="rounded-lg border border-line/70 bg-elevated/40 p-2.5">
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  <Mountain className="h-3 w-3 text-accent-2" /> terrain
                </div>
                {(() => {
                  const zone = terrainByArea.get(selected.road.areaName)
                  return (
                    <div className="mt-1.5 space-y-0.5">
                      <div className="text-[12px] font-medium text-ink">
                        {selected.prediction.terrainClass}
                      </div>
                      {zone && (
                        <div className="font-mono text-[9.5px] text-ink-3">
                          {zone.avgElevationM.toFixed(1)} m · {zone.avgSlopeDeg.toFixed(1)}° slope ·
                          retention ×{selected.prediction.terrainFactor.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="border-t border-line/60 pt-3">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                <Waves className="h-3 w-3 text-accent-2" /> depth over the horizon
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {projection.map((p) => (
                  <div
                    key={p.horizon}
                    className={`rounded-md border px-2 py-1.5 text-center ${
                      p.horizon === horizon ? 'border-accent/50 bg-accent/10' : 'border-line bg-elevated/40'
                    }`}
                  >
                    <div
                      className="font-mono text-[12px] font-semibold tabular-nums"
                      style={{ color: RISK_COLORS[p.risk] }}
                    >
                      {p.depthCm.toFixed(1)}
                    </div>
                    <div className="mt-0.5 font-mono text-[8.5px] text-ink-3">{p.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="rounded-lg border border-line/70 bg-elevated/40 p-3 text-[11.5px] leading-relaxed text-ink-2">
              {selected.prediction.reason}
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[9.5px]">
        <span className="uppercase tracking-wide text-ink-3">{label}</span>
        <span className="tabular-nums text-ink-2">{fmtInt(value)} m³/hr</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}
