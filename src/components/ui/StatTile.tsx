import { useCountUp } from '../../hooks/useCountUp'
import { cn } from '../../utils/cn'

interface StatTileProps {
  label: string
  value: number
  unit?: string
  sub?: string
  format?: (n: number) => string
  tone?: 'default' | 'accent' | 'warning' | 'danger'
}

export function StatTile({ label, value, unit, sub, format, tone = 'default' }: StatTileProps) {
  const display = useCountUp(value)
  const shown = format ? format(display) : Math.round(display).toLocaleString('en-IN')

  return (
    <div className="rounded-lg border border-line/80 bg-elevated/50 px-3 py-2.5 transition-colors hover:border-line">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={cn(
            'text-[19px] font-semibold leading-none tracking-tight',
            tone === 'accent' && 'text-accent',
            tone === 'warning' && 'text-warning',
            tone === 'danger' && 'text-critical',
          )}
        >
          {shown}
        </span>
        {unit && <span className="font-mono text-[10px] text-ink-3">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-[10.5px] leading-snug text-ink-3">{sub}</div>}
    </div>
  )
}
