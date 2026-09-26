import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { HorizonSummary, TimeHorizon } from '../../types'

interface NowcastTimelineProps {
  series: HorizonSummary[]
  horizon: TimeHorizon
  onChange: (horizon: TimeHorizon) => void
}

export function NowcastTimeline({ series, horizon, onChange }: NowcastTimelineProps) {
  const max = Math.max(...series.map((s) => s.highCount + s.severeCount), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto rounded-xl border border-line bg-surface/95 px-4 py-3 shadow-panel backdrop-blur-md"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
          0–3 Hour Nowcast
        </span>
        <span className="font-mono text-[9.5px] text-ink-3">high + severe corridors</span>
      </div>

      <div className="flex items-stretch gap-2">
        {series.map((s) => {
          const active = s.horizon === horizon
          const count = s.highCount + s.severeCount
          const barHeight = Math.max(6, (count / max) * 40)
          const barColor =
            s.severeCount > 0 ? '#DC2626' : count > 0 ? '#F97316' : '#242B45'

          return (
            <motion.button
              key={s.horizon}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(s.horizon)}
              className={cn(
                'flex min-w-[74px] flex-1 flex-col items-center rounded-lg border px-2.5 py-2 transition-colors',
                active
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-line bg-elevated/40 hover:border-ink-3/40',
              )}
              aria-pressed={active}
            >
              <span
                className={cn(
                  'font-mono text-[15px] font-semibold leading-none tabular-nums',
                  count > 0 ? 'text-danger' : 'text-ink-3',
                )}
              >
                {count}
              </span>
              <div className="mt-1.5 flex h-[42px] items-end">
                <motion.span
                  initial={false}
                  animate={{ height: barHeight }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="w-6 rounded-[3px]"
                  style={{ backgroundColor: barColor }}
                />
              </div>
              <span
                className={cn(
                  'mt-1.5 font-mono text-[9.5px] font-medium',
                  active ? 'text-accent' : 'text-ink-3',
                )}
              >
                {s.label}
              </span>
              <span className="font-mono text-[8.5px] tabular-nums text-ink-3">
                {s.effectiveRainfallMmHr.toFixed(0)} mm/hr
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
