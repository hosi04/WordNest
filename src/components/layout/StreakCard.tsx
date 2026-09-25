import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { getStreak, onReviewSaved, type Streak } from '../../lib/db'

export function StreakCard() {
  const { t } = useI18n()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getStreak()
        .then((s) => {
          if (cancelled) return
          setStreak(s)
          setFailed(false)
        })
        .catch((err) => {
          console.error('Could not load streak:', err)
          if (!cancelled) setFailed(true)
        })

    void load()
    const unsubscribe = onReviewSaved(load)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const days = streak?.days ?? 0
  const studiedToday = streak?.studiedToday ?? false

  return (
    <div className="rounded-card bg-white/5 p-4">
      <p className="flex items-center gap-2 font-semibold text-gold">
        <Flame className="size-4" aria-hidden />
        {streak ? t.streak.days(days) : failed ? t.streak.failedTitle : t.streak.loading}
      </p>
      <p className="mt-2 text-sm text-white/70">
        {failed ? t.streak.failed : studiedToday ? t.streak.studiedToday : t.streak.notYet}
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gold transition-all ${studiedToday ? 'w-full' : 'w-0'}`}
        />
      </div>
    </div>
  )
}
