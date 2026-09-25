import { LoaderCircle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

export function FullPageSpinner() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status">
      <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  )
}
