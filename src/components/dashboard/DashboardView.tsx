import { Check, Copy, Flame, Target } from 'lucide-react'
import type { Word } from '../../lib/db'
import { useI18n } from '../../i18n/I18nContext'
import type { DayCount, DeckProgress, PartOfDay } from '../../lib/stats'
import { DashboardHeader } from './DashboardHeader'
import { DeckList } from './DeckList'
import { ReviewTodayCard } from './ReviewTodayCard'
import { StatCard } from './StatCard'
import { WeeklyChart } from './WeeklyChart'
import { WordOfTheDayCard } from './WordOfTheDayCard'

export interface DashboardData {
  today: string
  partOfDay: PartOfDay
  streak: number
  mastered: number
  due: Word[]
  newAvailable: number
  accuracy: number | null
  wordOfDay: Word | null
  decks: DeckProgress[]
  week: DayCount[]
  weekTotal: number
  weekChange: number | null
}

export function DashboardView({ data, userName }: { data: DashboardData; userName: string }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <DashboardHeader
        date={t.date.long(data.today)}
        greeting={t.dashboard.greeting[data.partOfDay]}
        userName={userName}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={Flame} iconClass="bg-gold-soft text-accent" value={String(data.streak)} label={t.dashboard.stats.streak} />
        <StatCard icon={Check} iconClass="bg-success-soft text-success" value={String(data.mastered)} label={t.dashboard.stats.mastered} />
        <StatCard icon={Copy} iconClass="bg-accent-soft text-accent" value={String(data.due.length)} label={t.dashboard.stats.due} />
        <StatCard
          icon={Target}
          iconClass="bg-info-soft text-info"
          value={data.accuracy === null ? '—' : `${data.accuracy}%`}
          label={t.dashboard.stats.accuracy}
        />
      </div>

      {/* Two independent columns so a short section never leaves a gap beside a tall one. */}
      <div className="grid items-start gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:gap-8">
          <ReviewTodayCard
            dueCount={data.due.length}
            newAvailable={data.newAvailable}
            preview={data.due[0] ?? data.wordOfDay}
          />
          <DeckList decks={data.decks} />
        </div>
        <div className="flex flex-col gap-6 lg:gap-8">
          <WordOfTheDayCard word={data.wordOfDay} />
          <WeeklyChart days={data.week} total={data.weekTotal} change={data.weekChange} />
        </div>
      </div>
    </div>
  )
}
