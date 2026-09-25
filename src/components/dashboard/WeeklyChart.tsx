import { useI18n } from '../../i18n/I18nContext'
import type { DayCount } from '../../lib/stats'

interface Props {
  days: DayCount[] // oldest first, last = today
  total: number
  change: number | null // % vs previous 7 days
}

const MIN_BAR = 6 // px, keeps empty days visible as a stub

export function WeeklyChart({ days, total, change }: Props) {
  const { t } = useI18n()
  const max = Math.max(1, ...days.map((d) => d.count))
  const todayIndex = days.length - 1
  const trend = change === null ? '' : change >= 0 ? t.dashboard.week.up(change) : t.dashboard.week.down(-change)

  return (
    <section className="flex flex-col rounded-card border border-line bg-card p-6 sm:p-7">
      <h2 className="text-2xl sm:text-3xl">{t.dashboard.week.title}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {t.dashboard.week.reviews(total)}
        {trend}
      </p>

      <div className="mt-8 flex h-40 items-end gap-2 sm:gap-3" aria-hidden>
        {days.map((d, i) => {
          const isToday = i === todayIndex
          const height = d.count ? `max(${MIN_BAR}px, ${(d.count / max) * 100}%)` : `${MIN_BAR}px`
          return (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {t.dashboard.week.tooltip(d.count)}
              </span>
              <div
                className={`w-full rounded-t-[4px] rounded-b-sm transition-colors ${
                  isToday ? 'bg-accent' : 'bg-line group-hover:bg-ink-muted/40'
                }`}
                style={{ height }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3" aria-hidden>
        {days.map((d, i) => (
          <span
            key={d.day}
            className={`flex-1 text-center text-sm ${i === todayIndex ? 'font-bold text-ink' : 'text-ink-muted'}`}
          >
            {t.date.weekdayShort(d.day)}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{t.dashboard.week.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.dashboard.week.day}</th>
            <th scope="col">{t.dashboard.week.count}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d, i) => (
            <tr key={d.day}>
              <th scope="row">
                {d.day}
                {i === todayIndex && t.dashboard.week.today}
              </th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
