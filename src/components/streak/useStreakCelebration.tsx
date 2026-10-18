import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { toDayKey } from '../../lib/date'
import { getStreak, hadReviewTodayBefore } from '../../lib/db'
import { shouldCelebrate } from '../../lib/streakCelebration'
import { StreakCelebration } from './StreakCelebration'

const SHOW_DELAY_MS = 500 // let the "session complete" screen appear first

function storageKey(userId: string) {
  return `wordnest.streakCelebrated.${userId}`
}

function celebratedOn(userId: string): string | null {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

function markCelebrated(userId: string, day: string) {
  try {
    localStorage.setItem(storageKey(userId), day)
  } catch {
    // storage unavailable — worst case the celebration shows again today
  }
}

/**
 * When the first study session of the day (Vietnam time, across all devices) is completed, shows
 * the streak going from n to n + 1, or the ice breaking when that session thawed a frozen streak. Returns the overlay element to render, or null.
 * `sessionStartedAt` (ms) tells apart this session's reviews from earlier ones today.
 */
export function useStreakCelebration(sessionCompleted: boolean, sessionStartedAt: number) {
  const { session } = useAuth()
  const userId = session?.user.id
  const [streak, setStreak] = useState<{ from?: number; to: number; thawing: boolean } | null>(null)

  useEffect(() => {
    if (!sessionCompleted || !userId) return
    const today = toDayKey(new Date())
    if (celebratedOn(userId) === today) return

    let cancelled = false
    let timer = 0
    Promise.all([getStreak(), hadReviewTodayBefore(new Date(sessionStartedAt).toISOString())])
      .then(([{ days, studiedToday, thawedToday }, hadEarlierReviewToday]) => {
        if (cancelled) return
        if (!shouldCelebrate({ studiedToday, days, hadEarlierReviewToday, alreadyCelebratedToday: false })) {
          // Not the first session today: remember that, so later sessions skip the checks.
          if (hadEarlierReviewToday) markCelebrated(userId, today)
          return
        }
        timer = window.setTimeout(() => {
          markCelebrated(userId, today)
          // A thaw day adds nothing: break the ice instead of counting up.
          setStreak(thawedToday ? { to: days, thawing: true } : { from: days - 1, to: days, thawing: false })
        }, SHOW_DELAY_MS)
      })
      .catch((err) => console.error('Could not load streak:', err))
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [sessionCompleted, sessionStartedAt, userId])

  return (
    streak && (
      <StreakCelebration
        from={streak.from}
        to={streak.to}
        state={streak.thawing ? 'thawing' : undefined}
        onClose={() => setStreak(null)}
      />
    )
  )
}
