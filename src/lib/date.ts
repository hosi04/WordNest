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

