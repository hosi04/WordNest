import { describe, expect, it } from 'vitest'
import { message, validTargets } from './reminder.js'

const DAY = 86_400_000
// 2026-09-26 12:00 UTC (19:00 in Vietnam) and the following days, to walk through the rotation.
const day = (n: number) => Date.UTC(2026, 8, 26, 12) + n * DAY

describe('reminder message', () => {
  it('puts the display name in the title, with a fallback', () => {
    expect(message({ name: 'Thanh', now: day(0) }).title).toContain('Thanh')
    expect(message({ lang: 'en', name: 'Thanh', now: day(0) }).title).toContain('Thanh')
    expect(message({ name: '   ', now: day(0) }).title).toContain('Bạn')
    expect(message({ lang: 'en', now: day(0) }).title).toContain('there')
  })

  it('talks about the streak at risk when there is one', () => {
    const bodies = [0, 1, 2, 3].map((n) => message({ streak: 12, hour: 19, now: day(n) }).body)
    expect(bodies.every((b) => b.includes('12 ngày'))).toBe(true)
    expect(new Set(bodies).size).toBe(4) // a different line each day
    expect(bodies.some((b) => b.startsWith('Đã 19h rồi!'))).toBe(true)
  })

  it('invites to start a streak when there is none', () => {
    const bodies = [0, 1, 2].map((n) => message({ streak: 0, hour: 21, now: day(n) }).body)
    expect(bodies.some((b) => b.includes('bắt đầu một chuỗi'))).toBe(true)
    expect(bodies.some((b) => b.includes('Đã 21h rồi!'))).toBe(true)
    expect(bodies.every((b) => !b.includes('0 ngày'))).toBe(true)
  })

  it('uses a 12-hour clock in English', () => {
    const bodies = [0, 1, 2, 3].map((n) => message({ lang: 'en', streak: 3, hour: 19, now: day(n) }).body)
    expect(bodies.some((b) => b.startsWith("It's 7 PM!"))).toBe(true)
    expect(bodies.every((b) => b.includes('3-day streak'))).toBe(true)
  })

  it('always opens the flashcards, and falls back to generic wording for a bad hour', () => {
    expect(message({ now: day(0) }).url).toBe('/study')
    const bodies = [0, 1, 2, 3].map((n) => message({ streak: 5, hour: 99, now: day(n) }).body)
    expect(bodies.some((b) => b.startsWith('Đến giờ học rồi!'))).toBe(true)
  })
})

describe('validTargets', () => {
  it('keeps only well-formed https push targets', () => {
    const good = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', p256dh: 'p', auth: 'a' }
    expect(validTargets([good, { endpoint: 'http://x', p256dh: 'p', auth: 'a' }, { endpoint: 'https://y' }, null, 3])).toEqual([
      good,
    ])
    expect(validTargets('nope')).toEqual([])
  })
})
