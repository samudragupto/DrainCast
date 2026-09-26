import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Database,
  Globe2,
  Layers,
  Radar,
  Route,
  Smartphone,
} from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SectionHeading from '../components/layout/SectionHeading'
import { EASE_OUT } from '../components/ui/FloatingPanel'
import { drainageNodes } from '../data/drainageNodes'
import { drainagePipes } from '../data/drainagePipes'
import { terrainData } from '../data/terrainData'
import { velacheryRoads } from '../data/velacheryRoads'

const STACK: [string, string, string][] = [
  ['Vite 6 + React 18 + TypeScript', 'Core framework, strict typing throughout', 'src/'],
  ['Tailwind CSS v4', 'Design tokens, dark ops theme, zero UI kit', 'src/index.css'],
  ['Framer Motion', 'Page transitions, panel reveals, micro-interactions', 'components/*'],
  ['Leaflet + React-Leaflet', 'GIS map, risk polylines, terrain overlays', 'components/map'],
  ['Leaflet Routing Machine', 'Flood-aware route rendering via custom offline router', 'SafeRouteLayer'],
  ['Chart.js + react-chartjs-2', 'Rainfall vs drainage load nowcast chart', 'RainfallChartPanel'],
  ['Lucide React + clsx + tailwind-merge', 'Iconography and conditional class handling', 'utils/cn.ts'],
]

const DATA_SOURCES: { icon: typeof Radar; source: string; standIn: string; file: string }[] = [
  {
    icon: Radar,
    source: 'IMD / NCMRWF rainfall nowcast & Doppler radar',
    standIn: 'Interactive intensity slider (5–80 mm/hr) with 0–3 h multipliers',
    file: 'RainfallControlPanel',
  },
  {
    icon: Layers,
    source: 'CartoDEM / LiDAR terrain model',
    standIn: `${terrainData.length} micro-terrain zones with elevation, slope and retention class`,
    file: 'src/data/terrainData.ts',
  },
  {
    icon: Database,
    source: 'GCC stormwater asset register',
    standIn: `${drainageNodes.length} nodes + ${drainagePipes.length} rated pipes (25–95 m³/hr) as a directed graph`,
    file: 'src/data/drainage*.ts',
  },
  {
    icon: Route,
    source: 'OSM / GCC road network',
    standIn: `${velacheryRoads.length} connected Velachery corridors with shared junction vertices`,
    file: 'src/data/velacheryRoads.ts',
  },
]

const PIPELINE = [
  'Rainfall nowcast',
  'Catchment runoff',
  'Terrain retention',
  'Drain capacity',
  'Coupling engine',
  'Risk + depth map',
  'Flood-safe routing',
]

const SCALABILITY = [
  {
    icon: Globe2,
    title: 'Swap simulations for live feeds',
    body: 'Each data module is a typed file — replace terrainData with a CartoDEM service, drainagePipes with the GCC asset API and the slider with an IMD nowcast endpoint. The engine and UI stay untouched.',
  },
  {
    icon: Building2,
    title: 'City-scale by graph, not by brute force',
    body: 'The prediction loop is O(roads) arithmetic and the router is Dijkstra on a sparse graph — a full 10,000-segment city runs comfortably in the browser or behind one cheap edge function.',
  },
  {
    icon: Smartphone,
    title: 'Deployable anywhere',
    body: 'A static build with no backend, no env vars and no API keys — hostable on Vercel, Netlify or Cloudflare Pages, and runnable offline from a laptop for ward-level briefings.',
  },
]

const IMPACT = [
  {
    title: 'For the flood cell',
    body: 'A ranked corridor list 0–3 hours ahead — where to pre-position pumps, which inlets to de-silt first, which stretches to barricade.',
  },
  {
    title: 'For responders',
    body: 'Flood-aware routing means ambulances and relief vehicles get a path that avoids the corridors the model expects to go under.',
  },
  {
    title: 'For residents',
    body: 'Street-level depth expectations turn vague “heavy rain warning” bulletins into a decision: move the vehicle, avoid the underpass, leave early.',
  },
  {
    title: 'For planners',
    body: 'Running the slider from drizzle to cloudburst exposes exactly which pipes are the bottleneck at which intensity — a data case for capital works.',
  },
]

export default function ProjectInfo() {
  return (
    <PageShell>
      {/* Tech stack */}
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="Project Info"
            title="Technology, data and how it scales"
            description="A deliberate constraint: everything runs in the browser. No backend, no API routes, no environment variables — the entire nowcasting stack ships as static files."
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface/70"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line/70 bg-elevated/50 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
                  <th className="px-5 py-3 font-medium">Technology</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Purpose</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Where</th>
                </tr>
              </thead>
              <tbody>
                {STACK.map(([tech, purpose, where]) => (
                  <tr key={tech} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3 text-[12.5px] font-medium text-ink">{tech}</td>
                    <td className="hidden px-5 py-3 text-[12px] text-ink-2 md:table-cell">
                      {purpose}
                    </td>
                    <td className="hidden px-5 py-3 font-mono text-[10.5px] text-ink-3 lg:table-cell">
                      {where}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Data sources */}
      <section className="border-b border-line/60">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading
            eyebrow="Mock Data Information"
            title="Real sources, simulated stand-ins"
            description="Every dataset in the prototype mirrors a real production source. Names, ranges and topology are modelled on published information about Velachery."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {DATA_SOURCES.map((row, i) => (
              <motion.div
                key={row.source}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                className="rounded-xl border border-line bg-surface/60 p-5 transition-colors hover:border-accent/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-elevated text-accent">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <div className="text-[13px] font-semibold text-ink">{row.source}</div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
                  {row.standIn}
                </div>
                <div className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
                  {row.file}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline diagram */}
      <section className="border-b border-line/60 bg-surface/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading eyebrow="Architecture" title="The prediction pipeline" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface/70 p-5"
          >
            {PIPELINE.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className={`rounded-lg border px-3 py-2 font-mono text-[10.5px] ${
                    i === PIPELINE.length - 1
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line bg-elevated/60 text-ink-2'
                  }`}
                >
                  {stage}
                </span>
                {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-3" />}
              </div>
            ))}
          </motion.div>
          <p className="mt-4 max-w-2xl text-[12.5px] leading-relaxed text-ink-2">
            Rainfall is multiplied by the horizon factor, converted to catchment runoff, checked
            against the drain graph, damped by terrain retention and finally resolved to a depth
            per corridor — all inside <span className="font-mono text-[11.5px] text-accent-2">src/utils/floodPredictionEngine.ts</span>,
            roughly 90 lines of explainable arithmetic.
          </p>
        </div>
      </section>

      {/* Scalability + impact */}
      <section className="border-b border-line/60">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading eyebrow="Scalability & Impact" title="From prototype to production" />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {SCALABILITY.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                className="rounded-xl border border-line bg-surface/60 p-5 transition-colors hover:border-accent/30"
              >
                <item.icon className="h-5 w-5 text-accent" />
                <div className="mt-3 text-[13.5px] font-semibold text-ink">{item.title}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{item.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {IMPACT.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: EASE_OUT }}
                className="rounded-xl border border-line bg-elevated/40 p-4"
              >
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent">
                  {item.title}
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Constraints */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-16">
          <SectionHeading eyebrow="Disclaimer" title="Known constraints of this build" />
          <ul className="mt-6 grid max-w-3xl gap-2.5">
            {[
              'All rainfall, terrain and drainage data are simulated for the hackathon prototype — no live feeds are connected.',
              'The runoff model is simplified lumped arithmetic (Q = i·A·C), not a 2D hydraulic simulation with surcharge and backflow.',
              'Basemap tiles load from CARTO/OSM and need internet; every flood layer renders regardless of tile availability.',
              'Routes are computed on the embedded Velachery graph, not a full city street network.',
              'Nothing here should be used for operational or navigational decisions.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
