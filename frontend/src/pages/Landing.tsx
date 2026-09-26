import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Logo, LogoMark } from '../components/ui/Logo'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Navbar */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="flex h-16 items-center justify-between px-6 sm:px-10"
      >
        <div className="flex items-center gap-2.5">
          <LogoMark size={24} />
          <Logo />
        </div>
        <a
          href="/dashboard"
          className="group flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink-2 transition-colors duration-200 hover:border-accent/50 hover:text-accent"
        >
          Launch Dashboard
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </motion.header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-start justify-center px-6 sm:px-10 lg:px-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
          className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent"
        >
          SIH 2026 · Problem Statement SIH26085
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: EASE_OUT }}
          className="max-w-4xl font-display text-[34px] font-bold leading-[1.12] tracking-tight text-ink sm:text-[46px] lg:text-[56px]"
        >
          Urban Flood Nowcasting by{' '}
          <span className="relative inline-block">
            Rainfall–Drainage–Terrain
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.7, ease: EASE_OUT }}
              className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-accent/70"
            />
          </span>{' '}
          Coupling
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: EASE_OUT }}
          className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-2"
        >
          Street-level flood risk prediction for Velachery, Chennai using rainfall intensity,
          terrain elevation and stormwater drainage network capacity.
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease: EASE_OUT }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/dashboard"
          className="mt-10 inline-flex items-center gap-2.5 rounded-lg bg-accent px-6 py-3 text-[14px] font-semibold text-[#04121A] shadow-panel transition-colors duration-200 hover:brightness-110"
        >
          Open Interactive Dashboard
          <ArrowRight className="h-4 w-4" />
        </motion.a>
      </main>

      {/* Bottom line */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center justify-between px-6 pb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 sm:px-10 lg:px-24"
      >
        <span>SIH26085&nbsp;&nbsp;|&nbsp;&nbsp;Software Edition&nbsp;&nbsp;|&nbsp;&nbsp;Disaster Management</span>
        <span className="hidden sm:inline">Know which streets will flood before they do.</span>
      </motion.footer>
    </div>
  )
}
