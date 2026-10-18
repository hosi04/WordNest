import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak'

const today = '2026-10-18'

describe('computeStreak', () => {
  it('is 0 with no study days', () => {
    expect(computeStreak([], today)).toEqual({ days: 0, frozen: false, studiedToday: false, thawedToday: false })
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-10-16', '2026-10-17', '2026-10-18'], today)).toMatchObject({
      days: 3,
      frozen: false,
      studiedToday: true,
    })
  })

  it('is not frozen yet before studying today when yesterday was a study day', () => {
    expect(computeStreak(['2026-10-16', '2026-10-17'], today)).toMatchObject({ days: 2, frozen: false, studiedToday: false })
  })

  it('freezes after a whole day without study, keeping the length', () => {
    // Lùn: studied 15 and 16, missed 17 → 2 days, frozen on the 18th
    expect(computeStreak(['2026-10-15', '2026-10-16'], today)).toEqual({
      days: 2,
      frozen: true,
      studiedToday: false,
      thawedToday: false,
    })
    expect(computeStreak(['2026-09-01'], today)).toMatchObject({ days: 1, frozen: true })
  })

  it('thaws without adding a day, then grows again', () => {
    expect(computeStreak(['2026-10-15', '2026-10-16', '2026-10-18'], today)).toEqual({
      days: 2,
      frozen: false,
      studiedToday: true,
      thawedToday: true,
    })
    expect(computeStreak(['2026-10-15', '2026-10-16', '2026-10-18', '2026-10-19'], '2026-10-19')).toMatchObject({
      days: 3,
      thawedToday: false,
    })
  })

  it('counts every gap once, however long', () => {
    // 3 days, gap, thaw (+0), +1, long gap, thaw (+0) → 4
    const days = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-10', '2026-09-11', '2026-10-18']
    expect(computeStreak(days, today)).toMatchObject({ days: 4, thawedToday: true })
  })

  it('ignores duplicates, order and future days', () => {
    expect(computeStreak(['2026-10-17', '2026-10-16', '2026-10-17', '2026-10-20'], today)).toMatchObject({ days: 2 })
  })
})
