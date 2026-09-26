import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { RISK_COLORS } from '../../utils/floodPredictionEngine'
import type { NetworkPrediction, PredictedRoad } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function AlertsPanel({
  prediction,
  onSelect,
  delay = 0,
}: {
  prediction: NetworkPrediction
  onSelect: (roadId: string) => void
  delay?: number
}) {
  const alerts = prediction.roads
    .filter((r) => r.prediction.risk === 'high' || r.prediction.risk === 'severe')
    .sort((a, b) => b.prediction.waterDepthCm - a.prediction.waterDepthCm)
    .slice(0, 6)

  return (
    <FloatingPanel
      title="High-Risk Road Alerts"
      icon={<AlertTriangle className="h-4 w-4" />}
      badge={
        alerts.length > 0 ? (
          <span className="rounded border border-critical/50 bg-critical/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-critical">
            {alerts.length}
          </span>
        ) : undefined
      }
      delay={delay}
      collapsible={false}
      bodyClassName="px-2 py-2"
    >
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2.5 px-2 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" />
          <p className="text-[11.5px] leading-snug text-ink-3">
            No high-risk corridors at {prediction.rainfallIntensityMmHr} mm/hr (
            {prediction.horizonLabel}). Drag the slider to stress-test the network.
          </p>
        </div>
      ) : (
        <ul className="max-h-[168px] space-y-1 overflow-y-auto pr-0.5">
          <AnimatePresence initial={false}>
            {alerts.map(({ road, prediction: p }) => (
              <motion.li
                key={road.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(road.id)}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-line/60 bg-elevated/40 px-2.5 py-2 text-left transition-colors duration-200 hover:border-accent/40 hover:bg-elevated"
                >
                  <span
                    className="h-7 w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[p.risk] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-ink group-hover:text-accent">
                      {road.roadName}
                    </span>
                    <span className="block truncate text-[10px] text-ink-3">{road.areaName}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className="tabular block font-mono text-[12px] font-semibold leading-tight"
                      style={{ color: RISK_COLORS[p.risk] }}
                    >
                      {p.waterDepthCm.toFixed(1)} cm
                    </span>
                    <span className="block font-mono text-[8.5px] text-ink-3">
                      +{Math.round(p.excessM3Hr).toLocaleString('en-IN')} m³/hr
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </FloatingPanel>
  )
}

export type { PredictedRoad }
