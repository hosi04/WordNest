import { FileUp, LoaderCircle } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import type { Messages } from '../../i18n/vi'
import { CSV_COLUMNS, wordsFromCsv, type CsvError, type CsvResult } from '../../lib/csv'
import { importWords, type Deck } from '../../lib/db'
import { INPUT, PRIMARY_BTN, SettingsSection, StatusText } from './SettingsSection'

interface Props {
  decks: Deck[]
  existingWords: Set<string> // lowercase words already in the notebook
  onImported: () => void
}

type Status = { kind: 'ok' | 'error'; text: string } | null

const MAX_ERRORS_SHOWN = 8

function describeError(err: CsvError, m: Messages['settings']['csv']['errors']): string {
  switch (err.kind) {
    case 'empty':
      return m.empty
    case 'missingColumns':
      return m.missingColumns(err.columns.join(', '))
    case 'missingFields':
      return m.missingFields(err.line)
    case 'duplicate':
      return m.duplicate(err.line, err.word)
    case 'badLevel':
      return m.badLevel(err.line, err.level)
  }
}

export function CsvImport({ decks, existingWords, onImported }: Props) {
  const { t } = useI18n()
  const m = t.settings.csv
  const [deckId, setDeckId] = useState(decks[0]?.id ?? '')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<CsvResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setStatus(null)
    setParsed(null)
    setFileName(file?.name ?? '')
    if (file) setParsed(wordsFromCsv(await file.text()))
  }

  const duplicates = parsed?.words.filter((w) => existingWords.has(w.word.toLowerCase())).length ?? 0
  const toAdd = (parsed?.words.length ?? 0) - duplicates

  async function handleImport() {
    if (!parsed) return
    setImporting(true)
    setStatus(null)
    try {
      const added = await importWords(parsed.words.map((w) => ({ ...w, deck_id: deckId || null })))
      const skipped = parsed.words.length - added
      setStatus({ kind: 'ok', text: m.done(added, skipped) })
      setParsed(null)
      setFileName('')
      onImported()
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setImporting(false)
    }
  }

  return (
    <SettingsSection title={m.title} description={m.description(CSV_COLUMNS.join(', '))}>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="csv-deck" className="mb-1.5 block text-sm font-medium">
            {m.deck}
          </label>
          <select id="csv-deck" value={deckId} onChange={(e) => setDeckId(e.target.value)} className={INPUT}>
            <option value="">{t.words.form.noDeck}</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-control border-2 border-dashed border-line bg-white px-4 py-4 text-center hover:border-accent focus-within:border-accent">
          <FileUp className="size-6 text-ink-muted" aria-hidden />
          <span className="font-semibold">{fileName || m.choose}</span>
          <span className="text-sm text-ink-muted">{m.hint}</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
        </label>

        {parsed && (
          <div className="rounded-control bg-soft px-4 py-3 text-sm">
            <p className="font-semibold">
              {m.valid(parsed.words.length)}
              {duplicates > 0 && m.duplicates(duplicates)}
            </p>
            {parsed.errors.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-accent">
                {parsed.errors.slice(0, MAX_ERRORS_SHOWN).map((err, i) => (
                  <li key={i}>{describeError(err, m.errors)}</li>
                ))}
                {parsed.errors.length > MAX_ERRORS_SHOWN && (
                  <li>{m.moreErrors(parsed.errors.length - MAX_ERRORS_SHOWN)}</li>
                )}
              </ul>
            )}
          </div>
        )}

        {parsed && toAdd > 0 && (
          <button type="button" onClick={handleImport} disabled={importing} className={`${PRIMARY_BTN} self-start`}>
            {importing && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {m.import(toAdd)}
          </button>
        )}
        <StatusText status={status} />
      </div>
    </SettingsSection>
  )
}
