import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import type { DeckProgress } from '../../lib/stats'

/** "Giao tiếp hằng ngày" → "Gt" */
function initials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/)
  return (first.charAt(0).toUpperCase() + second.charAt(0).toLowerCase()) || '?'
}

export function DeckList({ decks }: { decks: DeckProgress[] }) {
  const { t } = useI18n()
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl">{t.dashboard.decks.title}</h2>
        <Link to="/words" className="shrink-0 font-semibold text-accent hover:text-accent-hover">
          {t.dashboard.decks.seeAll}
        </Link>
      </div>

      {decks.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line bg-card p-6 text-ink-muted">
          {t.dashboard.decks.empty}
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {decks.map(({ deck, total, percent, levels }) => (
            <li key={deck.id}>
              <Link
                to={`/study/${deck.id}`}
                className="block rounded-card border border-line bg-card p-5 transition-colors hover:border-ink/20 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-control font-bold"
                    style={{ color: deck.color, backgroundColor: `color-mix(in srgb, ${deck.color} 14%, white)` }}
                    aria-hidden
                  >
                    {initials(deck.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{deck.name}</p>
                    <p className="text-sm text-ink-muted">
                      {t.dashboard.decks.words(total)}
                      {levels && ` · ${levels}`}
                    </p>
                  </div>
                  <span className="font-bold">{percent}%</span>
                </div>
                <div
                  className="mt-4 h-1.5 rounded-full bg-soft"
                  role="progressbar"
                  aria-label={t.dashboard.decks.masteredAria(percent, deck.name)}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: deck.color }} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
