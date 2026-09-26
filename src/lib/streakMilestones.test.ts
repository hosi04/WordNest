import { describe, expect, it } from 'vitest'
import { currentProgress, isMilestone, milestoneProgress, nextMilestone, prevMilestone } from './streakMilestones'

describe('streak milestones', () => {
  it('recognizes 7, 30, 100, 365 and every year after', () => {
    expect([7, 30, 100, 365, 730, 1095].every(isMilestone)).toBe(true)
    expect([1, 6, 8, 29, 99, 364, 366, 500].some(isMilestone)).toBe(false)
  })

  it('finds the surrounding milestones', () => {
    expect(nextMilestone(0)).toBe(7)
    expect(nextMilestone(7)).toBe(30)
    expect(nextMilestone(364)).toBe(365)
    expect(nextMilestone(365)).toBe(730)
    expect(prevMilestone(0)).toBe(0)
    expect(prevMilestone(12)).toBe(7)
    expect(prevMilestone(400)).toBe(365)
  })

  it('fills the bar towards the next milestone', () => {
    expect(milestoneProgress(12, 13)).toEqual({ from: 5 / 23, to: 6 / 23, reached: false, target: 30 })
    expect(milestoneProgress(0, 1)).toEqual({ from: 0, to: 1 / 7, reached: false, target: 7 })
  })

  it('fills the bar completely when a milestone is reached', () => {
    expect(milestoneProgress(6, 7)).toEqual({ from: 6 / 7, to: 1, reached: true, target: 30 })
    expect(milestoneProgress(364, 365)).toEqual({ from: 264 / 265, to: 1, reached: true, target: 730 })
  })

  it('shows the current position between milestones', () => {
    expect(currentProgress(12)).toEqual({ from: 0, to: 5 / 23, reached: false, target: 30 })
    expect(currentProgress(0)).toEqual({ from: 0, to: 0, reached: false, target: 7 })
    expect(currentProgress(7)).toEqual({ from: 0, to: 0, reached: false, target: 30 })
  })
})
