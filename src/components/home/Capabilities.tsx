import { motion } from 'framer-motion'
import { GitBranch, MapPinned, Route, Timer } from 'lucide-react'
import SectionHeading from '../layout/SectionHeading'
import { EASE_OUT } from '../ui/FloatingPanel'

const CAPABILITIES = [
  {
    icon: MapPinned,
    title: 'Street-Level Prediction',
    body: 'Risk resolved to individual road corridors — not wards or grids — with expected water depth in centimetres for every segment.',
    chip: '20 segments · Velachery',
  },
  {
    icon: GitBranch,
    title: 'Drainage-Aware Logic',
    body: 'A directed graph of manholes, inlets and rated pipes. Rain only becomes flood risk when runoff exceeds the drain capacity it meets.',
    chip: '14 nodes · 15 pipes · 25–95 m³/hr',
  },
  {
    icon: Timer,
    title: '0–3 Hour Nowcasting',
    body: 'Time-multiplied rainfall projections surface waterlogging three hours before it forms — while there is still time to move pumps and people.',
    chip: '+1.15× → +1.45× intensity',
  },
  {
    icon: Route,
    title: 'Flood-Safe Routing',
    body: 'Dijkstra over the live risk graph detours around corridors that are about to go under, and shows what the conventional route would have crossed.',
    chip: 'risk-weighted · A/B compare',
  },
]

export function Capabilities() {
  return (
    <section className="border-b border-line/60">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <SectionHeading
          eyebrow="Key Capabilities"
          title="Everything a flood cell needs, in one screen"
          description="DrainCast treats rainfall, terrain and drainage as one coupled system — the same way a city hydrologist does, just faster and street by street."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.article
              key={cap.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
              className="group flex flex-col rounded-xl border border-line bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-elevated text-accent transition-colors group-hover:border-accent/40">
                <cap.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[14.5px] font-semibold tracking-tight text-ink">
                {cap.title}
              </h3>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-2">{cap.body}</p>
              <div className="mt-4 border-t border-line/70 pt-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
                {cap.chip}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
