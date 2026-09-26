import { Layers } from 'lucide-react'
import { FloatingPanel } from '../ui/FloatingPanel'
import {
  RISK_COLORS,
  RISK_DEPTH_BANDS,
  RISK_LABELS,
  RISK_ORDER,
} from '../../utils/floodPredictionEngine'

const NODE_LEGEND = [
  { label: 'Manhole', color: '#22D3EE' },
  { label: 'Stormwater Inlet', color: '#38BDF8' },
  { label: 'Junction', color: '#9AA3C0' },
]

export function RiskLegendPanel({ delay = 0 }: { delay?: number }) {
  return (
    <FloatingPanel
      title="Flood Risk Legend"
      icon={<Layers className="h-4 w-4" />}
      delay={delay}
      footer={<>Basemap © OpenStreetMap · CARTO — flood layers are simulated demo data</>}
    >
      <ul className="space-y-1.5">
        {RISK_ORDER.map((risk) => (
          <li key={risk} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[12px] text-ink-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: RISK_COLORS[risk] }}
              />
              {RISK_LABELS[risk]}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-ink-3">
              {RISK_DEPTH_BANDS[risk]}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-line/60 pt-2.5">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
          Drainage assets
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {NODE_LEGEND.map((n) => (
            <span key={n.label} className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
              <span
                className="h-2.5 w-2.5 rounded-full border"
                style={{ borderColor: n.color, backgroundColor: `${n.color}33` }}
              />
              {n.label}
            </span>
          ))}
        </div>
      </div>
    </FloatingPanel>
  )
}
