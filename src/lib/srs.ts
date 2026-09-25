// Simplified SM-2 spaced repetition (docs/spec.md > Lặp lại ngắt quãng).

export type Rating = 1 | 2 | 3 | 4;
export interface SrsState { ease: number; interval_days: number; reps: number; }

const MIN = 60_000, DAY = 86_400_000;

export function review(s: SrsState, r: Rating, now = Date.now()) {
  let { ease, interval_days, reps } = s;
  let dueMs: number;
  if (r === 1) {
    ease = Math.max(1.3, ease - 0.2); reps = 0; interval_days = 0; dueMs = now + MIN;
  } else if (r === 2) {
    ease = Math.max(1.3, ease - 0.15);
    if (reps === 0) { dueMs = now + 6 * MIN; }
    else { interval_days = Math.max(1, Math.round(interval_days * 1.2)); reps++; dueMs = now + interval_days * DAY; }
  } else {
    if (r === 4) ease += 0.15;
    if (reps === 0) interval_days = r === 4 ? 4 : 1;
    else interval_days = Math.max(1, Math.round(interval_days * ease * (r === 4 ? 1.3 : 1)));
    reps++; dueMs = now + interval_days * DAY;
  }
  return { ease, interval_days, reps, due_at: new Date(dueMs).toISOString() };
}

export const RATINGS: Rating[] = [1, 2, 3, 4]

/** Cards due again within this window are shown again in the same session. */
const RELEARN_WINDOW_MS = 20 * MIN

export function isRelearning(dueAt: string, now = Date.now()): boolean {
  return Date.parse(dueAt) - now < RELEARN_WINDOW_MS
}

export interface IntervalFormat {
  lessThanMinute: string
  minutes: (n: number) => string
  hours: (n: number) => string
  days: (n: number) => string
  months: (n: number) => string
  years: (n: number) => string
}

/** Human-readable time until the next review, e.g. "< 1 phút", "6 phút", "1 ngày", "2,5 tháng". */
export function formatInterval(dueAt: string, now: number, fmt: IntervalFormat): string {
  const ms = Date.parse(dueAt) - now
  if (ms <= MIN) return fmt.lessThanMinute
  if (ms < 60 * MIN) return fmt.minutes(Math.round(ms / MIN))
  if (ms < DAY) return fmt.hours(Math.round(ms / (60 * MIN)))
  const days = Math.round(ms / DAY)
  if (days < 30) return fmt.days(days)
  if (days < 365) return fmt.months(days / 30)
  return fmt.years(days / 365)
}
