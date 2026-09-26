import { motion } from 'framer-motion'
import { Landmark } from 'lucide-react'
import SectionHeading from '../layout/SectionHeading'
import { wardInfo } from '../../data/wardInfo'
import { EASE_OUT } from '../ui/FloatingPanel'

export function WhyVelachery() {
  return (
    <section className="border-b border-line/60 bg-surface/30">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <SectionHeading
              eyebrow="The Prototype Location"
              title="Why Velachery, Chennai"
              description={wardInfo.selectionReason}
            />
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-elevated/40 p-4">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <div className="text-[12.5px] font-medium text-ink">{wardInfo.wardName}</div>
                <div className="mt-1 font-mono text-[10px] leading-relaxed text-ink-3">
                  {wardInfo.city}, {wardInfo.state} · {wardInfo.catchmentAreaKm2} km² demo
                  catchment · ≈{Math.round(wardInfo.residents / 100000)} lakh residents
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:max-w-xl">
            <div className="mb-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
              Recent flood history
            </div>
            <div className="relative pl-6">
              <div className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
              {wardInfo.floodHistory.map((event, i) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: EASE_OUT }}
                  className="relative pb-5 last:pb-0"
                >
                  <span className="absolute -left-6 top-1 h-[11px] w-[11px] rounded-full border-2 border-bg bg-warning" />
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[13px] font-semibold text-ink">{event.year}</span>
                    <span className="text-[12px] font-medium text-ink-2">{event.event}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{event.impact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
