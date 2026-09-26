import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import { RISK_COLORS, RISK_LABELS, RISK_ORDER } from '../../utils/floodPredictionEngine'
import type { NetworkPrediction } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function RiskDistributionPanel({
  prediction,
  delay = 0,
}: {
  prediction: NetworkPrediction
  delay?: number
}) {
  const total = prediction.roads.length

  return (
    <FloatingPanel
      title="Risk Distribution"
      icon={<PieChart className="h-4 w-4" />}
      badge={
        <span className="font-mono text-[9px] text-ink-3">
          {total} segments
        </span>
      }
      delay={delay}
      collapsible={false}
      bodyClassName="pt-3"
    >
      <ul className="space-y-2">
        {RISK_ORDER.map((risk) => {
          const count = prediction.distribution[risk]
          const pct = prediction.distributionPct[risk]
          return (
            <li key={risk}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: RISK_COLORS[risk] }}
                  />
                  <span className="truncate text-[11px] text-ink-2">{RISK_LABELS[risk]}</span>
                </span>
                <span className="tabular shrink-0 font-mono text-[10px] text-ink-3">
                  {count} · {pct}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: RISK_COLORS[risk] }}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </FloatingPanel>
  )
}
