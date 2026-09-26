import { cn } from '../../utils/cn'
import { RISK_COLORS, RISK_SHORT } from '../../utils/floodPredictionEngine'
import type { RiskLevel } from '../../types'

interface RiskBadgeProps {
  risk: RiskLevel
  className?: string
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const color = RISK_COLORS[risk]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.12em]',
        className,
      )}
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {RISK_SHORT[risk]}
    </span>
  )
}

export function RiskDot({ risk, className }: RiskBadgeProps) {
  return (
    <span
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: RISK_COLORS[risk] }}
    />
  )
}
