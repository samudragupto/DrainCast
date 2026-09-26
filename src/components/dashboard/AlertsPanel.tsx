import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { FloatingPanel } from '../ui/FloatingPanel'
import { RISK_COLORS } from '../../utils/floodPredictionEngine'
import { fmtInt } from '../../utils/format'
import type { NetworkPrediction } from '../../types'

interface AlertsPanelProps {
  prediction: NetworkPrediction
  onSelect: (roadId: string) => void
  delay?: number
}

export function AlertsPanel({ prediction, onSelect, delay = 0 }: AlertsPanelProps) {
  const alerts = prediction.roads
    .filter((r) => r.prediction.risk === 'high' || r.prediction.risk === 'severe')
    .sort((a, b) => b.prediction.waterDepthCm - a.prediction.waterDepthCm)
    .slice(0, 4)

  const badge =
    alerts.length > 0 ? (
      <span className="rounded-md border border-critical/50 bg-critical/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.1em] text-critical">
        {alerts.length} ACTIVE
      </span>
    ) : (
      <span className="rounded-md border border-safe/40 bg-safe/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.1em] text-safe">
        CLEAR
      </span>
    )

  return (
    <FloatingPanel
      title="High-Risk Road Alerts"
      icon={<ShieldAlert className="h-4 w-4" />}
      badge={badge}
      delay={delay}
      bodyClassName="px-2.5 py-2.5"
    >
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2.5 px-1 py-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-safe" />
          <p className="text-[11.5px] leading-snug text-ink-3">
            No high-risk corridors — drains are keeping pace at{' '}
            {prediction.effectiveRainfallMmHr.toFixed(0)} mm/hr effective intensity.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {alerts.map(({ road, prediction: p }) => (
            <li key={road.id}>
              <button
                type="button"
                onClick={() => onSelect(road.id)}
                className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-line hover:bg-elevated/60"
              >
                <span
                  className="h-8 w-[3px] shrink-0 rounded-full"
                  style={{ backgroundColor: RISK_COLORS[p.risk] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">
                    {road.roadName}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
                    {road.areaName}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className="block font-mono text-[13px] font-semibold leading-none tabular-nums"
                    style={{ color: RISK_COLORS[p.risk] }}
                  >
                    {p.waterDepthCm.toFixed(1)}
                    <span className="text-[9px] text-ink-3"> cm</span>
                  </span>
                  <span className="mt-1 block font-mono text-[9px] text-ink-3">
                    +{fmtInt(p.excessM3Hr)} m³/hr
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </FloatingPanel>
  )
}
