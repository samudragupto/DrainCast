import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { EASE_OUT } from '../ui/FloatingPanel'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="flex-1"
    >
      {children}
    </motion.main>
  )
}

export default PageShell
