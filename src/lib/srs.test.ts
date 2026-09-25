import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import { vi } from '../i18n/vi'
import { formatInterval, isRelearning, review, type SrsState } from './srs'

const NOW = Date.parse('2026-09-25T05:00:00Z')
const MIN = 60_000
const DAY = 86_400_000
const fresh: SrsState = { ease: 2.5, interval_days: 0, reps: 0 }
const dueIn = (ms: number) => new Date(NOW + ms).toISOString()

describe('review() on a new card', () => {
  it('Quên: again in 1 minute, ease −0.20', () => {
    expect(review(fresh, 1, NOW)).toEqual({ ease: 2.3, interval_days: 0, reps: 0, due_at: dueIn(MIN) })
  })

  it('Khó: again in 6 minutes, stays new, ease −0.15', () => {
    expect(review(fresh, 2, NOW)).toEqual({ ease: 2.35, interval_days: 0, reps: 0, due_at: dueIn(6 * MIN) })
  })

  it('Nhớ: 1 day, ease unchanged', () => {
    expect(review(fresh, 3, NOW)).toEqual({ ease: 2.5, interval_days: 1, reps: 1, due_at: dueIn(DAY) })
  })

  it('Dễ: 4 days, ease +0.15', () => {
    expect(review(fresh, 4, NOW)).toEqual({ ease: 2.65, interval_days: 4, reps: 1, due_at: dueIn(4 * DAY) })
  })
})

describe('review() on a reviewed card', () => {
  const card: SrsState = { ease: 2.5, interval_days: 10, reps: 3 }

  it('Quên: resets reps and interval', () => {
    expect(review(card, 1, NOW)).toEqual({ ease: 2.3, interval_days: 0, reps: 0, due_at: dueIn(MIN) })
  })

  it('Khó: interval × 1.2', () => {
    expect(review(card, 2, NOW)).toEqual({ ease: 2.35, interval_days: 12, reps: 4, due_at: dueIn(12 * DAY) })
  })

  it('Nhớ: interval × ease', () => {
    expect(review(card, 3, NOW)).toEqual({ ease: 2.5, interval_days: 25, reps: 4, due_at: dueIn(25 * DAY) })
  })

  it('Dễ: interval × new ease × 1.3', () => {
    const r = review(card, 4, NOW)
    expect(r.ease).toBeCloseTo(2.65)
    expect(r.interval_days).toBe(Math.round(10 * 2.65 * 1.3))
    expect(r.reps).toBe(4)
  })

  it('keeps at least 1 day for reviewed cards', () => {
    expect(review({ ease: 1.3, interval_days: 0, reps: 1 }, 2, NOW).interval_days).toBe(1)
  })

  it('never lets ease drop below 1.3', () => {
    expect(review({ ease: 1.35, interval_days: 5, reps: 2 }, 1, NOW).ease).toBe(1.3)
    expect(review({ ease: 1.3, interval_days: 5, reps: 2 }, 2, NOW).ease).toBe(1.3)
  })
})

describe('formatInterval', () => {
  it.each([
    [MIN, '< 1 phút'],
    [6 * MIN, '6 phút'],
    [3 * 60 * MIN, '3 giờ'],
    [DAY, '1 ngày'],
    [4 * DAY, '4 ngày'],
    [75 * DAY, '2,5 tháng'],
    [730 * DAY, '2 năm'],
  ])('%i ms → %s', (ms, label) => {
    expect(formatInterval(dueIn(ms), NOW, vi.interval)).toBe(label)
  })

  it('matches the button labels from review()', () => {
    const labels = ([1, 2, 3, 4] as const).map((r) => formatInterval(review(fresh, r, NOW).due_at, NOW, vi.interval))
    expect(labels).toEqual(['< 1 phút', '6 phút', '1 ngày', '4 ngày'])
  })

  it('formats English with plurals and a decimal point', () => {
    expect(formatInterval(dueIn(DAY), NOW, en.interval)).toBe('1 day')
    expect(formatInterval(dueIn(4 * DAY), NOW, en.interval)).toBe('4 days')
    expect(formatInterval(dueIn(75 * DAY), NOW, en.interval)).toBe('2.5 months')
  })
})

describe('isRelearning', () => {
  it('is true for minute-level steps and false for day intervals', () => {
    expect(isRelearning(dueIn(MIN), NOW)).toBe(true)
    expect(isRelearning(dueIn(6 * MIN), NOW)).toBe(true)
    expect(isRelearning(dueIn(DAY), NOW)).toBe(false)
  })
})
