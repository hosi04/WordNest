import type { Word } from './db'
import { normalizeSearch } from './wordStatus'

export const QUIZ_LENGTH = 10
export const OPTION_COUNT = 4
export const XP_PER_CORRECT = 10

export interface QuizQuestion {
  word: Word
  options: string[] // Vietnamese meanings
  answer: number // index of the correct option
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Words with a distinct meaning are needed for the 3 distractors. */
export function canBuildQuiz(words: Word[]): boolean {
  return new Set(words.map((w) => normalizeSearch(w.meaning_vi))).size >= OPTION_COUNT
}

/**
 * Picks up to `length` words (already-studied words first, then new ones) and gives each
 * question 3 distractors taken at random from other words' meanings.
 */
export function buildQuiz(words: Word[], length = QUIZ_LENGTH, random: () => number = Math.random): QuizQuestion[] {
  if (!canBuildQuiz(words)) return []

  const studied = shuffle(words.filter((w) => w.last_reviewed_at !== null), random)
  const fresh = shuffle(words.filter((w) => w.last_reviewed_at === null), random)
  const picked = [...studied, ...fresh].slice(0, length)

  return picked.map((word) => {
    const correct = normalizeSearch(word.meaning_vi)
    const distractors: string[] = []
    const seen = new Set([correct])
    for (const other of shuffle(words, random)) {
      const key = normalizeSearch(other.meaning_vi)
      if (seen.has(key)) continue
      seen.add(key)
      distractors.push(other.meaning_vi)
      if (distractors.length === OPTION_COUNT - 1) break
    }
    const options = shuffle([word.meaning_vi, ...distractors], random)
    return { word, options, answer: options.indexOf(word.meaning_vi) }
  })
}
