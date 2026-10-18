import { describe, expect, it } from 'vitest'
import { addDays, toDayKey } from './date'

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

