import { cn } from '../../utils/cn'

/** Minimal text wordmark: DRAIN in primary ink, CAST in accent. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={cn('inline-flex select-none items-baseline gap-0.5', compact && 'gap-[1px]')}>
      <span className="font-display text-[15px] font-bold uppercase leading-none tracking-[0.08em] text-ink">
        Drain
      </span>
      <span className="font-display text-[15px] font-bold uppercase leading-none tracking-[0.08em] text-accent">
        Cast
      </span>
    </span>
  )
}

/** Small square glyph used beside the wordmark / as a favicon reference. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="8"
        stroke="var(--border)"
        strokeWidth="1.5"
        fill="var(--surface-2)"
      />
      <path
        d="M16 6.5c3.1 4.1 5.1 6.7 5.1 9.3a5.1 5.1 0 1 1-10.2 0c0-2.6 2-5.2 5.1-9.3z"
        fill="var(--accent)"
      />
      <path
        d="M8.5 24.2c2.5 1.5 5 1.5 7.5 0s5-1.5 7.5 0"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
