import { Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import { Logo } from '../Logo'
import { NAV_ITEMS } from './navItems'
import { StreakCard } from './StreakCard'

function navClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center gap-3 rounded-control px-3.5 font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
  }`
}

export function Sidebar() {
  const { t } = useI18n()
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col bg-ink p-4 text-white md:flex">
      <Link to="/" className="mb-6 px-2 pt-2">
        <Logo tone="dark" className="h-12" />
      </Link>

      <nav aria-label={t.nav.mainMenu} className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass}>
            <Icon className="size-5" aria-hidden />
            {t.nav[label]}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <NavLink to="/settings" className={navClass}>
          <Settings className="size-5" aria-hidden />
          {t.nav.settings}
        </NavLink>
        <StreakCard />
      </div>
    </aside>
  )
}
