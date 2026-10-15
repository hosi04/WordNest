import { Settings } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/AuthContext'
import { avatarUrl, displayName } from '../../lib/user'
import { Avatar } from '../Avatar'
import { useI18n } from '../../i18n/I18nContext'
import { Logo } from '../Logo'

export function MobileHeader() {
  const { t } = useI18n()
  const { session } = useAuth()
  const name = displayName(session?.user)
  return (
    <header className="flex items-center justify-between px-4 pt-4 md:hidden">
      <Link to="/">
        <Logo size="h-8" tagline />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/settings"
          aria-label={t.nav.settings}
          className="flex size-11 items-center justify-center rounded-control border border-line bg-card text-ink-muted"
        >
          <Settings className="size-5" aria-hidden />
        </Link>
        <Link to="/profile" aria-label={t.dashboard.account(name)} className="rounded-full">
          <Avatar name={name} url={avatarUrl(session?.user)} className="size-11 text-lg" />
        </Link>
      </div>
    </header>
  )
}
