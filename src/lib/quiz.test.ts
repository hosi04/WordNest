import { describe, expect, it } from 'vitest'
import type { Word } from './db'
import { buildQuiz, canBuildQuiz, shuffle } from './quiz'

function makeWord(i: number, meaning = `nghĩa ${i}`, reviewed = false): Word {
  return {
    id: `w${i}`,
    deck_id: null,
    word: `word${i}`,
    ipa: null,
    part_of_speech: null,
    level: null,
    meaning_vi: meaning,
    definition_en: null,
    examples: [],
    synonyms: [],
    ease: 2.5,
    interval_days: 0,
    reps: 0,
    due_at: '2026-09-25T00:00:00Z',
    last_reviewed_at: reviewed ? '2026-09-24T00:00:00Z' : null,
    created_at: '2026-09-20T00:00:00Z',
  }
}

// Deterministic pseudo-random generator for repeatable tests.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

describe('shuffle', () => {
  it('keeps every item and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, seeded(1))
    expect([...out].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('canBuildQuiz', () => {
  it('needs at least 4 distinct meanings', () => {
    expect(canBuildQuiz([1, 2, 3].map((i) => makeWord(i)))).toBe(false)
    expect(canBuildQuiz([makeWord(1, 'a'), makeWord(2, 'A'), makeWord(3, 'b'), makeWord(4, 'c')])).toBe(false)
    expect(canBuildQuiz([1, 2, 3, 4].map((i) => makeWord(i)))).toBe(true)
  })
})

describe('buildQuiz', () => {
  const words = Array.from({ length: 15 }, (_, i) => makeWord(i, `nghĩa ${i}`, i < 6))

  it('builds 10 questions with 4 unique options including the answer', () => {
    const quiz = buildQuiz(words, 10, seeded(42))
    expect(quiz).toHaveLength(10)
    for (const q of quiz) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options[q.answer]).toBe(q.word.meaning_vi)
    }
  })

  it('does not repeat words', () => {
    const quiz = buildQuiz(words, 10, seeded(7))
    expect(new Set(quiz.map((q) => q.word.id)).size).toBe(10)
  })

  it('asks studied words before new ones', () => {
    const quiz = buildQuiz(words, 10, seeded(3))
    expect(quiz.slice(0, 6).every((q) => q.word.last_reviewed_at !== null)).toBe(true)
  })

  it('shortens the quiz when there are fewer words', () => {
    expect(buildQuiz(words.slice(0, 5), 10, seeded(1))).toHaveLength(5)
  })

  it('never uses a distractor equal to the answer', () => {
    const dupes = [makeWord(1, 'hẻm'), makeWord(2, 'Hẻm'), makeWord(3, 'b'), makeWord(4, 'c'), makeWord(5, 'd')]
    for (const q of buildQuiz(dupes, 5, seeded(9))) {
      const same = q.options.filter((o) => o.toLowerCase() === q.word.meaning_vi.toLowerCase())
      expect(same).toHaveLength(1)
    }
  })
})
