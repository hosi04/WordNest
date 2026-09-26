import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Flashcard } from '../components/study/Flashcard'
import { RatingButtons } from '../components/study/RatingButtons'
import { StudyHeader } from '../components/study/StudyHeader'
import { useStreakCelebration } from '../components/streak/useStreakCelebration'
import {
  countNewStartedToday,
  getDeck,
  getDueWords,
  getNewWords,
  getSettings,
  getWord,
  recordFlashcardReview,
  type Word,
} from '../lib/db'
import { useI18n } from '../i18n/I18nContext'
import { isRelearning, RATINGS, type Rating } from '../lib/srs'

interface Session {
  deckName: string | null // null: all decks, or a single word from the word book
  fromWordBook: boolean
  backTo: string
  queue: Word[]
  total: number
}

type StudyOnly = 'due' | 'new' | null

async function loadSession(deckId?: string, wordId?: string | null, only?: StudyOnly): Promise<Session> {
  if (wordId) {
    const word = await getWord(wordId)
    const queue = word ? [word] : []
    return { deckName: null, fromWordBook: true, backTo: '/words', queue, total: queue.length }
  }

  const [settings, startedToday, due, deck] = await Promise.all([
    getSettings(),
    countNewStartedToday(),
    only === 'new' ? [] : getDueWords(deckId),
    deckId ? getDeck(deckId) : null,
  ])
  const fresh = only === 'due' ? [] : await getNewWords(settings.new_per_day - startedToday, deckId)
  const queue = [...due, ...fresh]
  return { deckName: deck?.name ?? null, fromWordBook: false, backTo: '/', queue, total: queue.length }
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

export function StudyPage() {
  const { deckId } = useParams()
  const [searchParams] = useSearchParams()
  const wordId = searchParams.get('word')
  const onlyParam = searchParams.get('only')
  const only: StudyOnly = onlyParam === 'due' || onlyParam === 'new' ? onlyParam : null
  // Remount on a new deck/word/mode so every session starts from fresh state.
  return <StudySession key={`${deckId}:${wordId}:${only}`} deckId={deckId} wordId={wordId} only={only} />
}

function StudySession({ deckId, wordId, only }: { deckId?: string; wordId: string | null; only: StudyOnly }) {
  const { t } = useI18n()
  const [session, setSession] = useState<Session | null>(null)
  const [loadError, setLoadError] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rateError, setRateError] = useState('')
  const [done, setDone] = useState<Set<string>>(new Set())
  const [again, setAgain] = useState<Set<string>>(new Set())
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadSession(deckId, wordId, only)
      .then((s) => !cancelled && setSession(s))
      .catch((err) => !cancelled && setLoadError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [deckId, wordId, only])

  const current = session?.queue[0]
  const celebration = useStreakCelebration(Boolean(session && session.total > 0 && !current))

  const rate = useCallback(
    async (rating: Rating) => {
      if (!current || saving) return
      setSaving(true)
      setRateError('')
      try {
        const updated = await recordFlashcardReview(current, rating)
        const relearn = isRelearning(updated.due_at)
        setSession((s) => s && { ...s, queue: relearn ? [...s.queue.slice(1), updated] : s.queue.slice(1) })
        setDone((d) => (relearn ? d : new Set(d).add(updated.id)))
        setAgain((a) => {
          const next = new Set(a)
          if (relearn) next.add(updated.id)
          else next.delete(updated.id)
          return next
        })
        setReviewCount((n) => n + 1)
        setFlipped(false)
      } catch (err) {
        setRateError(err instanceof Error ? err.message : String(err))
      } finally {
        setSaving(false)
      }
    },
    [current, saving],
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!current || isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        void rate(Number(e.key) as Rating)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current, flipped, rate])

  if (loadError) {
    return (
      <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
        {t.study.loadError(loadError)}
      </p>
    )
  }

  if (!session) {
    return (
      <div className="flex justify-center py-20" role="status">
        <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
        <span className="sr-only">{t.study.loading}</span>
      </div>
    )
  }

  if (session.total === 0) {
    return (
      <EndScreen
        title={t.study.emptyTitle}
        text={t.study.emptyText}
      />
    )
  }

  if (!current) {
    return (
      <>
        <EndScreen title={t.study.doneTitle} text={t.study.doneText(session.total, reviewCount)} />
        {celebration}
      </>
    )
  }

  const remaining = session.total - done.size

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <StudyHeader
        title={session.fromWordBook ? t.common.wordBook : (session.deckName ?? t.study.allDecks)}
        backTo={session.backTo} done={done.size} total={session.total} />

      <Flashcard key={current.id + reviewCount} word={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      {rateError && (
        <p className="rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
          {t.study.saveError(rateError)}
        </p>
      )}

      <div className="flex flex-col items-center gap-5">
        {flipped ? (
          <div className="w-full max-w-xl">
            <RatingButtons word={current} disabled={saving} onRate={rate} />
            <p className="mt-3 hidden text-center text-sm text-ink-muted sm:block">
              {t.study.shortcuts}: {RATINGS.map((r) => `${r} ${t.ratings[r]}`).join(' · ')}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-keyshortcuts="Space"
            className="min-h-14 rounded-control bg-ink px-10 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t.study.flip}
          </button>
        )}

        {/* px-16 on phones keeps the legend clear of the floating language button. */}
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-16 text-sm text-ink-muted sm:px-0">
          <Legend dot="bg-success" label={t.study.remembered(done.size)} />
          <Legend dot="bg-accent" label={t.study.again(again.size)} />
          <Legend dot="bg-ink-muted/40" label={t.study.remaining(remaining)} />
        </ul>
      </div>
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </li>
  )
}

function EndScreen({ title, text }: { title: string; text: string }) {
  const { t } = useI18n()
  return (
    <div className="mx-auto mt-10 max-w-lg rounded-card border border-line bg-card p-8 text-center">
      <CircleCheck className="mx-auto size-14 text-success" aria-hidden />
      <h1 className="mt-4 text-3xl">{title}</h1>
      <p className="mt-3 text-ink-muted">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="flex min-h-11 items-center rounded-control bg-accent px-5 font-semibold text-white hover:bg-accent-hover"
        >
          {t.common.backToOverview}
        </Link>
        <Link
          to="/words"
          className="flex min-h-11 items-center rounded-control border border-line bg-white px-5 font-semibold hover:bg-soft"
        >
          {t.common.wordBook}
        </Link>
      </div>
    </div>
  )
}
