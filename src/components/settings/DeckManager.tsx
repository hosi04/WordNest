import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { deleteDeck, type Deck } from '../../lib/db'
import { DeckFormDialog } from './DeckFormDialog'
import { SECONDARY_BTN, SettingsSection } from './SettingsSection'

interface Props {
  decks: Deck[]
  wordCounts: Map<string, number>
  onChange: (decks: Deck[]) => void
}

type DialogState = { deck: Deck | null } | null

export function DeckManager({ decks, wordCounts, onChange }: Props) {
  const { t } = useI18n()
  const m = t.settings.decks
  const [dialog, setDialog] = useState<DialogState>(null)
  const [error, setError] = useState('')

  function handleSaved(saved: Deck) {
    const exists = decks.some((d) => d.id === saved.id)
    onChange(exists ? decks.map((d) => (d.id === saved.id ? saved : d)) : [...decks, saved])
    setDialog(null)
  }

  async function handleDelete(deck: Deck) {
    if (!window.confirm(m.confirmDelete(deck.name, wordCounts.get(deck.id) ?? 0))) return
    setError('')
    try {
      await deleteDeck(deck.id)
      onChange(decks.filter((d) => d.id !== deck.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <SettingsSection title={m.title} description={m.description}>
      {decks.length === 0 ? (
        <p className="text-ink-muted">{m.empty}</p>
      ) : (
        <ul className="divide-y divide-line rounded-control border border-line bg-white">
          {decks.map((deck) => (
            <li key={deck.id} className="flex items-center gap-3 py-2 pr-2 pl-4">
              <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: deck.color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{deck.name}</p>
                <p className="text-sm text-ink-muted">{m.words(wordCounts.get(deck.id) ?? 0)}</p>
              </div>
              <button
                type="button"
                onClick={() => setDialog({ deck })}
                aria-label={m.edit(deck.name)}
                className="flex size-11 items-center justify-center rounded-control text-ink-muted hover:bg-soft"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deck)}
                aria-label={m.delete(deck.name)}
                className="flex size-11 items-center justify-center rounded-control text-accent hover:bg-accent-soft"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 text-sm text-accent" role="alert">
          {m.deleteError(error)}
        </p>
      )}

      <button type="button" onClick={() => setDialog({ deck: null })} className={`${SECONDARY_BTN} mt-4`}>
        <Plus className="size-5" aria-hidden />
        {m.add}
      </button>

      {dialog && <DeckFormDialog deck={dialog.deck} onSaved={handleSaved} onClose={() => setDialog(null)} />}
    </SettingsSection>
  )
}
