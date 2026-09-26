import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { QuizFeedback } from '../components/quiz/QuizFeedback'
import { QuizOption, type OptionState } from '../components/quiz/QuizOption'
import { QuizProgress } from '../components/quiz/QuizProgress'
import { QuizSummary } from '../components/quiz/QuizSummary'
import { SpeakButton } from '../components/SpeakButton'
import { HighlightedText } from '../components/study/HighlightedText'
import { useI18n } from '../i18n/I18nContext'
import { listWords, recordQuizAnswer } from '../lib/db'
import { useStreakCelebration } from '../components/streak/useStreakCelebration'
import { buildQuiz, XP_PER_CORRECT, type QuizQuestion } from '../lib/quiz'
import { isSoundOn, playCorrect, playWrong, setSoundOn } from '../lib/sound'

export function QuizPage() {
  const [round, setRound] = useState(0)
  // Remount for each new round so state starts fresh.
  return <QuizRound key={round} onRestart={() => setRound((r) => r + 1)} />
}

function optionState(i: number, chosen: number | null, answer: number): OptionState {
  if (chosen === null) return 'idle'
  if (i === answer) return 'correct'
  if (i === chosen) return 'wrong'
  return 'dimmed'
}

function QuizRound({ onRestart }: { onRestart: () => void }) {
  const { t } = useI18n()
  const [startedAt] = useState(() => Date.now())
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [saveError, setSaveError] = useState('')
  const [soundOn, setSound] = useState(isSoundOn)

  useEffect(() => {
    let cancelled = false
    listWords()
      .then((words) => !cancelled && setQuestions(buildQuiz(words)))
      .catch((err) => !cancelled && setLoadError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [])

  const question = questions?.[index]
  const finished = questions !== null && index >= questions.length
  const xp = results.filter(Boolean).length * XP_PER_CORRECT
  const celebration = useStreakCelebration(finished, startedAt)

  function choose(i: number) {
    if (!question || chosen !== null) return
    const correct = i === question.answer
    if (soundOn) {
      if (correct) playCorrect()
      else playWrong()
    }
    setChosen(i)
    setResults((r) => [...r, correct])
    recordQuizAnswer(question.word, correct).catch((err) =>
      setSaveError(err instanceof Error ? err.message : String(err)),
    )
  }

  function next() {
    setChosen(null)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (chosen !== null || !question || e.ctrlKey || e.metaKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= question.options.length) {
        e.preventDefault()
        choose(n - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (loadError) {
    return (
      <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
        {t.quiz.loadError(loadError)}
      </p>
    )
  }

  if (!questions) {
    return (
      <div className="flex justify-center py-20" role="status">
        <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
        <span className="sr-only">{t.quiz.loading}</span>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-card border border-line bg-card p-8 text-center">
        <h1 className="text-3xl">{t.quiz.notEnoughTitle}</h1>
        <p className="mt-3 text-ink-muted">{t.quiz.notEnoughText}</p>
        <Link
          to="/words"
          className="mt-6 inline-flex min-h-11 items-center rounded-control bg-accent px-5 font-semibold text-white hover:bg-accent-hover"
        >
          {t.quiz.addWords}
        </Link>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <QuizSummary questions={questions} results={results} xp={xp} onRestart={onRestart} />
        {saveError && <SaveError message={saveError} />}
        {celebration}
      </div>
    )
  }

  const { word } = question!
  const example = word.examples[0]?.en
  const meta = [word.ipa, word.part_of_speech].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-48 sm:pb-36">
      <QuizProgress
        current={index}
        results={results}
        total={questions.length}
        xp={xp}
        soundOn={soundOn}
        onToggleSound={() => {
          setSoundOn(!soundOn)
          setSound(!soundOn)
        }}
      />

      <section className="flex flex-col items-center text-center">
        <p className="text-ink-muted">{t.quiz.prompt}</p>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-5xl break-words sm:text-6xl">{word.word}</h1>
          <SpeakButton text={word.word} />
        </div>
        {meta && <p className="mt-3 text-lg text-ink-muted">{meta}</p>}
        {example && (
          <p className="mt-5 max-w-xl rounded-control border border-dashed border-line bg-card px-5 py-3 italic">
            “<HighlightedText text={example} term={word.word} />”
          </p>
        )}
      </section>

      <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2 sm:gap-4">
        {question!.options.map((text, i) => (
          <QuizOption
            key={i}
            index={i}
            text={text}
            state={optionState(i, chosen, question!.answer)}
            disabled={chosen !== null}
            onChoose={() => choose(i)}
          />
        ))}
      </div>

      {saveError && <SaveError message={saveError} />}

      {chosen !== null && (
        <QuizFeedback
          word={word}
          correct={chosen === question!.answer}
          isLast={index === questions.length - 1}
          onNext={next}
        />
      )}
    </div>
  )
}

function SaveError({ message }: { message: string }) {
  const { t } = useI18n()
  return (
    <p className="mx-auto max-w-3xl rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
      {t.quiz.saveError(message)}
    </p>
  )
}
