import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { useAuth } from './AuthContext'
import { isDeliberateSignOut } from './signOut'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) {
    const state = isDeliberateSignOut() ? undefined : { from: location.pathname }
    return <Navigate to="/login" replace state={state} />
  }
  return <Outlet />
}
