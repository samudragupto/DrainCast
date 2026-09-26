import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRightLeft, Navigation, Route as RouteIcon, X } from 'lucide-react'
import { routeLocations } from '../../data/routeLocations'
import { LocationCombobox } from '../ui/LocationCombobox'
import { EASE_OUT } from '../ui/FloatingPanel'
import { fmtKm, fmtMin } from '../../utils/format'
import type { ComputedRoute } from '../../types'

interface RouteFinderPanelProps {
  route: ComputedRoute | null
  onFind: (query: { startId: string; destinationId: string }) => void
  onClear: () => void
}

function ExposureChip({
  tone,
  children,
}: {
  tone: 'safe' | 'warn' | 'rose'
  children: ReactNode
}) {
  const styles = {
    safe: 'border-safe/40 bg-safe/10 text-safe',
    warn: 'border-warning/40 bg-warning/10 text-warning',
    rose: 'border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]',
  } as const
  return (
    <span className={`rounded-md border px-2 py-0.5 font-mono text-[9.5px] ${styles[tone]}`}>
      {children}
    </span>
  )
}

export function RouteFinderPanel({ route, onFind, onClear }: RouteFinderPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [startId, setStartId] = useState('phoenix')
  const [destId, setDestId] = useState('checkpost')

  const swap = () => {
    setStartId(destId)
    setDestId(startId)
  }

  return (
    <div className="pointer-events-auto w-full">
      <AnimatePresence initial={false} mode="wait">
        {!expanded ? (
          <motion.button
            key="pill"
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.25, ease: EASE_OUT }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface/95 px-4 py-2.5 shadow-panel backdrop-blur-md transition-colors hover:border-accent/40"
          >
            <RouteIcon className="h-4 w-4 text-accent" />
            <span className="text-[12.5px] font-medium text-ink">Flood-Safe Route</span>
            {route?.feasible && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[8.5px] text-accent">
                ACTIVE
              </span>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="rounded-xl border border-line bg-surface/95 p-3.5 shadow-raised backdrop-blur-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RouteIcon className="h-4 w-4 text-accent" />
                <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-2">
                  Flood-Safe Route Finder
                </h3>
              </div>
              <button
                type="button"
                aria-label="Collapse route finder"
                onClick={() => setExpanded(false)}
                className="grid h-7 w-7 place-items-center rounded-lg border border-line text-ink-3 transition-colors hover:text-accent"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <LocationCombobox label="START" value={startId} onChange={setStartId} items={routeLocations} />
              <motion.button
                type="button"
                whileTap={{ scale: 0.9, rotate: 180 }}
                aria-label="Swap start and destination"
                onClick={swap}
                className="mb-0.5 grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-accent/40 hover:text-accent"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </motion.button>
              <LocationCombobox label="DESTINATION" value={destId} onChange={setDestId} items={routeLocations} />
            </div>

            <div className="mt-3 flex gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onFind({ startId, destinationId: destId })}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12.5px] font-semibold text-[#06222E] transition-colors hover:bg-accent-2"
              >
                <Navigation className="h-3.5 w-3.5" />
                Find Flood-Aware Route
              </motion.button>
              {route && (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-lg border border-line px-3 py-2.5 text-[12px] text-ink-2 transition-colors hover:border-ink-3/50 hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {route && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-lg border border-line bg-elevated/60 p-3">
                    {route.feasible ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[12px] font-medium text-accent">
                            <Navigation className="h-3.5 w-3.5" />
                            Flood-aware route
                          </span>
                          <span className="font-mono text-[10.5px] tabular-nums text-ink-2">
                            {fmtKm(route.distanceM)} · {fmtMin(route.durationMin)}
                          </span>
                        </div>
                        <div className="mt-1.5 truncate font-mono text-[10px] text-ink-3">
                          via {route.viaRoadNames.join(' → ')}
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <ExposureChip tone={route.exposure.severeCount > 0 ? 'rose' : 'safe'}>
                            {route.exposure.severeCount} severe on route
                          </ExposureChip>
                          <ExposureChip tone={route.exposure.highCount > 0 ? 'warn' : 'safe'}>
                            {route.exposure.highCount} high on route
                          </ExposureChip>
                        </div>

                        {route.conventional && !route.sameAsConventional && (
                          <div className="mt-2.5 border-t border-line/60 pt-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <ExposureChip tone="rose">
                                conventional shortest: {route.conventional.severeCount} severe ·{' '}
                                {route.conventional.highCount} high
                              </ExposureChip>
                              <span className="font-mono text-[9.5px] text-ink-3">
                                {fmtKm(route.conventional.distanceM)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-[10px] text-ink-2">
                              <span className="flex items-center gap-1.5">
                                <span className="h-[3px] w-5 rounded-full bg-accent" />
                                flood-aware
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-0 w-5 border-t-2 border-dashed border-[#F87171]" />
                                conventional
                              </span>
                            </div>
                          </div>
                        )}
                        {route.sameAsConventional && (
                          <p className="mt-2.5 border-t border-line/60 pt-2.5 text-[10.5px] leading-relaxed text-ink-3">
                            The conventional shortest path already avoids every high-risk corridor
                            at this intensity.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11.5px] leading-relaxed text-ink-2">{route.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-[10.5px] italic leading-relaxed text-ink-3">
              This route visualization demonstrates avoiding high-risk and severe-risk flooded
              roads during heavy rainfall.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
