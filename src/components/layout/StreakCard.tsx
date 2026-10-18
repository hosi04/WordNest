import { Flame, Snowflake } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { getStreak, onReviewSaved, type Streak } from '../../lib/db'
import { StreakCelebration } from '../streak/StreakCelebration'

export function StreakCard() {
  const { t } = useI18n()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [failed, setFailed] = useState(false)
  const [showing, setShowing] = useState(false)

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
  const frozen = streak?.frozen ?? false
  const Icon = frozen ? Snowflake : Flame

  return (
    <>
      <button
        type="button"
        onClick={() => setShowing(true)}
        disabled={!streak}
        aria-label={t.celebration.open(days)}
        className={`block w-full rounded-card p-4 text-left transition-colors focus-visible:outline-2 disabled:cursor-default ${
          frozen
            ? 'bg-ice/15 ring-1 ring-ice-light/30 hover:bg-ice/25 focus-visible:outline-ice-light'
            : 'bg-white/5 hover:bg-white/10 focus-visible:outline-gold disabled:hover:bg-white/5'
        }`}
      >
        <span className={`flex items-center gap-2 font-semibold ${frozen ? 'text-ice-light' : 'text-gold'}`}>
          <Icon className="size-4" aria-hidden />
          {streak ? t.streak.days(days) : failed ? t.streak.failedTitle : t.streak.loading}
        </span>
        <span className="mt-2 block text-sm text-white/70">
          {failed
            ? t.streak.failed
            : frozen
              ? t.streak.frozen
              : streak?.thawedToday
                ? t.streak.thawedToday
                : studiedToday
                  ? t.streak.studiedToday
                  : t.streak.notYet}
        </span>
        <span className="mt-3 block h-1.5 rounded-full bg-white/10">
          <span className={`block h-full rounded-full bg-gold transition-all ${studiedToday ? 'w-full' : 'w-0'}`} />
        </span>
      </button>
      {/* Outside the button: Space/click on the overlay must not re-trigger it. */}
      {showing && (
        <StreakCelebration
          to={days}
          studiedToday={studiedToday}
          thawedToday={streak?.thawedToday}
          state={frozen ? 'frozen' : undefined}
          onClose={() => setShowing(false)}
        />
      )}
    </>
  )
}
