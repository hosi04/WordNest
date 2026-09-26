import { Star, Volume2, VolumeX, X } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'

interface Props {
  current: number // 0-based index of the question on screen
  results: boolean[] // answered questions, in order
  total: number
  xp: number
  soundOn: boolean
  onToggleSound: () => void
}

export function QuizProgress({ current, results, total, xp, soundOn, onToggleSound }: Props) {
  const { t } = useI18n()
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="shrink-0">
        <p className="text-xs font-semibold tracking-wider text-ink-muted uppercase">{t.quiz.eyebrow}</p>
        <p className="font-display text-2xl font-semibold">
          {t.quiz.question(Math.min(current + 1, total), total)}
        </p>
      </div>

      <ol className="order-last flex w-full gap-1.5 sm:order-none sm:w-auto sm:flex-1" aria-label={t.quiz.progress}>
        {Array.from({ length: total }, (_, i) => {
          const result = results[i]
          const color =
            result === true ? 'bg-success' : result === false ? 'bg-accent' : i === current ? 'bg-ink' : 'bg-line'
          const state = result === true ? 'correct' : result === false ? 'wrong' : i === current ? 'current' : 'todo'
          return (
            <li key={i} className={`h-1.5 flex-1 rounded-full ${color}`}>
              <span className="sr-only">{t.quiz.segment(i + 1, state)}</span>
            </li>
          )
        })}
      </ol>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <span className="flex min-h-11 items-center gap-2 rounded-control bg-gold-soft px-4 font-bold">
          <Star className="size-4" aria-hidden />
          {xp} XP
        </span>
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? t.quiz.soundOn : t.quiz.soundOff}
          title={soundOn ? t.quiz.soundOn : t.quiz.soundOff}
          className="flex size-11 items-center justify-center rounded-control border border-line bg-card text-ink-muted hover:bg-soft"
        >
          {soundOn ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
        </button>
        <Link
          to="/"
          aria-label={t.quiz.exit}
          className="flex size-11 items-center justify-center rounded-control border border-line bg-card hover:bg-soft"
        >
          <X className="size-5" aria-hidden />
        </Link>
      </div>
    </header>
  )
}
