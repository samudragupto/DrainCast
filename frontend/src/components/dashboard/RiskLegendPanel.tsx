import { Layers } from 'lucide-react'
import { RISK_COLORS, RISK_DEPTH_BANDS, RISK_LABELS, RISK_ORDER } from '../../utils/floodPredictionEngine'
import type { NetworkPrediction } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'

export function RiskLegendPanel({
  prediction,
  delay = 0,
}: {
  prediction: NetworkPrediction
  delay?: number
}) {
  return (
    <FloatingPanel
      title="Flood Risk Legend"
      icon={<Layers className="h-4 w-4" />}
      delay={delay}
      collapsible={false}
    >
      <ul className="space-y-1">
        {RISK_ORDER.map((risk) => {
          const count = prediction.distribution[risk]
          return (
            <li
              key={risk}
              className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors duration-200 hover:bg-elevated/60"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: RISK_COLORS[risk] }}
              />
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-2">
                {RISK_LABELS[risk]}
              </span>
              <span className="font-mono text-[9.5px] text-ink-3">{RISK_DEPTH_BANDS[risk]}</span>
              <span className="tabular w-5 text-right font-mono text-[10.5px] font-semibold text-ink">
                {count}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 border-t border-line/60 pt-2 text-[9.5px] leading-relaxed text-ink-3">
        Estimated depth of water on the carriageway; colors stay identical in both themes.
      </p>
    </FloatingPanel>
  )
}
