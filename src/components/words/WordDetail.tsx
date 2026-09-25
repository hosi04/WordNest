import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import type { Deck, Word } from '../../lib/db'
import { memoryLevel } from '../../lib/wordStatus'
import { SpeakButton } from '../SpeakButton'

interface Props {
  word: Word
  deck: Deck | undefined
  onEdit: () => void
}

const LABEL = 'mt-5 text-xs font-semibold tracking-wider text-ink-muted uppercase'

export function WordDetail({ word, deck, onEdit }: Props) {
  const { t } = useI18n()
  const d = t.words.detail
  const level = memoryLevel(word.interval_days)
  const meta = [word.ipa, word.part_of_speech, word.level].filter(Boolean).join(' · ')

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-4xl break-words">{word.word}</h2>
          {meta && <p className="mt-1 text-ink-muted">{meta}</p>}
          {deck && <p className="mt-1 text-sm text-ink-muted">{d.deck(deck.name)}</p>}
        </div>
        <SpeakButton text={word.word} />
      </div>

      <p className={LABEL}>{d.meaning}</p>
      <p className="mt-1 text-xl font-semibold text-accent">{word.meaning_vi}</p>
      {word.definition_en && <p className="mt-1 text-ink-muted">{word.definition_en}</p>}

      {word.examples.length > 0 && (
        <>
          <p className={LABEL}>{d.examples}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {word.examples.map((ex, i) => (
              <li key={i} className="rounded-control bg-soft px-4 py-3">
                <p className="italic">“{ex.en}”</p>
                {ex.vi && <p className="mt-1 text-sm text-ink-muted">{ex.vi}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      {word.synonyms.length > 0 && (
        <>
          <p className={LABEL}>{d.synonyms}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {word.synonyms.map((s) => (
              <li key={s} className="rounded-full border border-line px-3 py-1 text-sm font-medium">
                {s}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={`${LABEL} flex justify-between`}>
        <span>{d.memory}</span>
        <span className="text-ink">{level} / 5</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1.5 rounded-full ${n <= level ? 'bg-success' : 'bg-soft'}`} />
        ))}
      </div>

      <div className="mt-auto flex gap-3 pt-8">
        <Link
          to={`/study?word=${word.id}`}
          className="flex min-h-12 flex-1 items-center justify-center rounded-control bg-ink px-5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          {d.reviewThis}
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="min-h-12 rounded-control border border-line bg-white px-6 font-semibold transition-colors hover:bg-soft"
        >
          {d.edit}
        </button>
      </div>
    </div>
  )
}
