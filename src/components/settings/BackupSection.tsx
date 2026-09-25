import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { toDayKey } from '../../lib/date'
import { exportAll } from '../../lib/db'
import { SECONDARY_BTN, SettingsSection, StatusText } from './SettingsSection'

type Status = { kind: 'ok' | 'error'; text: string } | null

function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function BackupSection() {
  const { t } = useI18n()
  const b = t.settings.backup
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function handleExport() {
    setExporting(true)
    setStatus(null)
    try {
      const data = await exportAll()
      downloadJson(data, `${b.fileName}-${toDayKey(new Date())}.json`)
      setStatus({ kind: 'ok', text: b.done(data.words.length, data.reviews.length) })
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setExporting(false)
    }
  }

  return (
    <SettingsSection title={b.title} description={b.description}>
      <div className="flex flex-col items-start gap-2">
        <button type="button" onClick={handleExport} disabled={exporting} className={SECONDARY_BTN}>
          {exporting ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
          ) : (
            <Download className="size-5" aria-hidden />
          )}
          {b.export}
        </button>
        <StatusText status={status} />
      </div>
    </SettingsSection>
  )
}
