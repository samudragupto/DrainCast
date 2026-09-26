import { MapPin } from 'lucide-react'
import { useClock } from '../../hooks/useClock'
import { Logo, LogoMark } from '../ui/Logo'
import { ThemeToggle } from '../theme/ThemeToggle'

export function TopBar() {
  const { time, date } = useClock()

  return (
    <header className="z-[800] flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-5">
      <a href="/" className="flex items-center gap-2.5" aria-label="DrainCast home">
        <LogoMark size={24} />
        <Logo />
      </a>

      <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

      <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="truncate text-[12.5px] text-ink-2">
          Velachery <span className="text-ink-3">•</span> Chennai, Tamil Nadu
        </span>
      </div>

      <span className="ml-1 hidden rounded-md border border-line bg-elevated px-2 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-3 md:inline-block">
        Demo Prototype
      </span>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="tabular font-mono text-[12.5px] font-medium leading-tight text-ink">
            {time} <span className="text-ink-3">IST</span>
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
            {date}
          </div>
        </div>
        <div className="h-5 w-px bg-line" />
        <ThemeToggle />
      </div>
    </header>
  )
}
