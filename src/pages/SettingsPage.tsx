import { LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AccountSection } from '../components/settings/AccountSection'
import { BackupSection } from '../components/settings/BackupSection'
import { CsvImport } from '../components/settings/CsvImport'
import { DeckManager } from '../components/settings/DeckManager'
import { LanguageSection } from '../components/settings/LanguageSection'
import { StudySection } from '../components/settings/StudySection'
import { useI18n } from '../i18n/I18nContext'
import { getSettings, listDecks, listWords, type Deck, type Settings, type Word } from '../lib/db'

export function SettingsPage() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [error, setError] = useState('')

  const reloadWords = useCallback(() => {
    listWords()
      .then(setWords)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), listDecks(), listWords()])
      .then(([s, d, w]) => {
        if (cancelled) return
        setSettings(s)
        setDecks(d)
        setWords(w)
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
    }
  }, [])

  const wordCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of words) if (w.deck_id) counts.set(w.deck_id, (counts.get(w.deck_id) ?? 0) + 1)
    return counts
  }, [words])

  const existingWords = useMemo(() => new Set(words.map((w) => w.word.toLowerCase())), [words])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl md:text-5xl">{t.settings.title}</h1>

      {error && (
        <p className="rounded-card bg-accent-soft p-6 text-accent" role="alert">
          {t.settings.loadError(error)}
        </p>
      )}

      {!settings && !error ? (
        <div className="flex justify-center py-20" role="status">
          <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
          <span className="sr-only">{t.settings.loading}</span>
        </div>
      ) : (
        settings && (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <div className="flex flex-col gap-6">
              <LanguageSection />
              <AccountSection />
              <StudySection initialNewPerDay={settings.new_per_day} />
              <BackupSection />
            </div>
            <div className="flex flex-col gap-6">
              <DeckManager decks={decks} wordCounts={wordCounts} onChange={setDecks} />
              <CsvImport decks={decks} existingWords={existingWords} onImported={reloadWords} />
            </div>
          </div>
        )
      )}
    </div>
  )
}
