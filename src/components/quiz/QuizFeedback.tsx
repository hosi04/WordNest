import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { XP_PER_CORRECT } from '../../lib/quiz'

interface Props {
  word: Word
  correct: boolean
  isLast: boolean
  onNext: () => void
}

export function QuizFeedback({ word, correct, isLast, onNext }: Props) {
  const { t } = useI18n()
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    nextRef.current?.focus()
  }, [])

  const synonyms = word.synonyms.length ? t.quiz.synonyms(word.synonyms.join(', ')) : ''

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-20 px-4 pb-3 md:bottom-0 md:left-sidebar md:px-12 md:pb-8">
      <div
        role="status"
        className={`pointer-events-auto mx-auto flex max-w-5xl flex-wrap items-center gap-4 rounded-card p-5 ${
          correct ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent'
        }`}
      >
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-white ${
            correct ? 'bg-success' : 'bg-accent'
          }`}
        >
          {correct ? <Check className="size-6" aria-hidden /> : <X className="size-6" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">
            {correct ? t.quiz.correctTitle(XP_PER_CORRECT) : t.quiz.wrongTitle}
          </p>
          <p className="text-sm text-ink">
            <strong>{word.word}</strong> = {word.meaning_vi}.{synonyms}
          </p>
        </div>
        <button
          ref={nextRef}
          type="button"
          onClick={onNext}
          aria-keyshortcuts="Enter"
          className={`min-h-12 w-full rounded-control px-8 font-semibold text-white sm:w-auto ${
            correct ? 'bg-success hover:opacity-90' : 'bg-accent hover:bg-accent-hover'
          }`}
        >
          {isLast ? t.quiz.seeResults : t.quiz.next}
        </button>
      </div>
    </div>
  )
}
