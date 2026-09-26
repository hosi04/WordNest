import { useId } from 'react'
import { FLAME_HEIGHT, FLAME_WIDTH, FlameShape } from './brand/Flame'
import { I_CENTER_X, WORDMARK_PATH } from './brand/wordmarkPaths'

interface Props {
  /** `dark` = on a dark background (sidebar): light, ember-tinted letters and a glowing flame. */
  tone?: 'light' | 'dark'
  className?: string
}

// Flame replaces the dot of the "ı": 20 units wide (readable at small sizes), just above the x-height (y = -44.8).
const FLAME_SCALE = 20 / FLAME_WIDTH
const FLAME_X = I_CENTER_X - 10
const FLAME_Y = -50.5 - FLAME_HEIGHT * FLAME_SCALE

/** The "hosi" wordmark. Size it with a height class (e.g. `h-8`); the width follows. */
export function Logo({ tone = 'light', className = 'h-8' }: Props) {
  const id = useId()
  const dark = tone === 'dark'
  return (
    <svg viewBox="0 -82 167 85" overflow="visible" className={`w-auto ${className}`} role="img" aria-label="hosi">
      {dark && (
        <defs>
          <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.1" stopColor="var(--color-mist)" />
            <stop offset="0.55" stopColor="var(--color-page)" />
            <stop offset="1" stopColor="var(--color-ember-cream)" />
          </linearGradient>
        </defs>
      )}
      <path d={WORDMARK_PATH} fill={dark ? `url(#${id}-ink)` : 'var(--color-ink)'} />
      <FlameShape transform={`translate(${FLAME_X} ${FLAME_Y}) scale(${FLAME_SCALE})`} glow={dark} />
    </svg>
  )
}
