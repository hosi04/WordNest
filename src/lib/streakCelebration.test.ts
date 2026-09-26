import { describe, expect, it } from 'vitest'
import { shouldCelebrate } from './streakCelebration'

const firstSession = { studiedToday: true, days: 2, hadEarlierReviewToday: false, alreadyCelebratedToday: false }

describe('shouldCelebrate', () => {
  it('celebrates the first session of the day', () => {
    expect(shouldCelebrate(firstSession)).toBe(true)
  })

  it('skips later sessions, even from another device or an older app version', () => {
    expect(shouldCelebrate({ ...firstSession, hadEarlierReviewToday: true })).toBe(false)
  })

  it('shows at most once per day on a device', () => {
    expect(shouldCelebrate({ ...firstSession, alreadyCelebratedToday: true })).toBe(false)
  })

  it('needs a review today', () => {
    expect(shouldCelebrate({ ...firstSession, studiedToday: false })).toBe(false)
    expect(shouldCelebrate({ ...firstSession, days: 0 })).toBe(false)
  })
})
