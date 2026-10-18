import { addDays } from './date'

/**
 * Streak rules (Duolingo-like, without a freeze limit):
 * - each study day adds 1 when the day before was a study day too;
 * - after a day without study the streak is frozen: it keeps its length, it is never lost;
 * - the first study day after that thaws it without adding 1; it grows again from the next day.
 */
export interface StreakStatus {
  days: number
  /** A whole day went by without study (and none today yet). */
  frozen: boolean
  studiedToday: boolean
  /** Today's study thawed a frozen streak (so today did not add a day). */
  thawedToday: boolean
}

/** `studyDays` are Vietnam calendar days ("YYYY-MM-DD"); days after `today` are ignored. */
export function computeStreak(studyDays: Iterable<string>, today: string): StreakStatus {
  const days = [...new Set(studyDays)].filter((d) => d <= today).sort()
  let streak = 0
  let thawedToday = false
  let prev: string | null = null
  for (const day of days) {
    if (prev === null || addDays(prev, 1) === day) streak++
    else if (day === today) thawedToday = true
    prev = day
  }
  return {
    days: streak,
    frozen: prev !== null && prev < addDays(today, -1),
    studiedToday: prev === today,
    thawedToday,
  }
}
