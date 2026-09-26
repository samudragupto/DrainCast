import { Activity } from 'lucide-react'
import { RISK_COLORS } from '../../utils/floodPredictionEngine'
import type { NetworkPrediction } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'
import { useCountUp } from '../../hooks/useCountUp'

function StatCell({
  label,
  value,
  unit,
  color,
  delay = 0,
}: {
  label: string
  value: number
  unit?: string
  color?: string
  delay?: number
}) {
  const display = useCountUp(value, 500)
  return (
    <div className="rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-2">
      <div className="truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="tabular font-display text-[19px] font-bold leading-none tracking-tight"
          style={color ? { color } : undefined}
        >
          {Math.round(display)}
        </span>
        {unit && <span className="font-mono text-[9px] text-ink-3">{unit}</span>}
      </div>
      {/* keep delay referenced for stagger parity */}
      <span className="hidden" data-delay={delay} />
    </div>
  )
}

export function RiskOverviewPanel({
  prediction,
  delay = 0,
}: {
  prediction: NetworkPrediction
  delay?: number
}) {
  return (
    <FloatingPanel
      title="Live Risk Overview"
      icon={<Activity className="h-4 w-4" />}
      badge={
        <span className="rounded border border-line bg-elevated px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
          {prediction.horizonLabel}
        </span>
      }
      delay={delay}
      collapsible={false}
      bodyClassName="pt-3"
    >
      <div className="grid grid-cols-3 gap-1.5">
        <StatCell label="Road Segments" value={prediction.roads.length} />
        <StatCell label="No / Low Risk" value={prediction.noLowCount} color={RISK_COLORS.safe} />
        <StatCell label="Moderate" value={prediction.moderateCount} color={RISK_COLORS.moderate} />
        <StatCell label="High Risk" value={prediction.highCount} color={RISK_COLORS.high} />
        <StatCell label="Severe" value={prediction.severeCount} color={RISK_COLORS.severe} />
        <StatCell
          label="Max Depth"
          value={prediction.maxDepthCm}
          unit="cm"
          color={RISK_COLORS.severe}
        />
      </div>
      <p className="mt-2.5 border-t border-line/60 pt-2 text-[10px] leading-relaxed text-ink-3">
        Network load{' '}
        <span className="font-mono text-ink-2">{Math.round(prediction.totals.utilizationPct)}%</span>{' '}
        of rated drain capacity · affected residents ≈{' '}
        <span className="font-mono text-ink-2">
          {prediction.affectedResidents.toLocaleString('en-IN')}
        </span>
      </p>
    </FloatingPanel>
  )
}
