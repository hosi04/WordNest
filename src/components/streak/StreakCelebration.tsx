import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n/I18nContext'
import { currentProgress, isMilestone, milestoneProgress } from '../../lib/streakMilestones'

// Timeline from the design (docs: wordnest-streak-demo.html). Only transform/opacity animate.
const SPRING = 'cubic-bezier(.34, 1.56, .64, 1)'
const GLIDE = 'cubic-bezier(.2, .8, .2, 1)'
const CLOSE_EASE = 'cubic-bezier(.4, 0, 1, 1)'
const STUDY_KEYS = [' ', '1', '2', '3', '4']
const SPARK_FILLS = ['var(--color-gold)', 'var(--color-accent)', 'var(--color-logo)', 'var(--color-gold)']
const FLAME_PATH =
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'

interface Spark {
  x: number
  y: number
  rotate: number
  delay: number
  star: boolean
  fill: string
}

function makeSparks(count: number, milestone: boolean): Spark[] {
  const [min, max] = milestone ? [90, 160] : [70, 110]
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12)
    const dist = min + (((i * 37) % 10) / 10) * (max - min)
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: (i % 2 ? 1 : -1) * (90 + ((i * 23) % 120)),
      delay: (i % 4) * 25,
      star: i % 3 !== 0,
      fill: SPARK_FILLS[i % SPARK_FILLS.length],
    }
  })
}

interface Props {
  /** Streak before today's first session; omit to just show the current streak (no count-up). */
  from?: number
  to: number
  /** Only for showing the current streak: picks the "keep it up" vs "don't lose it" line. */
  studiedToday?: boolean
  onClose: () => void
}

/**
 * Full-screen streak celebration: counts n → n + 1 after the first session of the day, or just
 * shows the current streak (from the sidebar). Stays until the user clicks/taps anywhere, presses
 * Esc, or presses a study key (Space, 1–4) — those keys still reach the study screen.
 */
export function StreakCelebration({ from, to, studiedToday = true, onClose }: Props) {
  const { t } = useI18n()
  const c = t.celebration
  const gradientId = useId()
  const [announcement, setAnnouncement] = useState('')

  const overlay = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const medal = useRef<HTMLDivElement>(null)
  const flame = useRef<SVGSVGElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const halo = useRef<HTMLDivElement>(null)
  const sparksBox = useRef<HTMLDivElement>(null)
  const badge = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLDivElement>(null)
  const oldNum = useRef<HTMLSpanElement>(null)
  const newNum = useRef<HTMLSpanElement>(null)
  const title = useRef<HTMLParagraphElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLParagraphElement>(null)
  const closing = useRef(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [touch] = useState(() => window.matchMedia('(hover: none)').matches)

  const counting = from !== undefined
  const milestone = to > 0 && isMilestone(to)
  const fresh = from === 0
  const progress = counting ? milestoneProgress(from, to) : currentProgress(to)
  // Without the count-up, everything after it happens 400 ms sooner.
  const shift = counting ? 0 : -400
  const sparks = useMemo(() => makeSparks(milestone ? 24 : 12, milestone), [milestone])
  const [badgeText, milestoneSub] = milestone ? c.milestone(to) : ['', '']

  function close() {
    if (closing.current || !overlay.current) return
    closing.current = true
    const duration = reducedMotion ? 200 : 250
    const opacity = getComputedStyle(overlay.current).opacity
    const out = overlay.current.animate([{ opacity }, { opacity: 0 }], {
      duration,
      easing: CLOSE_EASE,
      fill: 'forwards',
    })
    if (!reducedMotion) {
      card.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.96)' }], {
        duration,
        easing: CLOSE_EASE,
        fill: 'forwards',
      })
    }
    out.onfinish = onClose
  }

  useEffect(() => {
    const run = (el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) =>
      el?.animate(frames, { fill: 'both', ...options })

    const announce = window.setTimeout(() => setAnnouncement(fresh ? c.liveStart : c.live(to)), 60)
    const at = (ms: number) => ms + shift

    if (reducedMotion) {
      run(overlay.current, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: 'ease-out',
      })
    } else {
      // 1. Appear
      run(overlay.current, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: 'ease-out',
      })
      run(
        card.current,
        [
          { opacity: 0, transform: 'translateY(16px) scale(.92)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 380, easing: 'cubic-bezier(.2, .9, .3, 1.2)' },
      )
      run(
        medal.current,
        [{ transform: 'scale(.6)' }, { transform: 'scale(1.12)', offset: 0.6 }, { transform: 'scale(1)' }],
        {
          delay: 250,
          duration: 450,
          easing: SPRING,
        },
      )

      // 2. Count n → n+1 (celebration only), then the "level up" bounce
      if (counting) {
        run(
          oldNum.current,
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-100%)', opacity: 0 },
          ],
          {
            delay: 700,
            duration: 400,
            easing: GLIDE,
          },
        )
        run(
          newNum.current,
          [
            { transform: 'translateY(100%)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ],
          {
            delay: 700,
            duration: 400,
            easing: GLIDE,
          },
        )
      }
      run(
        num.current,
        [{ transform: 'scale(1)' }, { transform: 'scale(1.15)', offset: 0.4 }, { transform: 'scale(1)' }],
        {
          delay: at(1100),
          duration: 250,
          easing: 'ease-out',
        },
      )
      for (const [el, delay] of [
        [title.current, 950],
        [sub.current, 1050],
      ] as const) {
        run(
          el,
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            delay: at(delay),
            duration: 350,
            easing: 'ease-out',
          },
        )
      }
      run(hint.current, [{ opacity: 0 }, { opacity: 1 }], {
        delay: at(1500),
        duration: 300,
        easing: 'ease-out',
      })
      run(fill.current, [{ transform: `scaleX(${progress.from})` }, { transform: `scaleX(${progress.to})` }], {
        delay: at(1200),
        duration: 600,
        easing: GLIDE,
      })

      sparksBox.current?.querySelectorAll('svg').forEach((el, i) => {
        const s = sparks[i]
        run(
          el,
          [
            { opacity: 0, transform: 'translate(0, 0) scale(1) rotate(0deg)' },
            {
              opacity: 1,
              transform: 'translate(0, 0) scale(1) rotate(0deg)',
              offset: 0.06,
            },
            {
              opacity: 0,
              transform: `translate(${s.x}px, ${s.y}px) scale(.4) rotate(${s.rotate}deg)`,
            },
          ],
          {
            delay: at(1080) + s.delay,
            duration: 650,
            easing: 'cubic-bezier(.1, .7, .3, 1)',
          },
        )
      })

      if (milestone) {
        run(
          ring.current,
          [
            { opacity: 0, transform: 'scale(.7)' },
            { opacity: 0.9, transform: 'scale(.75)', offset: 0.05 },
            { opacity: 0, transform: 'scale(2.2)' },
          ],
          { delay: at(1080), duration: 700, easing: 'ease-out' },
        )
        run(
          badge.current,
          [
            { opacity: 0, transform: 'translateY(-6px) scale(.9)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ],
          { delay: at(1150), duration: 300, easing: SPRING },
        )
        run(halo.current, [{ opacity: 0 }, { opacity: 1 }], {
          delay: at(1100),
          duration: 400,
          easing: 'ease-out',
        })
        halo.current?.animate([{ rotate: '0deg' }, { rotate: '360deg' }], {
          duration: 6000,
          iterations: Infinity,
          easing: 'linear',
        })
      }

      // 3. Hold: the flame flickers until the overlay is closed
      run(
        flame.current,
        [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.04, 1.08)' }, { transform: 'scale(1, 1)' }],
        {
          delay: at(1300),
          duration: 600,
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      )
    }

    // 4. Close on Esc or a study key; the key is not swallowed, so studying continues.
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || STUDY_KEYS.includes(e.key)) close()
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(announce)
      document.removeEventListener('keydown', onKey, true)
    }
    // Plays once on mount; a new celebration mounts a new component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const caption = progress.reached
    ? c.nextMilestone(progress.target)
    : c.daysLeft(progress.target - to, progress.target)

  return createPortal(
    <>
      <div
        ref={overlay}
        aria-hidden
        onClick={close}
        className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-ink/40 p-4 [-webkit-tap-highlight-color:transparent]"
      >
        <div
          ref={card}
          className="relative w-full max-w-[360px] rounded-flashcard border border-line bg-card px-6 pt-8 pb-[22px] text-center shadow-[0_24px_60px_rgb(30_42_58/0.22)] will-change-transform md:w-[400px] md:max-w-none md:px-9 md:pt-10 md:pb-[26px]"
        >
          <div ref={medal} className="relative mx-auto grid size-[88px] place-items-center rounded-full bg-gold-soft">
            {milestone && (
              <div
                ref={halo}
                className="pointer-events-none absolute -inset-[9px] rounded-full border-2 border-dashed border-gold opacity-0"
              />
            )}
            {milestone && (
              <div
                ref={ring}
                className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-gold opacity-0"
              />
            )}
            <div ref={sparksBox} className="absolute top-1/2 left-1/2 z-[1] size-0">
              {sparks.map((s, i) => (
                <svg key={i} viewBox="0 0 10 10" className="absolute -top-1.5 -left-1.5 size-3 opacity-0">
                  {s.star ? (
                    <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8Z" fill={s.fill} />
                  ) : (
                    <circle cx="5" cy="5" r="3.5" fill={s.fill} />
                  )}
                </svg>
              ))}
            </div>
            <svg ref={flame} viewBox="0 0 24 24" className="relative z-[2] size-[46px] origin-[50%_85%]">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-gold)" />
                  <stop offset="1" stopColor="var(--color-logo)" />
                </linearGradient>
              </defs>
              <path
                d={FLAME_PATH}
                fill={`url(#${gradientId})`}
                stroke="var(--color-accent)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {milestone && (
            <div
              ref={badge}
              className="mx-auto mt-4 w-max rounded-full border border-gold/60 bg-gold-soft px-3 py-1 text-[13px] font-bold text-gold-ink"
            >
              {badgeText}
            </div>
          )}

          <div
            ref={num}
            className="mt-2.5 inline-grid h-[1.05em] overflow-hidden font-display text-[76px] leading-[1.05] font-semibold text-accent tabular-nums md:text-[92px]"
          >
            {counting && (
              <span
                ref={oldNum}
                className="[grid-area:1/1]"
                style={reducedMotion ? { visibility: 'hidden' } : undefined}
              >
                {from}
              </span>
            )}
            <span ref={newNum} className="[grid-area:1/1]">
              {to}
            </span>
          </div>
          <p ref={title} className="mt-2 font-display text-[26px] leading-tight font-semibold">
            {fresh ? c.startTitle : to === 0 ? c.noStreakTitle : c.title(to)}
          </p>
          <p ref={sub} className="mx-auto mt-2 max-w-[34ch] text-[15px] text-balance text-ink-muted">
            {fresh
              ? c.startSub
              : to === 0
                ? c.noStreakSub
                : milestone
                  ? milestoneSub
                  : studiedToday
                    ? c.sub(to)
                    : c.notYetToday}
          </p>

          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-soft">
              <div
                ref={fill}
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-gold to-accent"
                style={{ transform: `scaleX(${progress.to})` }}
              />
            </div>
            <p className="mt-2 text-[13px] text-ink-muted">{caption}</p>
          </div>
          <p ref={hint} className="mt-3.5 text-xs text-ink-muted">
            {touch ? c.hintTouch : c.hintMouse}
          </p>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </>,
    document.body,
  )
}
