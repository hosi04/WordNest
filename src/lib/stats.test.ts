import { describe, expect, it } from 'vitest'
import type { Deck, Word } from './db'
import {
  accuracy,
  dailyCounts,
  deckProgress,
  estimateMinutes,
  partOfDay,
  percentChange,
  wordOfTheDay,
  type ReviewRow,
} from './stats'

function word(id: string, patch: Partial<Word> = {}): Word {
  return {
    id,
    deck_id: 'd1',
    word: id,
    ipa: null,
    part_of_speech: null,
    level: null,
    meaning_vi: id,
    definition_en: null,
    examples: [],
    synonyms: [],
    ease: 2.5,
    interval_days: 0,
    reps: 0,
    due_at: '2026-09-25T00:00:00Z',
    last_reviewed_at: null,
    created_at: '2026-09-20T00:00:00Z',
    ...patch,
  }
}

describe('dailyCounts', () => {
  it('returns 7 days ending today, filling gaps with 0', () => {
    const result = dailyCounts(['2026-09-25', '2026-09-25', '2026-09-22', '2026-09-10'], '2026-09-25')
    expect(result).toHaveLength(7)
    expect(result[0]).toEqual({ day: '2026-09-19', count: 0 })
    expect(result[3]).toEqual({ day: '2026-09-22', count: 1 })
    expect(result[6]).toEqual({ day: '2026-09-25', count: 2 })
  })
})

describe('percentChange', () => {
  it('compares with the previous period', () => {
    expect(percentChange(118, 100)).toBe(18)
    expect(percentChange(50, 100)).toBe(-50)
    expect(percentChange(10, 0)).toBeNull()
  })
})

describe('accuracy', () => {
  const row = (patch: Partial<ReviewRow>): ReviewRow => ({
    reviewed_at: '2026-09-25T00:00:00Z',
    mode: 'flashcard',
    rating: null,
    correct: null,
    ...patch,
  })

  it('is null with no answers', () => {
    expect(accuracy([])).toBeNull()
  })

  it('counts flashcard ratings above Quên and correct quiz answers', () => {
    const rows = [
      row({ rating: 1 }),
      row({ rating: 2 }),
      row({ rating: 3 }),
      row({ rating: 4 }),
      row({ mode: 'quiz', correct: true }),
      row({ mode: 'quiz', correct: false }),
    ]
    expect(accuracy(rows)).toBe(67) // 4 of 6
  })
})

describe('deckProgress', () => {
  const deck: Deck = { id: 'd1', name: 'Giao tiếp', color: '#2F7D5B', description: null, created_at: '' }

  it('computes mastered percent and level range', () => {
    const words = [
      word('a', { level: 'B1', interval_days: 30, last_reviewed_at: '2026-09-01T00:00:00Z' }),
      word('b', { level: 'A2' }),
      word('c', { level: 'B1' }),
      word('d', { level: null }),
      word('x', { deck_id: 'other', level: 'C2' }),
    ]
    expect(deckProgress([deck], words)).toEqual([{ deck, total: 4, mastered: 1, percent: 25, levels: 'A2–B1' }])
  })

  it('handles an empty deck', () => {
    expect(deckProgress([deck], [])[0]).toMatchObject({ total: 0, percent: 0, levels: null })
  })
})

describe('wordOfTheDay', () => {
  const words = [word('a'), word('b', { last_reviewed_at: '2026-09-24T00:00:00Z' }), word('c'), word('d')]

  it('is stable for the same day and only picks new words', () => {
    const pick = wordOfTheDay(words, '2026-09-25')
    expect(pick?.last_reviewed_at).toBeNull()
    expect(wordOfTheDay([...words].reverse(), '2026-09-25')).toBe(pick)
  })

  it('falls back to any word when nothing is new, and null when empty', () => {
    const reviewed = [word('b', { last_reviewed_at: '2026-09-24T00:00:00Z' })]
    expect(wordOfTheDay(reviewed, '2026-09-25')?.id).toBe('b')
    expect(wordOfTheDay([], '2026-09-25')).toBeNull()
  })
})

describe('partOfDay', () => {
  it('uses Vietnam time', () => {
    expect(partOfDay(new Date('2026-09-25T01:00:00Z'))).toBe('morning') // 08:00
    expect(partOfDay(new Date('2026-09-25T05:00:00Z'))).toBe('noon') // 12:00
    expect(partOfDay(new Date('2026-09-25T08:00:00Z'))).toBe('afternoon') // 15:00
    expect(partOfDay(new Date('2026-09-25T14:00:00Z'))).toBe('evening') // 21:00
  })
})

describe('estimateMinutes', () => {

  it('estimates about 20 seconds per card', () => {
    expect(estimateMinutes(0)).toBe(1)
    expect(estimateMinutes(24)).toBe(8)
  })
})
