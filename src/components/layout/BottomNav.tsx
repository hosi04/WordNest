import { NavLink } from 'react-router'
import { useI18n } from '../../i18n/I18nContext'
import { NAV_ITEMS } from './navItems'

export function BottomNav() {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t.nav.mainMenu}
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ to, shortLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              isActive ? 'text-white' : 'text-white/60'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? 'bg-white/10' : ''}`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              {t.nav[shortLabel]}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
