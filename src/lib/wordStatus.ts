import { toDayKey } from './date'

export type WordStatus = 'new' | 'learning' | 'mastered'

const MASTERED_INTERVAL = 21

interface ReviewFields {
  interval_days: number
  last_reviewed_at: string | null
  due_at: string
}

export function wordStatus(w: ReviewFields): WordStatus {
  if (w.last_reviewed_at === null) return 'new'
  return w.interval_days >= MASTERED_INTERVAL ? 'mastered' : 'learning'
}

/** Memory level 1–5 derived from the review interval. */
export function memoryLevel(intervalDays: number): number {
  if (intervalDays >= MASTERED_INTERVAL) return 5
  if (intervalDays >= 8) return 4
  if (intervalDays >= 3) return 3
  if (intervalDays >= 1) return 2
  return 1
}

const DAY_MS = 86_400_000

/** Vietnam calendar days until the next review (0 = today or overdue); null for new words. */
export function daysUntilReview(w: ReviewFields, now: Date = new Date()): number | null {
  if (w.last_reviewed_at === null) return null
  const due = Date.parse(`${toDayKey(w.due_at)}T00:00:00Z`)
  const today = Date.parse(`${toDayKey(now)}T00:00:00Z`)
  return Math.max(0, Math.round((due - today) / DAY_MS))
}

/** Lowercase and strip Vietnamese diacritics so "ngo" matches "ngõ". */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}
