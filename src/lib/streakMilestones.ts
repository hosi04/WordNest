// Streak milestones for the celebration overlay: 7, 30, 100, 365 and every full year after.
const MILESTONES = [7, 30, 100, 365]
const YEAR = 365

export function isMilestone(days: number): boolean {
  return MILESTONES.includes(days) || (days > YEAR && days % YEAR === 0)
}

export function nextMilestone(days: number): number {
  const next = MILESTONES.find((m) => m > days)
  return next ?? (Math.floor(days / YEAR) + 1) * YEAR
}

export function prevMilestone(days: number): number {
  if (days >= YEAR) return Math.floor(days / YEAR) * YEAR
  return MILESTONES.filter((m) => m <= days).at(-1) ?? 0
}

export interface MilestoneProgress {
  from: number // bar fill before, 0–1
  to: number // bar fill after, 0–1
  reached: boolean // `to` completed the milestone the bar was counting towards
  target: number // milestone the caption talks about next
}

/** Progress bar towards the next milestone, as the streak goes from `from` to `to` days. */
export function milestoneProgress(from: number, to: number): MilestoneProgress {
  const lo = prevMilestone(from)
  const hi = nextMilestone(from)
  const reached = to >= hi
  return {
    from: (from - lo) / (hi - lo),
    to: reached ? 1 : (to - lo) / (hi - lo),
    reached,
    target: reached ? nextMilestone(to) : hi,
  }
}

/** Progress bar for showing the current streak: fills from empty to where `days` stands. */
export function currentProgress(days: number): MilestoneProgress {
  const lo = prevMilestone(days)
  const hi = nextMilestone(days)
  return { from: 0, to: (days - lo) / (hi - lo), reached: false, target: hi }
}
