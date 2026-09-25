import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
