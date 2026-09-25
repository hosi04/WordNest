import { ArrowLeft, X } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'

interface Props {
  title: string
  backTo: string
  done: number
  total: number
}

export function StudyHeader({ title, backTo, done, total }: Props) {
  const { t } = useI18n()
  const percent = total ? Math.round((done / total) * 100) : 0
  return (
    <header className="flex items-center gap-4">
      <Link
        to={backTo}
        className="hidden min-h-11 shrink-0 items-center gap-2 font-semibold hover:text-accent sm:flex"
      >
        <ArrowLeft className="size-5" aria-hidden />
        {title}
      </Link>
      <div
        className="h-2 flex-1 rounded-full bg-line"
        role="progressbar"
        aria-label={t.study.progress}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
      <span className="shrink-0 font-bold tabular-nums">
        {done} / {total}
      </span>
      <Link
        to={backTo}
        aria-label={t.study.exit}
        className="flex size-11 shrink-0 items-center justify-center rounded-control border border-line bg-card hover:bg-soft"
      >
        <X className="size-5" aria-hidden />
      </Link>
    </header>
  )
}
