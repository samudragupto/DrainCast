import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Project' },
  { to: '/project-info', label: 'Project Info' },
]

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-surface/40">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[14px] font-semibold tracking-tight">DrainCast</span>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
            Street-level urban flood nowcasting by rainfall–drainage–terrain coupling.
            Prototype built for the Smart India Hackathon 2026 internal round.
          </p>
        </div>

        <div className="flex gap-14">
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              Prototype
            </div>
            <ul className="mt-3 space-y-2">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[12.5px] text-ink-2 transition-colors hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              Reference
            </div>
            <ul className="mt-3 space-y-2 font-mono text-[11.5px] text-ink-2">
              <li>PS ID — SIH26085</li>
              <li>MoES / NCMRWF</li>
              <li>Software Edition</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-4 text-[11px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono tracking-wide">
            SIH 2026 Software Edition – Demo Prototype
          </span>
          <span>
            Simulated data for demonstration only — not for operational or navigational use.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
