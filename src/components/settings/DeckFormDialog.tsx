import { Check, LoaderCircle, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { createDeck, updateDeck, type Deck } from '../../lib/db'
import { DECK_COLORS, DEFAULT_DECK_COLOR } from '../../lib/deckColors'
import { INPUT, PRIMARY_BTN, SECONDARY_BTN } from './SettingsSection'

interface Props {
  deck: Deck | null // null = new deck
  onSaved: (deck: Deck) => void
  onClose: () => void
}

export function DeckFormDialog({ deck, onSaved, onClose }: Props) {
  const { t } = useI18n()
  const m = t.settings.decks
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState(deck?.name ?? '')
  const [color, setColor] = useState(deck?.color ?? DEFAULT_DECK_COLOR)
  const [description, setDescription] = useState(deck?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const input = { name: name.trim(), color, description: description.trim() || null }
    try {
      onSaved(deck ? await updateDeck(deck.id, input) : await createDeck(input))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="deck-form-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="deck-form-title" className="text-2xl">
            {deck ? m.editTitle : m.addTitle}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t.common.close}
            className="flex size-11 items-center justify-center rounded-control text-ink-muted hover:bg-soft"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label htmlFor="deck-name" className="mb-1.5 block text-sm font-medium">
              {m.name}
            </label>
            <input
              id="deck-name"
              required
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT}
              placeholder={m.namePlaceholder}
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">{m.color}</legend>
            <div className="flex flex-wrap gap-2">
              {DECK_COLORS.map((c) => (
                <label key={c.value} className="cursor-pointer" title={m.colors[c.id]}>
                  <input
                    type="radio"
                    name="deck-color"
                    value={c.value}
                    checked={color === c.value}
                    onChange={() => setColor(c.value)}
                    className="peer sr-only"
                  />
                  <span className="sr-only">{m.colors[c.id]}</span>
                  <span
                    className="flex size-11 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-card peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
                    style={{ backgroundColor: c.value }}
                    aria-hidden
                  >
                    {color === c.value && <Check className="size-5" />}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="deck-description" className="mb-1.5 block text-sm font-medium">
              {m.descriptionLabel}
            </label>
            <input
              id="deck-description"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={INPUT}
            />
          </div>

          {error && (
            <p className="rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={() => dialogRef.current?.close()} className={SECONDARY_BTN}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving || !name.trim()} className={PRIMARY_BTN}>
            {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {deck ? t.common.save : m.add}
          </button>
        </div>
      </form>
    </dialog>
  )
}
