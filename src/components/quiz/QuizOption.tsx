import { Check, X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nContext'

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed'

const STYLES: Record<OptionState, { box: string; badge: string }> = {
  idle: { box: 'border-line bg-card hover:border-ink/30 hover:bg-white', badge: 'bg-soft text-ink' },
  correct: { box: 'border-success bg-success-soft text-success', badge: 'bg-success text-white' },
  wrong: { box: 'border-accent bg-accent-soft text-accent', badge: 'bg-accent text-white' },
  dimmed: { box: 'border-line bg-card opacity-60', badge: 'bg-soft text-ink' },
}

interface Props {
  index: number
  text: string
  state: OptionState
  disabled: boolean
  onChoose: () => void
}

export function QuizOption({ index, text, state, disabled, onChoose }: Props) {
  const { t } = useI18n()
  const style = STYLES[state]
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={disabled}
      aria-keyshortcuts={String(index + 1)}
      className={`flex min-h-16 w-full items-center gap-4 rounded-card border-2 px-5 py-3 text-left font-semibold transition-colors disabled:cursor-default ${style.box}`}
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${style.badge}`}>
        {index + 1}
      </span>
      <span className="flex-1">{text}</span>
      {state === 'correct' && <Check className="size-5 shrink-0" aria-label={t.quiz.correctAria} />}
      {state === 'wrong' && <X className="size-5 shrink-0" aria-label={t.quiz.wrongAria} />}
    </button>
  )
}
