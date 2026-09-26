import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { I18nProvider } from './i18n/I18nProvider'
import { isSupabaseConfigured } from './lib/supabase'
import { ConfigMissingPage } from './pages/ConfigMissingPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

// Pages other than the overview are loaded on first visit to keep the initial bundle small
// (AppLayout shows a spinner via Suspense meanwhile).
const StudyPage = lazy(() => import('./pages/StudyPage').then((m) => ({ default: m.StudyPage })))
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const WordsPage = lazy(() => import('./pages/WordsPage').then((m) => ({ default: m.WordsPage })))
const StatsPage = lazy(() => import('./pages/StatsPage').then((m) => ({ default: m.StatsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export function App() {
  if (!isSupabaseConfigured) {
    return (
      <I18nProvider>
        <ConfigMissingPage />
      </I18nProvider>
    )
  }

  return (
    <AuthProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="study" element={<StudyPage />} />
                <Route path="study/:deckId" element={<StudyPage />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="words" element={<WordsPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </AuthProvider>
  )
}
