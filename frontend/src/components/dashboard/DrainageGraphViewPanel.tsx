import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { drainageNodeById, drainageNodes } from '../../data/drainageNodes'
import { drainagePipes } from '../../data/drainagePipes'
import { ToggleSwitch } from '../ui/ToggleSwitch'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MAX_CAPACITY = Math.max(...drainagePipes.map((p) => p.capacityM3Hr))

export function DrainageGraphViewPanel({
  open,
  onClose,
  visualize,
  onToggleVisualize,
}: {
  open: boolean
  onClose: () => void
  visualize: boolean
  onToggleVisualize: (show: boolean) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[900] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] sm:p-8"
        >
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-panel"
            aria-label="Drainage Network Graph View"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="font-display text-[15px] font-semibold tracking-tight text-ink">
                  Drainage Network Graph View
                </h2>
                <p className="mt-0.5 text-[10.5px] text-ink-3">
                  Manholes and inlets are represented as{' '}
                  <span className="text-ink-2">NODES</span>. Underground pipes are represented as{' '}
                  <span className="text-ink-2">DIRECTED EDGES</span> with carrying capacity.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close graph view"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-3 transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="flex items-center justify-between gap-3 border-b border-line bg-elevated/40 px-4 py-2.5">
              <span className="text-[11.5px] text-ink-2">Visualize graph on map</span>
              <ToggleSwitch
                checked={visualize}
                onChange={onToggleVisualize}
                label="Visualize drainage graph on map"
              />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
              {/* Nodes */}
              <div>
                <h3 className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
                  Nodes · {drainageNodes.length}
                </h3>
                <ul className="space-y-1">
                  {drainageNodes.map((node) => (
                    <li
                      key={node.id}
                      className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-1.5"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="w-[74px] shrink-0 truncate font-mono text-[10px] font-semibold text-ink">
                        {node.id}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-2">
                        {node.nodeName}
                      </span>
                      <span className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wide text-ink-3">
                        {node.type}
                      </span>
                      <span className="tabular shrink-0 font-mono text-[10px] text-ink-2">
                        {node.elevationM.toFixed(1)} m
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pipes */}
              <div>
                <h3 className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
                  Directed Pipes · {drainagePipes.length}
                </h3>
                <ul className="space-y-1">
                  {drainagePipes.map((pipe) => {
                    const from = drainageNodeById.get(pipe.from)
                    const to = drainageNodeById.get(pipe.to)
                    return (
                      <li
                        key={pipe.id}
                        className="rounded-lg border border-line/70 bg-elevated/40 px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 font-mono text-[10px] font-semibold text-ink">
                            {pipe.id}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-ink-3">
                            {from?.nodeName ?? pipe.from} → {to?.nodeName ?? pipe.to}
                          </span>
                          <span className="tabular shrink-0 font-mono text-[10px] font-medium text-accent">
                            {pipe.capacityM3Hr} m³/hr
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-accent/70"
                            style={{ width: `${(pipe.capacityM3Hr / MAX_CAPACITY) * 100}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
