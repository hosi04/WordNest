import { useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { formatInterval, RATINGS, review, type Rating } from '../../lib/srs'

const STYLES: Record<Rating, string> = {
  1: 'border-accent/30 bg-accent-soft text-accent',
  2: 'border-gold bg-gold-soft text-ink',
  3: 'border-success/30 bg-success-soft text-success',
  4: 'border-info/30 bg-info-soft text-info',
}

interface Props {
  word: Word
  disabled: boolean
  onRate: (rating: Rating) => void
}

export function RatingButtons({ word, disabled, onRate }: Props) {
  // Fixed when the buttons appear, so the previews don't shift while the card is shown.
  const [now] = useState(() => Date.now())
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => onRate(rating)}
          aria-keyshortcuts={String(rating)}
          className={`flex min-h-16 flex-col items-center justify-center rounded-card border px-1 py-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${STYLES[rating]}`}
        >
          <span className="font-bold">{t.ratings[rating]}</span>
          <span className="text-xs opacity-80">{formatInterval(review(word, rating, now).due_at, now, t.interval)}</span>
        </button>
      ))}
    </div>
  )
}
