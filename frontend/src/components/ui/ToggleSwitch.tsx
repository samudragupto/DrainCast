import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[18px] w-[34px] shrink-0 rounded-full border transition-colors duration-200',
        checked ? 'border-accent/60 bg-accent/25' : 'border-line bg-elevated',
      )}
    >
      <motion.span
        animate={{ x: checked ? 16 : 2 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        className={cn(
          'absolute top-1/2 h-[12px] w-[12px] -translate-y-1/2 rounded-full',
          checked ? 'bg-accent' : 'bg-ink-3',
        )}
      />
    </button>
  )
}
