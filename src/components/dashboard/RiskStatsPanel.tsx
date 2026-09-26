import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { FloatingPanel } from '../ui/FloatingPanel'
import { StatTile } from '../ui/StatTile'
import { RISK_COLORS, RISK_ORDER } from '../../utils/floodPredictionEngine'
import { fmtCompact, fmtInt } from '../../utils/format'
import type { NetworkPrediction } from '../../types'

interface RiskStatsPanelProps {
  prediction: NetworkPrediction
  delay?: number
}

export function RiskStatsPanel({ prediction, delay = 0 }: RiskStatsPanelProps) {
  const total = prediction.roads.length
  const loadPct = Math.round(prediction.totals.utilizationPct)

  return (
    <FloatingPanel
      title="Live Risk Statistics"
      icon={<Activity className="h-4 w-4" />}
      delay={delay}
      badge={
        <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-safe">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
          </span>
          LIVE
        </span>
      }
      footer={
        <>
          Engine: rainfall × terrain × drain capacity — {fmtInt(prediction.totals.runoffM3Hr)} of{' '}
          {fmtInt(prediction.totals.capacityM3Hr)} m³/hr rated ({loadPct}%)
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Roads at Risk"
            value={prediction.atRiskCount}
            unit={`/ ${total}`}
            tone={prediction.atRiskCount > 0 ? 'warning' : 'default'}
          />
          <StatTile
            label="Residents Affected"
            value={prediction.affectedResidents}
            format={fmtCompact}
            sub="length-weighted est."
          />
          <StatTile
            label="Avg. Water Depth"
            value={prediction.avgDepthCm}
            unit="cm"
            format={(n) => n.toFixed(1)}
            sub="at-risk corridors"
          />
          <StatTile
            label="Peak Depth"
            value={prediction.peakDepthCm}
            unit="cm"
            format={(n) => n.toFixed(1)}
            tone="danger"
          />
        </div>

        <div>
          <div className="flex h-2 overflow-hidden rounded-full bg-elevated/80">
            {RISK_ORDER.map((risk) => {
              const count = prediction.distribution[risk]
              const pct = (count / total) * 100
              if (count === 0) return null
              return (
                <motion.div
                  key={risk}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full"
                  style={{ backgroundColor: RISK_COLORS[risk] }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] text-ink-3">
            <span>{prediction.distribution.safe + prediction.distribution.low} clear / low</span>
            <span>
              {prediction.distribution.moderate + prediction.distribution.high + prediction.distribution.severe}{' '}
              at risk
            </span>
          </div>
        </div>
      </div>
    </FloatingPanel>
  )
}
