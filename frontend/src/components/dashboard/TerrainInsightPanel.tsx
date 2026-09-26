import { Mountain } from 'lucide-react'
import { TERRAIN_KEY_REASON } from '../../utils/floodPredictionEngine'
import type { NetworkPrediction } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'
import { ToggleSwitch } from '../ui/ToggleSwitch'

export function TerrainInsightPanel({
  prediction,
  showZones,
  onToggleZones,
  delay = 0,
}: {
  prediction: NetworkPrediction
  showZones: boolean
  onToggleZones: (show: boolean) => void
  delay?: number
}) {
  const t = prediction.terrain
  const atRisk = t.lowLyingAtRisk
  const impact =
    atRisk === 0
      ? { label: 'Low-lying pockets currently holding', tone: 'text-safe', border: 'border-safe/40' }
      : atRisk <= 2
        ? { label: `${atRisk} low-lying corridor at High+ risk`, tone: 'text-warning', border: 'border-warning/40' }
        : { label: `${atRisk} low-lying corridors at High+ risk`, tone: 'text-critical', border: 'border-critical/40' }

  return (
    <FloatingPanel
      title="Terrain & Elevation Insight"
      icon={<Mountain className="h-4 w-4" />}
      delay={delay}
      collapsible={false}
    >
      <div className="space-y-0">
        <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5">
          <span className="text-[11px] text-ink-3">Dominant Terrain</span>
          <span className="text-right text-[11.5px] font-medium text-ink">
            {t.dominantClass}
            <span className="block text-[9.5px] font-normal text-ink-3">
              with low-lying pockets
            </span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5">
          <span className="text-[11px] text-ink-3">Elevation Range</span>
          <span className="font-mono text-[11.5px] font-medium text-ink">
            {t.elevationMinM.toFixed(1)} – {t.elevationMaxM.toFixed(1)} m
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5">
          <span className="text-[11px] text-ink-3">Slope Range</span>
          <span className="font-mono text-[11.5px] font-medium text-ink">
            {t.slopeMinDeg.toFixed(1)}° – {t.slopeMaxDeg.toFixed(1)}°
          </span>
        </div>
      </div>

      <p className="mt-2.5 border-l-2 border-accent/50 pl-2.5 text-[10.5px] italic leading-relaxed text-ink-2">
        “{TERRAIN_KEY_REASON}”
      </p>

      <div
        className={`mt-2.5 flex items-center justify-between rounded-lg border ${impact.border} bg-elevated/40 px-2.5 py-2`}
      >
        <span className="text-[10px] uppercase tracking-[0.12em] text-ink-3">
          Terrain Impact (live)
        </span>
        <span className={`font-mono text-[10.5px] font-semibold ${impact.tone}`}>
          {impact.label}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-2">
        <span className="text-[11px] leading-snug text-ink-2">Show terrain zones on map</span>
        <ToggleSwitch checked={showZones} onChange={onToggleZones} label="Show terrain zones" />
      </div>
    </FloatingPanel>
  )
}
