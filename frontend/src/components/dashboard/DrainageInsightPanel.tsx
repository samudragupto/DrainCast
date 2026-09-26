import { GitBranch, Network } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { DrainageSummary } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'
import { ToggleSwitch } from '../ui/ToggleSwitch'

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/50 py-1.5 last:border-0">
      <span className="text-[11px] text-ink-3">{label}</span>
      <span className={cn('text-right text-[11.5px] font-medium text-ink', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  )
}

export function DrainageInsightPanel({
  summary,
  showNetwork,
  onToggleNetwork,
  onOpenGraphView,
  delay = 0,
}: {
  summary: DrainageSummary
  showNetwork: boolean
  onToggleNetwork: (show: boolean) => void
  onOpenGraphView: () => void
  delay?: number
}) {
  return (
    <FloatingPanel
      title="Drainage Network Insight"
      icon={<Network className="h-4 w-4" />}
      delay={delay}
      collapsible={false}
    >
      <Row label="Manholes / Inlets / Junctions" value={String(summary.nodeCount)} />
      <Row label="Drainage Pipes (directed edges)" value={String(summary.pipeCount)} />
      <Row label="Average Pipe Capacity" value={`${summary.avgCapacityM3Hr} m³/hr`} />
      <Row label="Total Rated Capacity" value={`${summary.totalCapacityM3Hr} m³/hr`} />
      <Row label="Graph Type" value={summary.graphType} mono={false} />

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-2">
        <span className="text-[11px] leading-snug text-ink-2">
          Show drainage nodes &amp; pipe links on map
        </span>
        <ToggleSwitch
          checked={showNetwork}
          onChange={onToggleNetwork}
          label="Show drainage network on map"
        />
      </div>

      <button
        type="button"
        onClick={onOpenGraphView}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-elevated/50 py-2 text-[11.5px] font-medium text-ink-2 transition-colors duration-200 hover:border-accent/40 hover:text-accent"
      >
        <GitBranch className="h-3.5 w-3.5" />
        Open Drainage Graph View
      </button>
    </FloatingPanel>
  )
}
