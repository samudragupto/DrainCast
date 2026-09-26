import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import SectionHeading from '../layout/SectionHeading'
import { EASE_OUT } from '../ui/FloatingPanel'

const MAPPINGS = [
  'Street-level flood forecast, 0–3 hours ahead → per-corridor risk and water depth across 20 Velachery segments.',
  'Couple rainfall nowcasts with drainage capacity → runoff vs rated pipe capacity, computed at the connected trunk node.',
  'Account for terrain → 17 micro-terrain zones classify retention from marsh-fringe lows to ridge shoulders.',
]

export function ProblemMappingMini() {
  return (
    <section className="border-b border-line/60">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <SectionHeading
          eyebrow="Problem Statement Mapping"
          title="Built against SIH26085"
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface/70"
        >
          <div className="flex flex-col gap-4 border-b border-line/70 bg-elevated/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-ink-3">
                  SMART INDIA HACKATHON 2026 · SOFTWARE EDITION
                </div>
                <div className="mt-0.5 text-[14px] font-semibold text-ink">
                  SIH26085 — Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-accent">
              Ministry of Earth Sciences / NCMRWF
            </span>
          </div>

          <ul className="space-y-3 px-6 py-5">
            {MAPPINGS.map((line) => (
              <li key={line} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {line}
              </li>
            ))}
          </ul>

          <div className="border-t border-line/70 px-6 py-4">
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-[13px] font-medium text-accent transition-colors hover:text-accent-2"
            >
              Read the full problem statement mapping
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
