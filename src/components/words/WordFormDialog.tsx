import { LoaderCircle, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import type { Messages } from '../../i18n/vi'
import {
  createWord,
  deleteWord,
  DuplicateWordError,
  LEVELS,
  updateWord,
  type Deck,
  type Example,
  type Level,
  type Word,
  type WordInput,
} from '../../lib/db'
import { DictionaryError, lookupWord } from '../../lib/dictionary'

interface Props {
  word: Word | null // null = add new
  decks: Deck[]
  existingWords: Word[]
  onSaved: (word: Word) => void
  onDeleted: (id: string) => void
  onClose: () => void
}

interface FormState {
  word: string
  meaning_vi: string
  ipa: string
  part_of_speech: string
  level: Level | ''
  deck_id: string
  definition_en: string
  examples: Example[]
  synonyms: string
}

type LookupStatus =
  | { kind: 'idle' | 'loading' | 'done' | 'notFound' | 'failed' }
  | { kind: 'down'; status: number }

function lookupError(lookup: LookupStatus, t: Messages): string | null {
  if (lookup.kind === 'notFound') return t.words.form.notFound
  if (lookup.kind === 'down') return t.words.form.dictionaryDown(lookup.status)
  if (lookup.kind === 'failed') return t.words.form.lookupFailed
  return null
}

function toForm(w: Word | null, defaultDeckId: string): FormState {
  return {
    word: w?.word ?? '',
    meaning_vi: w?.meaning_vi ?? '',
    ipa: w?.ipa ?? '',
    part_of_speech: w?.part_of_speech ?? '',
    level: w?.level ?? '',
    deck_id: w ? (w.deck_id ?? '') : defaultDeckId,
    definition_en: w?.definition_en ?? '',
    examples: w?.examples.length ? w.examples : [{ en: '', vi: '' }],
    synonyms: w?.synonyms.join(', ') ?? '',
  }
}

function toInput(form: FormState): WordInput {
  const orNull = (s: string) => s.trim() || null
  return {
    word: form.word.trim(),
    meaning_vi: form.meaning_vi.trim(),
    ipa: orNull(form.ipa),
    part_of_speech: orNull(form.part_of_speech),
    level: form.level || null,
    deck_id: form.deck_id || null,
    definition_en: orNull(form.definition_en),
    examples: form.examples
      .map((ex) => ({ en: ex.en.trim(), vi: ex.vi?.trim() ?? '' }))
      .filter((ex) => ex.en),
    synonyms: form.synonyms
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

const INPUT =
  'min-h-11 w-full rounded-control border border-line bg-white px-3.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft'

export function WordFormDialog({ word, decks, existingWords, onSaved, onDeleted, onClose }: Props) {
  const { t } = useI18n()
  const f = t.words.form
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [form, setForm] = useState(() => toForm(word, decks[0]?.id ?? ''))
  const [lookup, setLookup] = useState<LookupStatus>({ kind: 'idle' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const lookedUp = useRef('')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const normalized = form.word.trim().toLowerCase()
  const isDuplicate =
    normalized !== '' &&
    existingWords.some((w) => w.id !== word?.id && w.word.toLowerCase() === normalized)

  async function autofill() {
    const query = form.word.trim()
    if (!query) return
    lookedUp.current = query.toLowerCase()
    setLookup({ kind: 'loading' })
    try {
      const result = await lookupWord(query)
      if (!result) {
        setLookup({ kind: 'notFound' })
        return
      }
      // Only fill fields the user has not typed into.
      setForm((prev) => ({
        ...prev,
        ipa: prev.ipa || result.ipa || '',
        part_of_speech: prev.part_of_speech || result.partOfSpeech || '',
        definition_en: prev.definition_en || result.definition || '',
        synonyms: prev.synonyms || result.synonyms.join(', '),
        examples:
          result.example && !prev.examples.some((ex) => ex.en.trim())
            ? [{ en: result.example, vi: '' }]
            : prev.examples,
      }))
      setLookup({ kind: 'done' })
    } catch (err) {
      setLookup(err instanceof DictionaryError ? { kind: 'down', status: err.status } : { kind: 'failed' })
    }
  }

  function handleWordBlur() {
    if (!word && form.word.trim() && form.word.trim().toLowerCase() !== lookedUp.current) {
      void autofill()
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isDuplicate) return
    setSaving(true)
    setError('')
    try {
      const input = toInput(form)
      onSaved(word ? await updateWord(word.id, input) : await createWord(input))
    } catch (err) {
      setError(
        err instanceof DuplicateWordError ? f.duplicateNamed(err.word) : err instanceof Error ? err.message : String(err),
      )
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!word || !window.confirm(f.confirmDelete(word.word))) return
    setSaving(true)
    try {
      await deleteWord(word.id)
      onDeleted(word.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  function updateExample(i: number, patch: Partial<Example>) {
    set(
      'examples',
      form.examples.map((ex, j) => (j === i ? { ...ex, ...patch } : ex)),
    )
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="word-form-title"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-card bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[90dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="word-form-title" className="text-2xl">
            {word ? f.editTitle : f.addTitle}
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

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <Field label={f.word} htmlFor="f-word">
            <div className="flex gap-2">
              <input
                id="f-word"
                required
                autoFocus
                autoComplete="off"
                value={form.word}
                onChange={(e) => set('word', e.target.value)}
                onBlur={handleWordBlur}
                className={INPUT}
                placeholder={f.wordPlaceholder}
              />
              <button
                type="button"
                onClick={autofill}
                disabled={!form.word.trim() || lookup.kind === 'loading'}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-control bg-info-soft px-4 font-semibold text-info disabled:opacity-50"
              >
                {lookup.kind === 'loading' ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="size-4" aria-hidden />
                )}
                {f.autofill}
              </button>
            </div>
            {isDuplicate && (
              <p className="mt-1.5 text-sm font-medium text-accent" role="alert">
                {f.duplicate}
              </p>
            )}
            {lookupError(lookup, t) && (
              <p className="mt-1.5 text-sm text-ink-muted">
                {lookupError(lookup, t)} {f.typeManually}
              </p>
            )}
            {lookup.kind === 'done' && (
              <p className="mt-1.5 text-sm text-success">{f.filled}</p>
            )}
          </Field>

          <Field label={f.meaning} htmlFor="f-meaning">
            <input
              id="f-meaning"
              required
              value={form.meaning_vi}
              onChange={(e) => set('meaning_vi', e.target.value)}
              className={INPUT}
              placeholder={f.meaningPlaceholder}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={f.ipa} htmlFor="f-ipa">
              <input id="f-ipa" value={form.ipa} onChange={(e) => set('ipa', e.target.value)} className={INPUT} />
            </Field>
            <Field label={f.partOfSpeech} htmlFor="f-pos">
              <input
                id="f-pos"
                value={form.part_of_speech}
                onChange={(e) => set('part_of_speech', e.target.value)}
                className={INPUT}
                placeholder={f.partOfSpeechPlaceholder}
              />
            </Field>
            <Field label={f.deck} htmlFor="f-deck">
              <select id="f-deck" value={form.deck_id} onChange={(e) => set('deck_id', e.target.value)} className={INPUT}>
                <option value="">{f.noDeck}</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={f.level} htmlFor="f-level">
              <select
                id="f-level"
                value={form.level}
                onChange={(e) => set('level', e.target.value as Level | '')}
                className={INPUT}
              >
                <option value="">{f.noLevel}</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={f.definition} htmlFor="f-def">
            <textarea
              id="f-def"
              rows={2}
              value={form.definition_en}
              onChange={(e) => set('definition_en', e.target.value)}
              className={`${INPUT} py-2.5`}
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium">{f.examples}</legend>
            {form.examples.map((ex, i) => (
              <div key={i} className="flex gap-2 rounded-control bg-soft p-2">
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    aria-label={f.exampleEnAria(i + 1)}
                    value={ex.en}
                    onChange={(e) => updateExample(i, { en: e.target.value })}
                    className={INPUT}
                    placeholder={f.exampleEn}
                  />
                  <input
                    aria-label={f.exampleViAria(i + 1)}
                    value={ex.vi ?? ''}
                    onChange={(e) => updateExample(i, { vi: e.target.value })}
                    className={INPUT}
                    placeholder={f.exampleVi}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => set('examples', form.examples.filter((_, j) => j !== i))}
                  aria-label={f.removeExample(i + 1)}
                  className="flex size-11 items-center justify-center self-center rounded-control text-ink-muted hover:bg-line"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('examples', [...form.examples, { en: '', vi: '' }])}
              className="flex min-h-11 items-center gap-2 self-start rounded-control px-3 font-medium text-accent hover:bg-accent-soft"
            >
              <Plus className="size-4" aria-hidden />
              {f.addExample}
            </button>
          </fieldset>

          <Field label={f.synonyms} htmlFor="f-syn">
            <input id="f-syn" value={form.synonyms} onChange={(e) => set('synonyms', e.target.value)} className={INPUT} />
          </Field>

          {error && (
            <p className="rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-6 py-4">
          {word && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex min-h-11 items-center gap-2 rounded-control px-3 font-semibold text-accent hover:bg-accent-soft"
            >
              <Trash2 className="size-4" aria-hidden />
              {f.delete}
            </button>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="ml-auto min-h-11 rounded-control border border-line bg-white px-5 font-semibold hover:bg-soft"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={saving || isDuplicate}
            className="flex min-h-11 items-center gap-2 rounded-control bg-accent px-5 font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {word ? t.common.save : f.create}
          </button>
        </div>
      </form>
    </dialog>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
