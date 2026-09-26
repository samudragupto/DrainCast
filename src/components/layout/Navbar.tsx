import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { cn } from '../../utils/cn'
import { EASE_OUT } from '../ui/FloatingPanel'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Project' },
  { to: '/project-info', label: 'Project Info' },
]

function StatusChip() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  )

  useEffect(() => {
    const id = window.setInterval(
      () =>
        setTime(
          new Date().toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        ),
      30000,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface/80 px-3 py-1.5 lg:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
      </span>
      <span className="font-mono text-[10px] tracking-wide text-ink-2">
        Demo Mode • Velachery, Chennai
      </span>
      <span className="h-3 w-px bg-line" />
      <span className="font-mono text-[10px] tabular-nums text-ink-3">{time} IST</span>
    </div>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      className="sticky top-0 z-[900] border-b border-line/70 bg-bg/85 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <Logo />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
              DrainCast
            </span>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-ink-3">
              Urban Flood Nowcasting
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                  isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <StatusChip />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:text-accent md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="overflow-hidden border-t border-line/60 bg-surface/95 md:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-[13.5px] transition-colors',
                      isActive ? 'bg-accent/10 text-accent' : 'text-ink-2 hover:text-ink',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="px-3 pb-3 pt-2 font-mono text-[10px] text-ink-3">
                Demo Mode • Velachery, Chennai
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
