import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { DashboardView, type DashboardData } from '../components/dashboard/DashboardView'
import { toDayKey } from '../lib/date'
import {
  countNewStartedToday,
  ensureSampleData,
  getReviewsSince,
  getSettings,
  getStreak,
  listDecks,
  listWords,
  startOfDayAgo,
} from '../lib/db'
import {
  accuracy,
  dailyCounts,
  deckProgress,
  partOfDay,
  percentChange,
  wordOfTheDay,
} from '../lib/stats'
import { displayName } from '../lib/user'
import { wordStatus } from '../lib/wordStatus'


async function loadDashboard(): Promise<DashboardData> {
  await ensureSampleData()
  const [words, decks, streak, reviews, settings, startedToday] = await Promise.all([
    listWords(),
    listDecks(),
    getStreak(),
    getReviewsSince(startOfDayAgo(13)), // this week + the week before, for the comparison
    getSettings(),
    countNewStartedToday(),
  ])

  const now = new Date()
  const today = toDayKey(now)
  const reviewDays = reviews.map((r) => toDayKey(r.reviewed_at))
  const fortnight = dailyCounts(reviewDays, today, 14)
  const week = fortnight.slice(7)
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0)
  const lastWeekTotal = fortnight.slice(0, 7).reduce((sum, d) => sum + d.count, 0)
  const weekStart = week[0].day

  const due = words
    .filter((w) => w.last_reviewed_at !== null && Date.parse(w.due_at) <= now.getTime())
    .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at))
  const newCount = words.filter((w) => wordStatus(w) === 'new').length

  return {
    today,
    partOfDay: partOfDay(now),
    streak: streak.days,
    mastered: words.filter((w) => wordStatus(w) === 'mastered').length,
    due,
    newAvailable: Math.max(0, Math.min(newCount, settings.new_per_day - startedToday)),
    accuracy: accuracy(reviews.filter((r) => toDayKey(r.reviewed_at) >= weekStart)),
    wordOfDay: wordOfTheDay(words, today),
    decks: deckProgress(decks, words),
    week,
    weekTotal,
    weekChange: percentChange(weekTotal, lastWeekTotal),
  }
}

export function DashboardPage() {
  const { session } = useAuth()
  const { t } = useI18n()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadDashboard()
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
        {t.dashboard.loadError(error)}
      </p>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20" role="status">
        <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
        <span className="sr-only">{t.common.loading}</span>
      </div>
    )
  }

  return <DashboardView data={data} userName={displayName(session?.user)} />
}
