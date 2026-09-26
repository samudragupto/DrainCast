import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  const layoutId = useId()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-elevated/70 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <motion.button
            key={option.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex-1 rounded-md font-medium transition-colors',
              size === 'md' ? 'px-2 py-1.5 text-[12px]' : 'px-2 py-1 text-[11px]',
              active ? 'text-accent' : 'text-ink-2 hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md border border-accent/30 bg-accent/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
