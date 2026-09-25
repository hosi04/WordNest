export const TIMEZONE = 'Asia/Ho_Chi_Minh'

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar day in Vietnam time, as `YYYY-MM-DD`. */
export function toDayKey(date: Date | string | number): string {
  return dayKeyFormat.format(new Date(date))
}

/** Shift a `YYYY-MM-DD` key by whole days. */
export function addDays(dayKey: string, days: number): string {
  const d = new Date(`${dayKey}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Consecutive study days ending today — or yesterday, since today's streak
 * is not lost until the day is over. Missing a full day resets it to 0.
 */
export function computeStreak(studyDays: Iterable<string>, today: string): number {
  const days = new Set(studyDays)
  let day = days.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (days.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}
