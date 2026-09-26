import { LoaderCircle, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { WordDetail } from '../components/words/WordDetail'
import { WordFormDialog } from '../components/words/WordFormDialog'
import { WordTable } from '../components/words/WordTable'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ensureSampleData, listDecks, listWords, type Deck, type Word } from '../lib/db'
import { useI18n } from '../i18n/I18nContext'
import { normalizeSearch, wordStatus, type WordStatus } from '../lib/wordStatus'

type Filter = 'all' | WordStatus
type DialogState = { mode: 'create' } | { mode: 'edit'; word: Word } | null

const FILTERS: Filter[] = ['all', 'new', 'learning', 'mastered']

function byWord(a: Word, b: Word) {
  return a.word.localeCompare(b.word, 'en', { sensitivity: 'base' })
}

export function WordsPage() {
  const { t } = useI18n()
  const [words, setWords] = useState<Word[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)
  const isWide = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    ensureSampleData()
      .then(() => Promise.all([listDecks(), listWords()]))
      .then(([d, w]) => {
        setDecks(d)
        setWords(w)
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: words.length, new: 0, learning: 0, mastered: 0 }
    for (const w of words) c[wordStatus(w)]++
    return c
  }, [words])

  const visible = useMemo(() => {
    const q = normalizeSearch(query)
    return words.filter(
      (w) =>
        (filter === 'all' || wordStatus(w) === filter) &&
        (!q || normalizeSearch(w.word).includes(q) || normalizeSearch(w.meaning_vi).includes(q)),
    )
  }, [words, query, filter])

  // On wide screens the detail panel always shows something; on narrow ones it opens on tap.
  const selected =
    words.find((w) => w.id === selectedId) ?? (isWide ? visible[0] : undefined) ?? null

  function handleSaved(saved: Word) {
    setWords((ws) => [...ws.filter((w) => w.id !== saved.id), saved].sort(byWord))
    setSelectedId(saved.id)
    setDialog(null)
  }

  function handleDeleted(id: string) {
    setWords((ws) => ws.filter((w) => w.id !== id))
    setSelectedId(null)
    setDialog(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20" role="status">
        <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
        <span className="sr-only">{t.words.loading}</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
        {t.words.loadError(loadError)}
      </p>
    )
  }

  const detail = selected && (
    <WordDetail
      word={selected}
      deck={decks.find((d) => d.id === selected.deck_id)}
      onEdit={() => setDialog({ mode: 'edit', word: selected })}
    />
  )

  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl">{t.words.title}</h1>
          <p className="mt-1 text-ink-muted">
            {t.words.summary(counts.all, counts.mastered)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ mode: 'create' })}
          className="flex min-h-12 items-center gap-2 rounded-control bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="size-5" aria-hidden />
          {t.words.add}
        </button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative w-full md:w-80">
          <span className="sr-only">{t.words.searchLabel}</span>
          <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.words.searchPlaceholder}
            className="min-h-12 w-full rounded-control border border-line bg-card pr-4 pl-11 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.words.filterLabel}>
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                filter === value
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-card hover:bg-soft'
              }`}
            >
              {value === 'all' ? t.words.all : t.status[value]} · {counts[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-card border border-line bg-card">
          <WordTable words={visible} selectedId={selected?.id ?? null} onSelect={(w) => setSelectedId(w.id)} />
        </div>

        {isWide && detail && (
          <aside className="sticky top-6 rounded-card border border-line bg-card p-7">{detail}</aside>
        )}
      </div>

      {!isWide && detail && (
        <div className="fixed inset-0 z-20 flex items-end bg-ink/50" onClick={() => setSelectedId(null)}>
          <aside
            aria-label={t.words.detail.aria(selected.word)}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-card bg-card p-6 pb-[calc(1.5rem_+_var(--safe-bottom))]"
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={t.words.detail.close}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-control text-ink-muted hover:bg-soft"
            >
              <X className="size-5" aria-hidden />
            </button>
            <div className="pt-8">{detail}</div>
          </aside>
        </div>
      )}

      {dialog && (
        <WordFormDialog
          word={dialog.mode === 'edit' ? dialog.word : null}
          decks={decks}
          existingWords={words}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  )
}
