import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { SpeakButton } from '../SpeakButton'
import { HighlightedText } from '../study/HighlightedText'

export function WordOfTheDayCard({ word }: { word: Word | null }) {
  const { t } = useI18n()
  return (
    <section className="rounded-card border border-line bg-card p-6 sm:p-7">
      <p className="text-xs font-bold tracking-wider text-info uppercase">{t.dashboard.wordOfDay.title}</p>
      {word ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <h2 className="text-4xl break-words">{word.word}</h2>
            <SpeakButton text={word.word} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-ink-muted">
            {word.ipa && <span>{word.ipa}</span>}
            {word.part_of_speech && (
              <span className="rounded-md bg-soft px-2 py-0.5 text-xs font-semibold text-ink">
                {word.part_of_speech}
              </span>
            )}
            {word.level && (
              <span className="rounded-md bg-soft px-2 py-0.5 text-xs font-semibold text-ink">{word.level}</span>
            )}
          </div>
          <p className="mt-4 text-lg font-semibold">{word.meaning_vi}</p>
          {word.examples[0] && (
            <p className="mt-3 text-ink-muted italic">
              “<HighlightedText text={word.examples[0].en} term={word.word} />”
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-ink-muted">{t.dashboard.wordOfDay.empty}</p>
      )}
    </section>
  )
}
