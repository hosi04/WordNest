import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { toDayKey } from '../../lib/date'
import { getStreak } from '../../lib/db'
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
 * Once a day (Vietnam time, per device), when the first study session of the day is completed,
 * shows the streak going from n to n + 1. Returns the overlay element to render, or null.
 */
export function useStreakCelebration(sessionCompleted: boolean) {
  const { session } = useAuth()
  const userId = session?.user.id
  const [streak, setStreak] = useState<{ from: number; to: number } | null>(null)

  useEffect(() => {
    if (!sessionCompleted || !userId) return
    const today = toDayKey(new Date())
    if (celebratedOn(userId) === today) return

    let cancelled = false
    let timer = 0
    getStreak()
      .then(({ days, studiedToday }) => {
        if (cancelled || !studiedToday || days < 1) return
        timer = window.setTimeout(() => {
          markCelebrated(userId, today)
          setStreak({ from: days - 1, to: days })
        }, SHOW_DELAY_MS)
      })
      .catch((err) => console.error('Could not load streak:', err))
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [sessionCompleted, userId])

  return streak && <StreakCelebration from={streak.from} to={streak.to} onClose={() => setStreak(null)} />
}
