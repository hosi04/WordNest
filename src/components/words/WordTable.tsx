import { useI18n } from '../../i18n/I18nContext'
import type { Word } from '../../lib/db'
import { daysUntilReview, wordStatus } from '../../lib/wordStatus'
import { LevelBadge, StatusBadge } from './badges'

interface Props {
  words: Word[]
  selectedId: string | null
  onSelect: (word: Word) => void
}

const TH = 'px-4 py-3 text-left text-xs font-semibold tracking-wider text-ink-muted uppercase'

export function WordTable({ words, selectedId, onSelect }: Props) {
  const { t } = useI18n()
  const c = t.words.columns
  if (words.length === 0) {
    return <p className="p-10 text-center text-ink-muted">{t.words.empty}</p>
  }

  return (
    <table className="w-full">
      <thead className="border-b border-line">
        <tr>
          <th className={`${TH} pl-6`}>{c.word}</th>
          <th className={`${TH} hidden md:table-cell`}>{c.meaning}</th>
          <th className={`${TH} hidden sm:table-cell`}>{c.level}</th>
          <th className={TH}>{c.status}</th>
          <th className={`${TH} hidden xl:table-cell`}>{c.nextReview}</th>
        </tr>
      </thead>
      <tbody>
        {words.map((w) => {
          const selected = w.id === selectedId
          return (
            <tr
              key={w.id}
              onClick={() => onSelect(w)}
              className={`cursor-pointer border-b border-line transition-colors ${
                selected ? 'bg-accent-soft' : 'hover:bg-soft/60'
              }`}
            >
              <td
                className={`border-l-4 py-3 pr-4 pl-5 ${selected ? 'border-accent' : 'border-transparent'}`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(w)
                  }}
                  aria-pressed={selected}
                  className="text-left"
                >
                  <span className="block font-display text-lg leading-tight">{w.word}</span>
                  {w.ipa && <span className="block text-sm text-ink-muted">{w.ipa}</span>}
                  <span className="mt-1 block text-sm md:hidden">{w.meaning_vi}</span>
                </button>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">{w.meaning_vi}</td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <LevelBadge level={w.level} />
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={wordStatus(w)} />
              </td>
              <td className="hidden px-4 py-3 text-sm text-ink-muted xl:table-cell">
                {t.words.nextReview(daysUntilReview(w))}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
