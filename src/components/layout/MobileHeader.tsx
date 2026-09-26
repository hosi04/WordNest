import { Settings } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import { Logo } from '../Logo'

export function MobileHeader() {
  const { t } = useI18n()
  return (
    <header className="flex items-center justify-between px-4 pt-4 md:hidden">
      <Link to="/">
        <Logo className="h-9" />
      </Link>
      <Link
        to="/settings"
        aria-label={t.nav.settings}
        className="flex size-11 items-center justify-center rounded-control border border-line bg-card text-ink-muted"
      >
        <Settings className="size-5" aria-hidden />
      </Link>
    </header>
  )
}
