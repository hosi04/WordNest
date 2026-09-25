import type { Deck, Word } from './db'
import { addDays, TIMEZONE } from './date'
import { wordStatus } from './wordStatus'

export interface ReviewRow {
  reviewed_at: string
  mode: 'flashcard' | 'quiz'
  rating: number | null
  correct: boolean | null
}

export interface DayCount {
  day: string // YYYY-MM-DD
  count: number
}

/** Review counts per Vietnam calendar day, oldest first, ending today. */
export function dailyCounts(reviewDays: string[], today: string, days = 7): DayCount[] {
  const counts = new Map<string, number>()
  for (const d of reviewDays) counts.set(d, (counts.get(d) ?? 0) + 1)
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1)
    return { day, count: counts.get(day) ?? 0 }
  })
}

/** Percent change vs the previous period; null when there is nothing to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** Share of answers that were right: quiz `correct`, or a flashcard rated above "Quên". */
export function accuracy(rows: ReviewRow[]): number | null {
  const graded = rows.filter((r) => (r.mode === 'quiz' ? r.correct !== null : r.rating !== null))
  if (graded.length === 0) return null
  const right = graded.filter((r) => (r.mode === 'quiz' ? r.correct : (r.rating ?? 0) > 1)).length
  return Math.round((right / graded.length) * 100)
}

export interface DeckProgress {
  deck: Deck
  total: number
  mastered: number
  percent: number
  levels: string | null // e.g. "A2–B1"
}

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function deckProgress(decks: Deck[], words: Word[]): DeckProgress[] {
  return decks.map((deck) => {
    const own = words.filter((w) => w.deck_id === deck.id)
    const mastered = own.filter((w) => wordStatus(w) === 'mastered').length
    const levels = own
      .map((w) => w.level)
      .filter((l): l is NonNullable<typeof l> => l !== null)
      .sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b))
    const range = levels.length
      ? levels[0] === levels[levels.length - 1]
        ? levels[0]
        : `${levels[0]}–${levels[levels.length - 1]}`
      : null
    return {
      deck,
      total: own.length,
      mastered,
      percent: own.length ? Math.round((mastered / own.length) * 100) : 0,
      levels: range,
    }
  })
}

function hashString(s: string): number {
  let h = 0
  for (const ch of s) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** A "Mới" word picked by the date, so it stays the same all day. Falls back to any word. */
export function wordOfTheDay(words: Word[], today: string): Word | null {
  const fresh = words.filter((w) => wordStatus(w) === 'new')
  const pool = (fresh.length ? fresh : words).slice().sort((a, b) => a.id.localeCompare(b.id))
  return pool.length ? pool[hashString(today) % pool.length] : null
}

const hourFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: 'numeric', hourCycle: 'h23' })

export type PartOfDay = 'morning' | 'noon' | 'afternoon' | 'evening'

/** Part of the day in Vietnam time, for the greeting. */
export function partOfDay(now: Date = new Date()): PartOfDay {
  const hour = Number(hourFormat.format(now))
  if (hour < 11) return 'morning'
  if (hour < 13) return 'noon'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/** Rough session length, ~20 seconds per card. */
export function estimateMinutes(cards: number): number {
  return Math.max(1, Math.ceil((cards * 20) / 60))
}
