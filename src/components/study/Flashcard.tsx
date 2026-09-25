import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { SpeakButton } from '../SpeakButton'
import { HighlightedText } from './HighlightedText'

interface Props {
  word: Word
  flipped: boolean
  onFlip: () => void
}

const FACE =
  'relative col-start-1 row-start-1 flex flex-col rounded-flashcard border border-line bg-white p-6 shadow-[0_18px_40px_-20px_rgb(30_42_58/0.25)] backface-hidden sm:p-10'

function Chip({ word }: { word: Word }) {
  const text = [word.part_of_speech, word.level].filter(Boolean).join(' · ')
  if (!text) return null
  return <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold">{text}</span>
}

export function Flashcard({ word, flipped, onFlip }: Props) {
  const { t } = useI18n()
  return (
    <div className="perspective-distant">
      <div
        onClick={onFlip}
        className={`grid cursor-pointer transition-transform duration-500 transform-3d ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <section
          aria-hidden={flipped}
          inert={flipped}
          className={`${FACE} min-h-[340px] items-center justify-center text-center sm:min-h-[420px]`}
        >
          <div className="absolute top-5 right-5" onClick={(e) => e.stopPropagation()}>
            <SpeakButton text={word.word} />
          </div>
          <Chip word={word} />
          <h2 className="mt-5 text-5xl break-words sm:text-7xl">{word.word}</h2>
          {word.ipa && <p className="mt-4 text-lg text-ink-muted">{word.ipa}</p>}
          <p className="mt-10 text-sm text-ink-muted">{t.study.hint}</p>
        </section>

        {/* Back */}
        <section
          aria-hidden={!flipped}
          inert={!flipped}
          className={`${FACE} min-h-[340px] rotate-y-180 sm:min-h-[420px]`}
        >
          <div className="flex items-start justify-between gap-3">
            <Chip word={word} />
            <div onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={word.word} />
            </div>
          </div>
          <h2 className="mt-4 text-4xl break-words sm:text-5xl">{word.word}</h2>
          {word.ipa && <p className="mt-1 text-ink-muted">{word.ipa}</p>}

          <hr className="my-5 border-line" />

          <p className="font-display text-3xl font-semibold text-accent">{word.meaning_vi}</p>
          {word.definition_en && <p className="mt-2 text-ink-muted">{word.definition_en}</p>}

          {word.examples.length > 0 && (
            <ul className="mt-auto flex flex-col gap-2 pt-6">
              {word.examples.map((ex, i) => (
                <li key={i} className="rounded-card bg-soft px-5 py-4">
                  <p className="italic">
                    “<HighlightedText text={ex.en} term={word.word} />”
                  </p>
                  {ex.vi && <p className="mt-1 text-sm text-ink-muted">{ex.vi}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
