import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { estimateMinutes } from '../../lib/stats'

interface Props {
  dueCount: number
  newAvailable: number
  preview: Word | null
}

const SECONDARY_BTN =
  'flex min-h-12 items-center rounded-control bg-card px-5 font-semibold transition-colors hover:bg-white'

export function ReviewTodayCard({ dueCount, newAvailable, preview }: Props) {
  const { t } = useI18n()
  return (
    <section className="@container rounded-card bg-accent-soft p-6 sm:p-9">
      <div className="flex items-center gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wider text-accent uppercase">{t.dashboard.review.eyebrow}</p>
          {dueCount > 0 ? (
            <>
              <h2 className="mt-3 text-3xl sm:text-4xl">{t.dashboard.review.waiting(dueCount)}</h2>
              <p className="mt-3 max-w-md text-ink-muted">
                {t.dashboard.review.estimate(estimateMinutes(dueCount))}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-3xl sm:text-4xl">{t.dashboard.review.allDone}</h2>
              <p className="mt-3 max-w-md text-ink-muted">
                {newAvailable > 0 ? t.dashboard.review.learnMoreHint : t.dashboard.review.seeYouTomorrow}
              </p>
            </>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {dueCount > 0 && (
              <Link
                to="/study?only=due"
                className="flex min-h-12 items-center gap-2 rounded-control bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                {t.dashboard.review.start}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            )}
            {newAvailable > 0 && (
              <Link to="/study?only=new" className={SECONDARY_BTN}>
                {t.dashboard.review.learnNew(newAvailable)}
              </Link>
            )}
            {dueCount === 0 && newAvailable === 0 && (
              <Link to="/quiz" className={SECONDARY_BTN}>
                {t.dashboard.review.takeQuiz}
              </Link>
            )}
          </div>
        </div>

        {/* Decorative card stack — only when the block is wide enough to fit it beside the text. */}
        {preview && (
          <div className="relative mr-4 hidden w-52 shrink-0 @xl:block" aria-hidden>
            <div className="absolute inset-0 translate-x-3 -translate-y-3 rotate-6 rounded-card bg-card/80" />
            <div className="relative -rotate-3 rounded-card bg-white px-5 py-9 text-center shadow-[0_18px_40px_-20px_rgb(30_42_58/0.35)]">
              <p className="font-display text-2xl font-semibold break-words">{preview.word}</p>
              {preview.ipa && <p className="mt-1 text-sm text-ink-muted">{preview.ipa}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
