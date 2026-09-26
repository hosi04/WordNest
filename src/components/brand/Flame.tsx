import { useId } from 'react'

// Two-tone flame in a 32 × 44 box: an ember outer flame with a small left flick, and a pale core.
const OUTER =
  'M17 1C19 7 29 13 29 27C29 36 23.5 43 16 43C8.5 43 3 37 3 29.5C3 23.5 5.5 19.5 8.5 16L8 9.5C10.5 11.5 12.4 14 13 17C13 10.5 14.5 5.5 17 1Z'
const CORE = 'M16 20.5C17.6 24.5 23 27.5 23 33.2C23 38.2 19.9 41.6 16 41.6C12.1 41.6 9 38.6 9 34.6C9 30.2 12.4 26.4 16 20.5Z'

export const FLAME_WIDTH = 32
export const FLAME_HEIGHT = 44

/** Flame as an SVG group; place it with `transform`. `glow` adds a soft halo for dark backgrounds. */
export function FlameShape({ transform, glow = false }: { transform?: string; glow?: boolean }) {
  const id = useId()
  return (
    <g transform={transform}>
      <defs>
        <linearGradient id={`${id}-outer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent)" />
          <stop offset="0.65" stopColor="var(--color-logo)" />
          <stop offset="1" stopColor="var(--color-gold)" />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-gold)" />
          <stop offset="1" stopColor="var(--color-gold-soft)" />
        </linearGradient>
        {glow && (
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="var(--color-logo)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--color-logo)" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {glow && <circle cx="16" cy="28" r="30" fill={`url(#${id}-glow)`} />}
      <path d={OUTER} fill={`url(#${id}-outer)`} />
      <path d={CORE} fill={`url(#${id}-core)`} />
    </g>
  )
}
