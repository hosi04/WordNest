import { describe, expect, it } from 'vitest'
import { addDays, computeStreak, toDayKey } from './date'

describe('toDayKey', () => {
  it('uses Vietnam time (UTC+7)', () => {
    expect(toDayKey('2026-09-25T16:59:00Z')).toBe('2026-09-25')
    expect(toDayKey('2026-09-25T17:00:00Z')).toBe('2026-09-26')
  })
})

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('computeStreak', () => {
  const today = '2026-09-25'

  it('is 0 with no study days', () => {
    expect(computeStreak([], today)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-09-25', '2026-09-24', '2026-09-23'], today)).toBe(3)
  })

  it('keeps yesterday’s streak alive before studying today', () => {
    expect(computeStreak(['2026-09-24', '2026-09-23'], today)).toBe(2)
  })

  it('resets after a missed day', () => {
    expect(computeStreak(['2026-09-23', '2026-09-22'], today)).toBe(0)
    expect(computeStreak(['2026-09-25', '2026-09-23'], today)).toBe(1)
  })
})
