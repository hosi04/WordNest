import { useI18n } from '../../i18n/I18nContext'
import type { WordStatus } from '../../lib/wordStatus'

const STATUS_DOT: Record<WordStatus, string> = {
  new: 'bg-info',
  learning: 'bg-gold',
  mastered: 'bg-success',
}

export function StatusBadge({ status }: { status: WordStatus }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {t.status[status]}
    </span>
  )
}

export function LevelBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-ink-muted">—</span>
  return <span className="rounded-md bg-soft px-2 py-0.5 text-xs font-semibold">{level}</span>
}
