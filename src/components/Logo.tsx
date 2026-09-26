import { useId } from 'react'
import { FLAME_HEIGHT, FLAME_WIDTH, FlameShape } from './brand/Flame'
import { I_CENTER_X, WORDMARK_PATH } from './brand/wordmarkPaths'

export const TAGLINE = 'Learn English with Hosi'

interface Props {
  /** `dark` = on a dark background (sidebar): light, ember-tinted letters and a glowing flame. */
  tone?: 'light' | 'dark'
  /** Height class of the wordmark, e.g. `h-8`; the width follows. */
  size?: string
  /** Show the "Learn English with Hosi" line under the wordmark. */
  tagline?: boolean
  align?: 'start' | 'center'
  /** Layout classes for the whole logo (margins…). */
  className?: string
}

// Flame replaces the dot of the "ı": 20 units wide (readable at small sizes), just above the x-height (y = -44.8).
const FLAME_SCALE = 20 / FLAME_WIDTH
const FLAME_X = I_CENTER_X - 10
const FLAME_Y = -50.5 - FLAME_HEIGHT * FLAME_SCALE

/** The "Hosi" wordmark, optionally with its tagline underneath. */
export function Logo({ tone = 'light', size = 'h-8', tagline = false, align = 'start', className = '' }: Props) {
  const id = useId()
  const dark = tone === 'dark'
  const wordmark = (
    <svg
      viewBox="0 -82 190 85"
      overflow="visible"
      className={`w-auto ${size}`}
      role="img"
      aria-label={tagline ? `Hosi, ${TAGLINE}` : 'Hosi'}
    >
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

  if (!tagline) return <span className={`inline-flex ${className}`}>{wordmark}</span>
  return (
    <span className={`flex flex-col gap-1.5 ${align === 'center' ? 'items-center' : 'items-start'} ${className}`}>
      {wordmark}
      <span
        aria-hidden
        className={`text-[13px] leading-none font-medium tracking-wide whitespace-nowrap ${dark ? 'text-white/60' : 'text-ink-muted'}`}
      >
        {TAGLINE}
      </span>
    </span>
  )
}
