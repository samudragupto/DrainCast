import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { CloudRain, Layers } from 'lucide-react'
import { FloatingPanel } from '../ui/FloatingPanel'
import { SegmentedControl } from '../ui/SegmentedControl'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { useCountUp } from '../../hooks/useCountUp'
import {
  HORIZONS,
  TIME_MULTIPLIERS,
  describeRainfall,
} from '../../utils/floodPredictionEngine'
import type { TimeHorizon } from '../../types'
import { cn } from '../../utils/cn'

export interface LayerToggles {
  nodes: boolean
  pipes: boolean
  zones: boolean
}

interface RainfallControlPanelProps {
  rainfall: number
  onRainfallChange: (value: number) => void
  horizon: TimeHorizon
  onHorizonChange: (horizon: TimeHorizon) => void
  layers: LayerToggles
  onLayersChange: (layers: LayerToggles) => void
  effectiveRainfall: number
  delay?: number
}

const PRESETS = [
  { label: 'Drizzle', value: 12 },
  { label: 'Monsoon', value: 38 },
  { label: 'Downpour', value: 58 },
  { label: 'Burst', value: 78 },
]

const LAYER_ROWS: [keyof LayerToggles, string][] = [
  ['nodes', 'Drainage nodes'],
  ['pipes', 'Pipe network'],
  ['zones', 'Low-lying zones'],
]

export function RainfallControlPanel({
  rainfall,
  onRainfallChange,
  horizon,
  onHorizonChange,
  layers,
  onLayersChange,
  effectiveRainfall,
  delay = 0,
}: RainfallControlPanelProps) {
  const descriptor = describeRainfall(effectiveRainfall)
  const animatedRain = useCountUp(effectiveRainfall, 320)
  const fill = ((rainfall - 5) / (80 - 5)) * 100
  const multiplier = TIME_MULTIPLIERS[horizon]

  return (
    <FloatingPanel
      title="Rainfall Nowcast Control"
      icon={<CloudRain className="h-4 w-4" />}
      delay={delay}
      footer={<>Runoff model · C = 0.85 · inlet spacing 140 m · network efficiency 92%</>}
    >
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[30px] font-semibold leading-none tracking-tight tabular-nums text-ink">
                {animatedRain.toFixed(0)}
              </span>
              <span className="font-mono text-[11px] text-ink-3">mm/hr</span>
            </div>
            <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
              effective intensity · {multiplier.toFixed(2)}×
            </div>
          </div>
          <span
            className="rounded-md border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide"
            style={{
              color: descriptor.color,
              borderColor: `${descriptor.color}55`,
              backgroundColor: `${descriptor.color}12`,
            }}
          >
            {descriptor.label}
          </span>
        </div>

        <div>
          <input
            type="range"
            min={5}
            max={80}
            step={1}
            value={rainfall}
            onChange={(e) => onRainfallChange(Number(e.target.value))}
            className="dc-range"
            style={{ '--fill': `${fill}%` } as CSSProperties}
            aria-label="Rainfall intensity in mm per hour"
          />
          <div className="mt-0.5 flex justify-between font-mono text-[9px] text-ink-3">
            {[5, 20, 40, 60, 80].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.label}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onRainfallChange(preset.value)}
              className={cn(
                'rounded-md border px-1 py-1.5 text-[10.5px] font-medium transition-colors',
                rainfall === preset.value
                  ? 'border-accent/50 bg-accent/10 text-accent'
                  : 'border-line bg-elevated/50 text-ink-2 hover:border-ink-3/40 hover:text-ink',
              )}
            >
              <div>{preset.label}</div>
              <div className="mt-0.5 font-mono text-[8.5px] text-ink-3">{preset.value}</div>
            </motion.button>
          ))}
        </div>

        <div className="h-px bg-line/60" />

        <div>
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
            Time horizon
          </div>
          <SegmentedControl
            options={HORIZONS.map((h) => ({ value: h.id, label: h.label }))}
            value={horizon}
            onChange={onHorizonChange}
          />
          <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
            <span className="text-ink-3">projected intensity</span>
            <span className="tabular-nums text-ink-2">{effectiveRainfall.toFixed(1)} mm/hr</span>
          </div>
        </div>

        <div className="h-px bg-line/60" />

        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
            <Layers className="h-3 w-3" /> map layers
          </div>
          {LAYER_ROWS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[12px] text-ink-2">{label}</span>
              <ToggleSwitch
                checked={layers[key]}
                onChange={(v) => onLayersChange({ ...layers, [key]: v })}
                label={label}
              />
            </div>
          ))}
        </div>
      </div>
    </FloatingPanel>
  )
}
