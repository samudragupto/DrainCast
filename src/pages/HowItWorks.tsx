import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CloudRain,
  Droplets,
  Gauge,
  Map as MapIcon,
  Mountain,
  Network,
  Workflow,
} from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SectionHeading from '../components/layout/SectionHeading'
import { RiskBadge } from '../components/ui/RiskBadge'
import { EASE_OUT } from '../components/ui/FloatingPanel'
import { velacheryRoads } from '../data/velacheryRoads'
import { IMPERVIOUSNESS, predictRoad } from '../utils/floodPredictionEngine'
import { fmtInt } from '../utils/format'

const STEPS = [
  {
    icon: CloudRain,
    title: 'Rainfall Nowcast Input',
    body: 'Simulated mm/hr intensity on a 5–80 slider, time-multiplied to project the next three hours of a storm cell.',
    chip: 'i = 5–80 mm/hr',
  },
  {
    icon: Mountain,
    title: 'Terrain & Elevation Analysis',
    body: 'A DEM-style micro-relief model of 17 zones flags the low-lying pockets where runoff converges and ponds.',
    chip: '5.2–9.8 m · 0.3–1.9°',
  },
  {
    icon: Droplets,
    title: 'Surface Runoff Estimation',
    body: 'Impervious urban catchments turn rain into runoff — road length × carriageway width × 0.85.',
    chip: 'Q = i · A · C',
  },
  {
    icon: Network,
    title: 'Drainage as a Directed Graph',
    body: 'Manholes, inlets and junctions wired by rated pipes into one directed graph with a single marsh outfall.',
    chip: '25–95 m³/hr pipes',
  },
  {
    icon: Workflow,
    title: 'Rainfall–Drainage Coupling',
    body: 'Runoff is compared against available capacity at each road’s connected trunk — the moment a pipe surcharges is the moment risk is born.',
    chip: 'E = max(0, Q − Qcap)',
  },
  {
    icon: Gauge,
    title: 'Risk & Water Depth',
    body: 'Retained excess spread over the carriageway yields depth in centimetres, classed into five risk bands per corridor.',
    chip: 'd = E′ / (L·w·0.35)',
  },
  {
    icon: MapIcon,
    title: 'GIS Visualisation & Routing',
    body: 'Risk-coloured corridors on the live map, alerts for flood cells, and Dijkstra routing that avoids what is about to drown.',
    chip: 'risk-weighted A/B',
  },
]

export default function HowItWorks() {
  const example = useMemo(() => {
    const road = velacheryRoads.find((r) => r.id === 'RD-VMW-01') ?? velacheryRoads[0]
    return { road, prediction: predictRoad(road, 50) }
  }, [])

  return (
    <PageShell>
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="Method"
            title="How the coupling works"
            description="Seven steps take a rainfall number from a slider to a street-level flood forecast. Every intermediate value is exposed in the UI — nothing is a black box."
          />
        </div>
      </section>

      {/* Step flow */}
      <section className="border-b border-line/60">
        <div className="mx-auto max-w-[1280px] px-6 py-14 lg:py-16">
          <div className="relative">
            <motion.div
              className="absolute left-0 right-0 top-[21px] hidden h-px origin-left bg-gradient-to-r from-accent/10 via-accent/60 to-accent/10 xl:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <div className="flex gap-4 overflow-x-auto pb-3 xl:overflow-visible">
              {STEPS.map((step, i) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: EASE_OUT }}
                  className="flex w-[218px] shrink-0 flex-col rounded-xl border border-line bg-surface/60 p-4 transition-colors hover:border-accent/30 xl:w-auto xl:flex-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-accent/40 bg-bg font-mono text-[13px] font-semibold text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <step.icon className="h-4 w-4 text-ink-3" />
                  </div>
                  <h3 className="mt-3.5 text-[13px] font-semibold leading-snug tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[11.5px] leading-relaxed text-ink-2">{step.body}</p>
                  <div className="mt-3.5 inline-block w-fit rounded-md border border-line bg-elevated/60 px-2 py-1 font-mono text-[9.5px] text-accent-2">
                    {step.chip}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coupling equation + worked example */}
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-6 py-14 lg:grid-cols-2 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="rounded-2xl border border-line bg-surface/70 p-6"
          >
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              The coupling equation
            </div>
            <div className="mt-4 space-y-3 rounded-xl border border-line/70 bg-bg/60 p-4 font-mono text-[12.5px] leading-relaxed">
              <div>
                <span className="text-ink-3">Q</span> = (i ÷ 1000) · L · w · C
                <span className="ml-2 text-ink-3">{'//'} surface runoff, m³/hr</span>
              </div>
              <div>
                <span className="text-ink-3">Qcap</span> = pipe · inlets · η
                <span className="ml-2 text-ink-3">{'//'} available drain capacity</span>
              </div>
              <div>
                <span className="text-ink-3">E</span> = max(0, Q − Qcap)
                <span className="ml-2 text-ink-3">{'//'} excess water</span>
              </div>
              <div>
                <span className="text-ink-3">d</span> = E · τ ÷ (L · w · 0.35)
                <span className="ml-2 text-ink-3">{'//'} depth, cm — τ = terrain retention</span>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-[12.5px] leading-relaxed text-ink-2">
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                C = {IMPERVIOUSNESS} urban imperviousness; w is carriageway width by road class
                (22 / 18 / 11 m).
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                One stormwater inlet per 140 m of carriageway, η = 92% network efficiency.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                τ — 1.0 low-lying, 0.85 moderately low, 0.70 slightly elevated: flatter ground
                keeps more of the excess on the street.
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="rounded-2xl border border-line bg-surface/70 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
                Worked example — live from the engine
              </div>
              <RiskBadge risk={example.prediction.risk} />
            </div>
            <div className="mt-2 text-[15px] font-semibold text-ink">{example.road.roadName}</div>
            <div className="font-mono text-[10px] text-ink-3">
              50 mm/hr · now · {example.road.roadLengthM} m × 22 m carriageway
            </div>

            <dl className="mt-5 space-y-2.5">
              {[
                ['Catchment area', `${fmtInt(example.prediction.catchmentAreaM2)} m²`],
                ['Surface runoff Q', `${fmtInt(example.prediction.runoffM3Hr)} m³/hr`],
                [
                  `Drain capacity Qcap (${example.prediction.inletCount} inlets)`,
                  `${fmtInt(example.prediction.drainCapacityM3Hr)} m³/hr`,
                ],
                ['Excess E = Q − Qcap', `${fmtInt(example.prediction.excessM3Hr)} m³/hr`],
                [
                  `Retained E′ (terrain ×${example.prediction.terrainFactor.toFixed(2)})`,
                  `${fmtInt(example.prediction.retainedM3Hr)} m³/hr`,
                ],
                ['Water depth d', `${example.prediction.waterDepthCm.toFixed(1)} cm`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-line/50 pb-2.5 last:border-0"
                >
                  <dt className="text-[12px] text-ink-2">{label}</dt>
                  <dd className="shrink-0 font-mono text-[12px] tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-lg border border-line/70 bg-elevated/40 p-3 text-[12px] leading-relaxed text-ink-2">
              {example.prediction.reason}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="max-w-lg text-balance text-[22px] font-semibold tracking-tight text-ink">
            See the coupling respond to every millimetre of rain
          </h2>
          <p className="max-w-md text-[13px] leading-relaxed text-ink-2">
            Drag the intensity slider, scrub the 0–3 hour timeline, click any corridor — the map,
            chart and alerts recompute instantly.
          </p>
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[13.5px] font-semibold text-[#06222E] shadow-glow transition-all hover:bg-accent-2 active:scale-[0.98]"
          >
            Launch Live Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
