import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'

interface Props {
  date: string
  greeting: string
  userName: string
}

export function DashboardHeader({ date, greeting, userName }: Props) {
  const { t } = useI18n()
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-muted">{date}</p>
        {/* Kept on one line on desktop; the user chip wraps below when there is no room. */}
        <h1 className="mt-1 text-3xl sm:text-4xl lg:whitespace-nowrap 2xl:text-5xl">
          {greeting} {t.dashboard.question}
        </h1>
      </div>
      {userName && (
        <Link
          to="/settings"
          aria-label={t.dashboard.account(userName)}
          className="flex min-h-12 max-w-full items-center gap-3 rounded-full border border-line bg-card py-1.5 pr-5 pl-1.5 transition-colors hover:bg-white"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent uppercase"
            aria-hidden
          >
            {userName[0]}
          </span>
          <span className="truncate font-semibold">{userName}</span>
        </Link>
      )}
    </header>
  )
}
