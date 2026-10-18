import { Book, Check, Flame, LoaderCircle, Repeat, Settings, Snowflake } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { StatCard } from '../components/dashboard/StatCard'
import { AvatarPicker } from '../components/profile/AvatarPicker'
import { SECONDARY_BTN } from '../components/settings/SettingsSection'
import { StreakCelebration } from '../components/streak/StreakCelebration'
import { useI18n } from '../i18n/I18nContext'
import { toDayKey } from '../lib/date'
import { countReviews, getStreak, listWords, type Streak } from '../lib/db'
import { avatarUrl, displayName } from '../lib/user'
import { usernameFromEmail } from '../lib/username'
import { wordStatus } from '../lib/wordStatus'
import { errorMessage } from '../lib/errors'

interface ProfileStats {
  streak: Streak
  words: number
  mastered: number
  reviews: number
}

async function loadStats(): Promise<ProfileStats> {
  const [streak, words, reviews] = await Promise.all([getStreak(), listWords(), countReviews()])
  return {
    streak,
    words: words.length,
    mastered: words.filter((w) => wordStatus(w) === 'mastered').length,
    reviews,
  }
}

export function ProfilePage() {
  const { session } = useAuth()
  const { t } = useI18n()
  const p = t.profile
  const user = session?.user
  const name = displayName(user)
  const username = usernameFromEmail(user?.email)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [error, setError] = useState('')
  const [showStreak, setShowStreak] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadStats()
      .then((s) => !cancelled && setStats(s))
      .catch((err) => !cancelled && setError(errorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h1 className="sr-only">{p.title}</h1>

      <section className="overflow-hidden rounded-card border border-line bg-card">
        <div className="h-24 bg-gradient-to-r from-accent-soft via-gold-soft to-info-soft sm:h-32" aria-hidden />
        <div className="-mt-14 flex flex-col items-center gap-4 px-6 pb-7 text-center sm:-mt-16">
          <AvatarPicker name={name} url={avatarUrl(user)} />
          <div className="min-w-0">
            <p className="font-display text-3xl font-semibold break-words sm:text-4xl">{name}</p>
            {username && <p className="mt-1 font-medium text-ink-muted">@{username}</p>}
            {user?.created_at && <p className="mt-1 text-sm text-ink-muted">{p.joined(toDayKey(user.created_at))}</p>}
          </div>
          <Link to="/settings" className={SECONDARY_BTN}>
            <Settings className="size-5" aria-hidden />
            {p.editAccount}
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl">{p.achievements}</h2>
        {error ? (
          <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
            {p.loadError(error)}
          </p>
        ) : !stats ? (
          <div className="flex justify-center py-10" role="status">
            <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
            <span className="sr-only">{t.common.loading}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              icon={stats.streak.frozen ? Snowflake : Flame}
              iconClass={stats.streak.frozen ? 'bg-ice-soft text-ice-deep' : 'bg-gold-soft text-accent'}
              value={String(stats.streak.days)}
              label={stats.streak.frozen ? p.stats.streakFrozen : p.stats.streak}
              onClick={() => setShowStreak(true)}
              actionLabel={t.celebration.open(stats.streak.days)}
            />
            <StatCard icon={Book} iconClass="bg-info-soft text-info" value={String(stats.words)} label={p.stats.words} />
            <StatCard icon={Check} iconClass="bg-success-soft text-success" value={String(stats.mastered)} label={p.stats.mastered} />
            <StatCard icon={Repeat} iconClass="bg-accent-soft text-accent" value={String(stats.reviews)} label={p.stats.reviews} />
          </div>
        )}
      </section>

      {showStreak && stats && (
        <StreakCelebration
          to={stats.streak.days}
          studiedToday={stats.streak.studiedToday}
          thawedToday={stats.streak.thawedToday}
          state={stats.streak.frozen ? 'frozen' : undefined}
          onClose={() => setShowStreak(false)}
        />
      )}
    </div>
  )
}
