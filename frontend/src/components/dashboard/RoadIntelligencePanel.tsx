import { AnimatePresence, motion } from 'framer-motion'
import {
  Droplets,
  Gauge,
  Info,
  Lightbulb,
  MapPinned,
  Mountain,
  Timer,
  Waves,
  X,
} from 'lucide-react'
import { nodeById, RISK_COLORS, RISK_LABELS, RISK_SHORT } from '../../utils/floodPredictionEngine'
import { fmtInt } from '../../utils/format'
import type { PredictedRoad, TimeHorizon } from '../../types'
import { HORIZONS } from '../../utils/floodPredictionEngine'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

function MetricRow({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/50 py-2 last:border-0">
      <span className="flex items-center gap-1.5 text-[10.5px] leading-snug text-ink-3">
        {icon}
        {label}
      </span>
      <span className="text-right">
        <span className="tabular block font-mono text-[11.5px] font-medium leading-snug text-ink">
          {value}
        </span>
        {hint && <span className="block font-mono text-[8.5px] text-ink-3">{hint}</span>}
      </span>
    </div>
  )
}

export function RoadIntelligencePanel({
  selected,
  rainfall,
  horizon,
  onClose,
}: {
  selected: PredictedRoad | null
  rainfall: number
  horizon: TimeHorizon
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {selected && (
        <motion.section
          key={selected.road.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="pointer-events-auto flex max-h-full flex-col overflow-hidden rounded-xl border border-line bg-surface/97 shadow-panel backdrop-blur-md"
          aria-label="Selected road intelligence"
        >
          {/* Header */}
          <header className="flex items-start justify-between gap-2 border-b border-line px-3.5 py-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink-3">
                <MapPinned className="h-3 w-3 text-accent" />
                Selected Road Intelligence
              </div>
              <h3 className="truncate font-display text-[15px] font-semibold leading-tight text-ink">
                {selected.road.roadName}
              </h3>
              <p className="mt-0.5 text-[10.5px] text-ink-3">
                {selected.road.areaName} · {selected.road.roadType}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close road intelligence"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line text-ink-3 transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-2.5">
            <MetricRow
              label="Road Length"
              value={`${fmtInt(selected.road.roadLengthM)} m`}
              icon={<Gauge className="h-3 w-3" />}
            />
            <MetricRow
              label="Connected Drainage Node"
              value={nodeById(selected.road.connectedDrainNodeId).nodeName}
              hint={`${nodeById(selected.road.connectedDrainNodeId).type} · ${selected.prediction.inletCount} inlets`}
              icon={<Waves className="h-3 w-3" />}
            />
            <MetricRow
              label="Rainfall Considered"
              value={`${rainfall} mm/hr × ${
                HORIZONS.find((h) => h.id === horizon)?.multiplier.toFixed(2)
              }`}
              hint={`effective ${selected.prediction.effectiveRainfallMmHr.toFixed(0)} mm/hr · ${
                HORIZONS.find((h) => h.id === horizon)?.label
              }`}
              icon={<Droplets className="h-3 w-3" />}
            />
            <MetricRow
              label="Estimated Surface Runoff"
              value={`${fmtInt(selected.prediction.runoffM3Hr)} m³/hr`}
              hint={`catchment ${fmtInt(selected.prediction.catchmentAreaM2)} m² · 85% impervious`}
            />
            <MetricRow
              label="Drainage Pipe Capacity"
              value={`${fmtInt(selected.prediction.drainCapacityM3Hr)} m³/hr`}
              hint={`load ${Math.round(selected.prediction.utilizationPct)}% of rated`}
            />
            <MetricRow
              label="Excess Water (Runoff − Capacity)"
              value={
                selected.prediction.excessM3Hr > 0
                  ? `+${fmtInt(selected.prediction.excessM3Hr)} m³/hr`
                  : 'None — drain coping'
              }
              hint={`terrain retention ×${selected.prediction.terrainFactor.toFixed(2)}`}
            />
            <MetricRow
              label="Terrain Influence"
              value={selected.prediction.terrainInfluence}
              hint={selected.prediction.terrainClass}
              icon={<Mountain className="h-3 w-3" />}
            />
            <MetricRow
              label="Time Horizon"
              value={HORIZONS.find((h) => h.id === horizon)?.label ?? 'Now'}
              icon={<Timer className="h-3 w-3" />}
            />

            {/* Risk + depth */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div
                className="rounded-lg border px-3 py-2.5"
                style={{
                  borderColor: `${RISK_COLORS[selected.prediction.risk]}55`,
                  backgroundColor: `${RISK_COLORS[selected.prediction.risk]}10`,
                }}
              >
                <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  Flood Risk Level
                </div>
                <div
                  className="mt-1 font-display text-[15px] font-bold leading-none"
                  style={{ color: RISK_COLORS[selected.prediction.risk] }}
                >
                  {RISK_LABELS[selected.prediction.risk]}
                </div>
                <div
                  className="mt-1 font-mono text-[8.5px]"
                  style={{ color: RISK_COLORS[selected.prediction.risk] }}
                >
                  {RISK_SHORT[selected.prediction.risk]}
                </div>
              </div>
              <div className="rounded-lg border border-line bg-elevated/50 px-3 py-2.5">
                <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  Estimated Water Depth
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="tabular font-display text-[22px] font-bold leading-none text-ink">
                    {selected.prediction.waterDepthCm.toFixed(1)}
                  </span>
                  <span className="font-mono text-[9px] text-ink-3">cm</span>
                </div>
              </div>
            </div>

            {/* WHY */}
            <div className="mt-3 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-accent">
                <Info className="h-3 w-3" />
                Why is this road at this risk?
              </div>
              <p className="text-[11px] leading-relaxed text-ink-2">
                {selected.prediction.why}
              </p>
            </div>

            {/* Recommendation */}
            <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-line bg-elevated/50 px-3 py-2.5">
              <Lightbulb className="h-4 w-4 shrink-0 text-warning" />
              <div>
                <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  Recommendation
                </div>
                <div className="mt-0.5 text-[12px] font-semibold text-ink">
                  {selected.prediction.recommendation}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
