import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import { EngineReadout } from '../components/home/EngineReadout'
import { Capabilities } from '../components/home/Capabilities'
import { WhyVelachery } from '../components/home/WhyVelachery'
import { ProblemMappingMini } from '../components/home/ProblemMappingMini'
import { drainageNodes } from '../data/drainageNodes'
import { drainagePipes } from '../data/drainagePipes'
import { velacheryRoads } from '../data/velacheryRoads'
import { EASE_OUT } from '../components/ui/FloatingPanel'

const HERO_STATS: [string, string][] = [
  [`${velacheryRoads.length}`, 'road segments'],
  [`${drainageNodes.length}`, 'drainage nodes'],
  [`${drainagePipes.length}`, 'rated pipes'],
  ['0–3 h', 'nowcast horizon'],
]

export default function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden border-b border-line/60">
        <div className="bg-grid-faint absolute inset-0" aria-hidden="true" />
        <svg
          className="pointer-events-none absolute -right-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-[0.16]"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden="true"
        >
          {[60, 95, 130, 165, 200].map((r, i) => (
            <ellipse
              key={r}
              cx="200"
              cy="205"
              rx={r}
              ry={r * 0.82}
              transform={`rotate(${-14 + i * 4} 200 205)`}
              stroke="#242B45"
              strokeWidth="1.4"
            />
          ))}
          <circle cx="205" cy="210" r="3" fill="#22D3EE" />
        </svg>

        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-ink-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              SIH 2026 · PS SIH26085 · MOES / NCMRWF
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
            >
              <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.32em] text-accent">
                DrainCast
              </div>
              <h1 className="mt-3 max-w-xl text-balance text-[32px] font-semibold leading-[1.14] tracking-tight text-ink sm:text-[42px]">
                Urban flood nowcasting by rainfall–drainage–terrain coupling
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: EASE_OUT }}
              className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-ink-2"
            >
              Street-level predictions of waterlogging 0–3 hours ahead — coupling rainfall
              nowcasts, terrain micro-relief and the rated capacity of the stormwater network.
              Everything computed in the browser, running live on Velachery, Chennai.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: EASE_OUT }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[13.5px] font-semibold text-[#06222E] shadow-glow transition-all hover:bg-accent-2 active:scale-[0.98]"
              >
                Launch Live Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-5 py-3 text-[13.5px] font-medium text-ink-2 transition-all hover:border-ink-3/50 hover:text-ink active:scale-[0.98]"
              >
                See How It Works
              </Link>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: EASE_OUT }}
              className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60 sm:grid-cols-4"
            >
              {HERO_STATS.map(([value, label]) => (
                <div key={label} className="bg-surface/80 px-4 py-3">
                  <dt className="font-mono text-[17px] font-semibold tabular-nums text-accent">
                    {value}
                  </dt>
                  <dd className="mt-0.5 text-[11px] text-ink-3">{label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <EngineReadout />
        </div>
      </section>

      <Capabilities />
      <WhyVelachery />
      <ProblemMappingMini />
    </PageShell>
  )
}
