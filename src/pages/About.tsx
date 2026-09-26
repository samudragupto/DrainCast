import { motion } from 'framer-motion'
import { CheckCircle2, Lightbulb, Target } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SectionHeading from '../components/layout/SectionHeading'
import { EASE_OUT } from '../components/ui/FloatingPanel'
import { wardInfo } from '../data/wardInfo'

const PS_ASKS = [
  'A 0–3 hour street-level urban flood nowcast, not a ward-scale daily forecast.',
  'Coupling of spatial rainfall nowcasts (ultimately Doppler weather radar) with a high-resolution terrain model.',
  'A directed storm-drain graph with hydraulic capacities, including surcharge behaviour.',
  'Forecast water depth through time, exposed through a web GIS.',
  'Flood-aware navigation so citizens and responders avoid corridors before they go under.',
]

const MAPPING: { asks: string; delivers: string }[] = [
  {
    asks: 'Street-level forecast, 0–3 hours ahead',
    delivers:
      'Per-corridor risk and water depth for 20 Velachery segments, recomputed across four nowcast ticks (now, +1h, +2h, +3h).',
  },
  {
    asks: 'Couple rainfall with drainage capacity',
    delivers:
      'Runoff is compared against the rated capacity of each road’s connected trunk node — 14 nodes, 15 pipes, 25–95 m³/hr — with a visible 92% efficiency factor.',
  },
  {
    asks: 'Account for terrain',
    delivers:
      '17 micro-terrain zones classify the catchment from marsh-fringe lows (5.2 m) to ridge shoulders (9.1 m); retention factors decide how much excess stays on the street.',
  },
  {
    asks: 'Forecast depth through time on a web GIS',
    delivers:
      'A Leaflet map where every corridor recolours live with risk, a depth-projection chart, corridor alerts and a 0–3 hour nowcast scrubber.',
  },
  {
    asks: 'Flood-aware navigation',
    delivers:
      'Risk-weighted Dijkstra over the live road graph, rendered through Leaflet Routing Machine with an A/B comparison against the conventional shortest path.',
  },
]

const OBJECTIVES = [
  'Translate rainfall nowcasts into street-level waterlogging risk 0–3 hours before it forms.',
  'Make the drainage network a first-class input — flood risk is a capacity problem, not just a weather problem.',
  'Keep every prediction explainable: each road exposes its runoff, capacity, excess, terrain factor and depth.',
  'Run entirely client-side so the prototype is demonstrable anywhere — including offline presentation rooms.',
]

const INNOVATIONS = [
  {
    title: 'Coupling as transparent arithmetic',
    body: 'No black-box model: Q, Qcap, E and d are printed on every panel, so a judge or a city engineer can audit any prediction in seconds.',
  },
  {
    title: 'The drain graph as a directed system',
    body: 'Manholes, inlets and pipes form a gravity-fed graph converging on a single marsh outfall — which is exactly why Velachery floods the way it does.',
  },
  {
    title: 'Routing against live risk',
    body: 'The A/B route comparison makes the value obvious: the same origin–destination pair, one path clean, the other crossing severe-risk corridors.',
  },
  {
    title: 'Zero-backend by design',
    body: 'The full pipeline — data, engine, routing, GIS — ships as static files. For the hackathon it means instant demos; for production it means the UI is already done.',
  },
]

export default function About() {
  return (
    <PageShell>
      {/* Intro */}
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="About the Project"
            title="A nowcasting layer for the streets that flood first"
            description="DrainCast is a Smart India Hackathon 2026 internal-round prototype for problem statement SIH26085. It demonstrates, end to end, how rainfall nowcasts, terrain micro-relief and stormwater drainage capacity can be coupled into a street-level flood forecast — using Velachery, Chennai as the live test bed."
          />
        </div>
      </section>

      {/* Problem statement mapping */}
      <section className="border-b border-line/60">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="Problem Statement Mapping"
            title="What SIH26085 asks for, and where this prototype answers"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface/70"
          >
            <div className="flex flex-col gap-1 border-b border-line/70 bg-elevated/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-ink-3">
                  SIH 2026 · SOFTWARE EDITION · DISASTER MANAGEMENT
                </div>
                <div className="mt-1 text-[15px] font-semibold text-ink">
                  SIH26085 — Urban Flood Nowcasting by Rainfall–Drainage–Terrain Coupling
                </div>
              </div>
              <span className="w-fit rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-accent">
                Ministry of Earth Sciences / NCMRWF
              </span>
            </div>
            <div className="px-6 py-5">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
                What the problem statement asks for
              </div>
              <ul className="mt-3 grid gap-2.5 md:grid-cols-2">
                {PS_ASKS.map((ask) => (
                  <li key={ask} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
                    {ask}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <div className="mt-6 grid gap-3">
            {MAPPING.map((row, i) => (
              <motion.div
                key={row.asks}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: EASE_OUT }}
                className="grid gap-3 rounded-xl border border-line bg-surface/60 p-5 lg:grid-cols-[1fr_auto_1.4fr] lg:items-center"
              >
                <div className="text-[13px] font-medium text-ink">{row.asks}</div>
                <div className="hidden h-8 w-px bg-line lg:block" />
                <div className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {row.delivers}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objective + innovation */}
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-14 lg:grid-cols-2 lg:py-16">
          <div>
            <SectionHeading eyebrow="Objective" title="What this prototype sets out to prove" />
            <ul className="mt-6 space-y-3">
              {OBJECTIVES.map((objective, i) => (
                <motion.li
                  key={objective}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                  className="flex items-start gap-3"
                >
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-[13px] leading-relaxed text-ink-2">{objective}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow="Innovation" title="Where it differs from a rain overlay" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {INNOVATIONS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                  className="rounded-xl border border-line bg-surface/70 p-4 transition-colors hover:border-accent/30"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    <div className="text-[13px] font-semibold text-ink">{item.title}</div>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Relevance */}
      <section className="border-b border-line/60">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="Relevance"
            title="Why this matters in Chennai, right now"
            description={wardInfo.drainageContext}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {wardInfo.floodHistory.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                className="rounded-xl border border-line bg-surface/60 p-4"
              >
                <div className="font-mono text-[15px] font-semibold text-accent">{event.year}</div>
                <div className="mt-1 text-[12.5px] font-medium text-ink">{event.event}</div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">{event.impact}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mt-8 rounded-xl border border-warning/30 bg-warning/5 p-5"
          >
            <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-warning">
              Honest scope note
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
              This is a frontend prototype for the internal hackathon round. Rainfall, terrain and
              drainage data are realistic simulations embedded in the app — they stand in for IMD /
              NCMRWF nowcasts, CartoDEM elevation and the GCC stormwater asset register. The
              prediction logic, routing engine and GIS experience are the real deliverable; wiring
              live feeds is the next step, not this one.
            </p>
          </motion.div>
        </div>
      </section>
    </PageShell>
  )
}
