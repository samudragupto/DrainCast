import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface FloatingPanelProps {
  title: string
  icon?: ReactNode
  badge?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  delay?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function FloatingPanel({
  title,
  icon,
  badge,
  footer,
  children,
  className,
  bodyClassName,
  delay = 0,
  collapsible = true,
  defaultCollapsed = false,
}: FloatingPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: EASE_OUT }}
      className={cn(
        'pointer-events-auto overflow-hidden rounded-xl border border-line bg-surface/95 shadow-panel backdrop-blur-md',
        className,
      )}
    >
      <header
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
        className={cn(
          'flex items-center justify-between gap-2 border-b border-line/60 px-3.5 py-2.5',
          collapsible && 'cursor-pointer select-none',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          <h3 className="truncate font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {collapsible && (
            <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
            </motion.span>
          )}
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className={cn('px-3.5 py-3', bodyClassName)}>{children}</div>
            {footer && (
              <div className="border-t border-line/60 px-3.5 py-2 font-mono text-[9.5px] leading-relaxed text-ink-3">
                {footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
