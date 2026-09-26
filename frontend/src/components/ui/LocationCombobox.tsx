import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { RouteLocation } from '../../types'
import { EASE_OUT } from './FloatingPanel'

interface LocationComboboxProps {
  label: string
  value: string | null
  onChange: (id: string) => void
  items: RouteLocation[]
}

export function LocationCombobox({ label, value, onChange, items }: LocationComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.id === value) ?? null

  const filtered = query
    ? items.filter((i) => `${i.name} ${i.area}`.toLowerCase().includes(query.toLowerCase()))
    : items

  return (
    <div className="relative min-w-0 flex-1">
      <label className="mb-1 block font-mono text-[9px] tracking-[0.16em] text-ink-3">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
        <input
          value={open ? query : (selected?.name ?? '')}
          placeholder="Search Velachery…"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setQuery('')
            setOpen(true)
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 160)}
          className={cn(
            'w-full rounded-lg border border-line bg-elevated/70 py-2 pl-8 pr-2 text-[12.5px] text-ink',
            'placeholder:text-ink-3/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15',
            open && 'border-accent/50 ring-2 ring-accent/15',
          )}
        />
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-line bg-elevated py-1 shadow-raised"
          >
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange(item.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors hover:bg-accent/10',
                    item.id === value && 'bg-accent/10',
                  )}
                >
                  <span className="truncate text-[12px] text-ink">{item.name}</span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-ink-3">
                    {item.category}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
