import { describe, expect, it } from 'vitest'
import { daysUntilReview, memoryLevel, normalizeSearch, wordStatus } from './wordStatus'

const reviewed = '2026-09-20T03:00:00Z'

describe('wordStatus', () => {
  it('is new when never reviewed', () => {
    expect(wordStatus({ interval_days: 0, last_reviewed_at: null, due_at: reviewed })).toBe('new')
  })

  it('is mastered from a 21-day interval', () => {
    expect(wordStatus({ interval_days: 20, last_reviewed_at: reviewed, due_at: reviewed })).toBe('learning')
    expect(wordStatus({ interval_days: 21, last_reviewed_at: reviewed, due_at: reviewed })).toBe('mastered')
  })
})

describe('memoryLevel', () => {
  it.each([
    [0, 1],
    [1, 2],
    [2, 2],
    [3, 3],
    [7, 3],
    [8, 4],
    [20, 4],
    [21, 5],
    [90, 5],
  ])('interval %i → level %i', (interval, level) => {
    expect(memoryLevel(interval)).toBe(level)
  })
})

describe('daysUntilReview', () => {
  const now = new Date('2026-09-25T05:00:00Z') // 12:00 in Vietnam
  const at = (due_at: string) => ({ interval_days: 1, last_reviewed_at: reviewed, due_at })

  it('is null for new words', () => {
    expect(daysUntilReview({ interval_days: 0, last_reviewed_at: null, due_at: reviewed }, now)).toBeNull()
  })

  it('is 0 for overdue and same-day cards', () => {
    expect(daysUntilReview(at('2026-09-20T00:00:00Z'), now)).toBe(0)
    expect(daysUntilReview(at('2026-09-25T16:00:00Z'), now)).toBe(0)
  })

  it('uses Vietnam calendar days', () => {
    expect(daysUntilReview(at('2026-09-25T17:30:00Z'), now)).toBe(1)
    expect(daysUntilReview(at('2026-10-07T01:00:00Z'), now)).toBe(12)
  })
})

describe('normalizeSearch', () => {
  it('strips Vietnamese diacritics', () => {
    expect(normalizeSearch('  Ngõ, HẺM ')).toBe('ngo, hem')
    expect(normalizeSearch('Đường')).toBe('duong')
  })
})
