import { describe, expect, it } from 'vitest'
import { en } from './en'
import { vi } from './vi'

/** Every key path in a messages object, e.g. "dashboard.review.start". */
function keyPaths(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? keyPaths(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('messages', () => {
  it('English has exactly the same keys as Vietnamese', () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(vi).sort())
  })

  it('formats dates in each language', () => {
    expect(vi.date.long('2026-09-25')).toBe('Thứ Sáu, 25 tháng 9')
    expect(vi.date.weekdayShort('2026-09-27')).toBe('CN')
    expect(en.date.long('2026-09-25')).toBe('Friday, September 25')
    expect(en.date.weekdayShort('2026-09-25')).toBe('Fri')
  })

  it('pluralizes English and formats next-review days', () => {
    expect(en.words.summary(1, 0)).toBe('1 word saved · 0 mastered')
    expect(en.words.summary(15, 2)).toBe('15 words saved · 2 mastered')
    expect(en.words.nextReview(null)).toBe('—')
    expect(en.words.nextReview(1)).toBe('Tomorrow')
    expect(vi.words.nextReview(0)).toBe('Hôm nay')
    expect(vi.words.nextReview(12)).toBe('12 ngày nữa')
  })

  it('uses sentence case for the back-to-overview button', () => {
    expect(vi.common.backToOverview).toBe('Về trang tổng quan')
  })
})
