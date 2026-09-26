import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { NETWORK_LENGTH_M } from '../../data/velacheryRoads'
import { RISK_COLORS, RISK_ORDER, predictNetwork } from '../../utils/floodPredictionEngine'
import { fmtInt } from '../../utils/format'
import { EASE_OUT } from '../ui/FloatingPanel'

const DEMO_RAINFALL = 50

export function EngineReadout() {
  const prediction = useMemo(
    () => predictNetwork({ rainfallIntensityMmHr: DEMO_RAINFALL, horizon: 'now' }),
    [],
  )
  const total = prediction.roads.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.2, ease: EASE_OUT }}
      className="overflow-hidden rounded-2xl border border-line bg-surface/80 shadow-panel backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-critical/70" />
          <span className="h-2 w-2 rounded-full bg-warning/70" />
          <span className="h-2 w-2 rounded-full bg-safe/70" />
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
          Nowcast engine — live simulation
        </span>
        <span className="font-mono text-[9.5px] tracking-[0.14em] text-safe">● RUNNING</span>
      </div>

      <div className="space-y-2.5 px-4 py-4 font-mono text-[11.5px] leading-relaxed">
        <ReadoutRow
          label="RAINFALL"
          value={`${DEMO_RAINFALL} mm/hr · NE monsoon cell`}
          color="#38BDF8"
        />
        <ReadoutRow
          label="SURFACE LOAD"
          value={`${fmtInt(prediction.totals.runoffM3Hr)} m³/hr · ${(NETWORK_LENGTH_M / 1000).toFixed(1)} km carriageway`}
          color="#22D3EE"
        />
        <ReadoutRow
          label="DRAIN CAPACITY"
          value={`${fmtInt(prediction.totals.capacityM3Hr)} m³/hr rated · 92% efficiency`}
          color="#22C55E"
        />
        <ReadoutRow
          label="NOWCAST 0–3 H"
          value={`${prediction.distribution.high} high · ${prediction.distribution.severe} severe corridors projected`}
          color={
            prediction.distribution.severe > 0
              ? RISK_COLORS.severe
              : prediction.distribution.high > 0
                ? RISK_COLORS.high
                : RISK_COLORS.safe
          }
        />
      </div>

      <div className="px-4">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-elevated">
          {RISK_ORDER.map((risk) => {
            const pct = (prediction.distribution[risk] / total) * 100
            if (prediction.distribution[risk] === 0) return null
            return (
              <div
                key={risk}
                className="h-full"
                style={{ width: `${pct}%`, backgroundColor: RISK_COLORS[risk] }}
              />
            )
          })}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] text-ink-3">
          <span>{prediction.distribution.safe + prediction.distribution.low} corridors clear</span>
          <span>
            {prediction.distribution.moderate + prediction.distribution.high + prediction.distribution.severe}{' '}
            at risk
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line/70 px-4 py-2.5 font-mono text-[9.5px] text-ink-3">
        <span>velachery_demo · engine v0.9 · client-side</span>
        <span className="cursor-blink text-accent">▍</span>
      </div>
    </motion.div>
  )
}

function ReadoutRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-[9.5px] tracking-[0.14em] text-ink-3">{label}</span>
      <span className="text-right text-[11.5px]" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
