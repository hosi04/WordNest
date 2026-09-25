import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { updateNewPerDay } from '../../lib/db'
import { INPUT, PRIMARY_BTN, SettingsSection, StatusText } from './SettingsSection'

type Status = { kind: 'ok' | 'error'; text: string } | null

// Same look as other inputs, but narrow.
const NUMBER_INPUT = `${INPUT.replace('w-full', '')} w-28`

const MIN = 1
const MAX = 100

export function StudySection({ initialNewPerDay }: { initialNewPerDay: number }) {
  const { t } = useI18n()
  const [value, setValue] = useState(String(initialNewPerDay))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await updateNewPerDay(Number(value))
      setStatus({ kind: 'ok', text: t.settings.study.saved })
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection title={t.settings.study.title} description={t.settings.study.description}>
      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <label htmlFor="new-per-day" className="text-sm font-medium">
          {t.settings.study.newPerDay}
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="new-per-day"
            type="number"
            inputMode="numeric"
            required
            min={MIN}
            max={MAX}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={NUMBER_INPUT}
          />
          <button type="submit" disabled={saving} className={PRIMARY_BTN}>
            {t.common.save}
          </button>
        </div>
        <StatusText status={status} />
      </form>
    </SettingsSection>
  )
}
