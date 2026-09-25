import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import type { QuizQuestion } from '../../lib/quiz'

interface Props {
  questions: QuizQuestion[]
  results: boolean[]
  xp: number
  onRestart: () => void
}

export function QuizSummary({ questions, results, xp, onRestart }: Props) {
  const { t } = useI18n()
  const score = results.filter(Boolean).length
  const wrong = questions.filter((_, i) => results[i] === false)
  const percent = Math.round((score / questions.length) * 100)
  const message = percent === 100 ? t.quiz.perfect : percent >= 70 ? t.quiz.good : t.quiz.keepGoing

  return (
    <div className="mx-auto max-w-xl rounded-card border border-line bg-card p-8 text-center">
      <p className="text-xs font-semibold tracking-wider text-ink-muted uppercase">{t.quiz.result}</p>
      <h1 className="mt-2 text-5xl">
        {score} / {questions.length}
      </h1>
      <p className="mt-2 text-lg font-semibold">{message}</p>
      <p className="mt-1 text-ink-muted">+{xp} XP</p>

      {wrong.length > 0 && (
        <div className="mt-6 text-left">
          <p className="text-sm font-semibold text-ink-muted">
            {t.quiz.wrongList}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {wrong.map((q) => (
              <li key={q.word.id} className="rounded-control bg-accent-soft px-4 py-2.5">
                <span className="font-display font-semibold">{q.word.word}</span>
                <span className="text-ink-muted"> — {q.word.meaning_vi}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-11 rounded-control bg-accent px-5 font-semibold text-white hover:bg-accent-hover"
        >
          {t.quiz.newQuiz}
        </button>
        {wrong.length > 0 && (
          <Link
            to="/study"
            className="flex min-h-11 items-center rounded-control bg-ink px-5 font-semibold text-white hover:opacity-90"
          >
            {t.quiz.reviewNow}
          </Link>
        )}
        <Link
          to="/"
          className="flex min-h-11 items-center rounded-control border border-line bg-white px-5 font-semibold hover:bg-soft"
        >
          {t.common.backToOverview}
        </Link>
      </div>
    </div>
  )
}
