import { motion } from 'framer-motion'
import { EASE_OUT } from '../ui/FloatingPanel'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{eyebrow}</div>
      <h2 className="mt-2.5 text-balance text-[22px] font-semibold leading-snug tracking-tight text-ink sm:text-[26px]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{description}</p>
      )}
    </motion.div>
  )
}

export default SectionHeading
