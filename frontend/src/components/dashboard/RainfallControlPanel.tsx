import { motion } from 'framer-motion'
import { CloudDrizzle, CloudRain, Pause, Play, RotateCcw } from 'lucide-react'
import { cn } from '../../utils/cn'
import {
  DEFAULT_RAINFALL,
  HORIZONS,
  RAINFALL_CATEGORY_COLORS,
  RAINFALL_MAX,
  RAINFALL_MIN,
  RAINFALL_SCENARIOS,
  rainfallCategory,
} from '../../utils/floodPredictionEngine'
import type { TimeHorizon } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'

interface RainfallControlPanelProps {
  rainfall: number
  onRainfallChange: (value: number) => void
  horizon: TimeHorizon
  onHorizonChange: (value: TimeHorizon) => void
  playing: boolean
  onTogglePlay: () => void
  effectiveRainfall: number
  delay?: number
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function RainfallControlPanel({
  rainfall,
  onRainfallChange,
  horizon,
  onHorizonChange,
  playing,
  onTogglePlay,
  effectiveRainfall,
  delay = 0,
}: RainfallControlPanelProps) {
  const category = rainfallCategory(rainfall)
  const categoryColor = RAINFALL_CATEGORY_COLORS[category]
  const fillPct = ((rainfall - RAINFALL_MIN) / (RAINFALL_MAX - RAINFALL_MIN)) * 100

  return (
    <FloatingPanel
      title="Rainfall Nowcast Control"
      icon={<CloudRain className="h-4 w-4" />}
      delay={delay}
      collapsible={false}
    >
      {/* Intensity slider */}
      <div className="mb-1 flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
            Rainfall Intensity
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <motion.span
              key={rainfall}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="tabular font-display text-[28px] font-bold leading-none tracking-tight text-ink"
            >
              {rainfall}
            </motion.span>
            <span className="font-mono text-[11px] text-ink-3">mm/hr</span>
          </div>
        </div>
        <span
          className="rounded-md border px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]"
          style={{
            color: categoryColor,
            borderColor: `${categoryColor}55`,
            backgroundColor: `${categoryColor}14`,
          }}
        >
          {category}
        </span>
      </div>

      <input
        type="range"
        className="dc-range mt-3"
        min={RAINFALL_MIN}
        max={RAINFALL_MAX}
        step={1}
        value={rainfall}
        aria-label="Rainfall intensity in mm per hour"
        onChange={(e) => onRainfallChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${fillPct}%` }}
      />
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-ink-3">
        <span>{RAINFALL_MIN}</span>
        <span>{RAINFALL_MAX} mm/hr</span>
      </div>

      {/* 0–3 hour timeline */}
      <div className="mt-5">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
          0–3 Hour Nowcast Timeline
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-lg border border-line bg-elevated/60 p-1">
          {HORIZONS.map((h) => {
            const active = h.id === horizon
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHorizonChange(h.id)}
                className={cn(
                  'rounded-md py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] transition-all duration-200',
                  active
                    ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]'
                    : 'text-ink-3 hover:bg-surface hover:text-ink-2',
                )}
              >
                {h.short}
              </button>
            )
          })}
        </div>
      </div>

      {/* Auto-play */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onTogglePlay}
        className={cn(
          'mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-[12px] font-medium transition-colors duration-200',
          playing
            ? 'border-accent/50 bg-accent/10 text-accent'
            : 'border-line bg-elevated/60 text-ink-2 hover:border-accent/40 hover:text-accent',
        )}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {playing ? 'Pause Nowcast' : 'Auto-Play Nowcast'}
        {playing && (
          <span className="pulse-dot ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </motion.button>

      {/* Scenarios */}
      <div className="mt-5">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
          Quick Scenarios
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RAINFALL_SCENARIOS.map((s) => {
            const active = s.intensity === rainfall
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onRainfallChange(s.intensity)}
                className={cn(
                  'rounded-md border px-2 py-1 text-[10.5px] font-medium transition-all duration-200',
                  active
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-line bg-elevated/50 text-ink-2 hover:border-accent/40 hover:text-ink',
                )}
              >
                {s.label}
                <span className="ml-1 font-mono text-[9px] text-ink-3">{s.intensity}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reset + active prediction info */}
      <button
        type="button"
        onClick={() => {
          onRainfallChange(DEFAULT_RAINFALL)
          onHorizonChange('now')
        }}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-1.5 text-[11px] text-ink-3 transition-colors duration-200 hover:border-line hover:bg-elevated/60 hover:text-ink-2"
      >
        <RotateCcw className="h-3 w-3" />
        Reset to Default
      </button>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-2">
        <CloudDrizzle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p className="text-[10.5px] leading-relaxed text-ink-3">
          Predicting for{' '}
          <span className="font-mono font-medium text-ink-2">{rainfall} mm/hr</span> ·{' '}
          <span className="font-mono font-medium text-ink-2">
            {HORIZONS.find((h) => h.id === horizon)?.label}
          </span>{' '}
          — effective intensity{' '}
          <span className="font-mono font-medium text-ink-2">
            {effectiveRainfall.toFixed(0)} mm/hr
          </span>
        </p>
      </div>
    </FloatingPanel>
  )
}
