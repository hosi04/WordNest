import { LoaderCircle } from 'lucide-react'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LanguageFab } from '../../i18n/LanguageFab'
import { BottomNav } from './BottomNav'
import { MobileHeader } from './MobileHeader'
import { Sidebar } from './Sidebar'

// Study and quiz sessions hide the mobile header (not the bottom menu) to give the card more room.
const FOCUS_ROUTES = ['/study', '/quiz']

export function AppLayout() {
  const { pathname } = useLocation()
  const focus = FOCUS_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))

  return (
    <div className="min-h-dvh md:pl-sidebar">
      <Sidebar />
      {!focus && <MobileHeader />}
      <main
        // Bottom padding leaves room for the language button (and the bottom nav on phones).
        className="mx-auto max-w-[1600px] px-4 pt-6 pb-[calc(var(--bottom-nav-h)_+_5.5rem)] md:px-12 md:pt-10 md:pb-24"
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <LoaderCircle className="size-8 animate-spin text-accent" aria-hidden />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
      <LanguageFab aboveBottomNav />
    </div>
  )
}
