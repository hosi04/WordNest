import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { I18nProvider } from './i18n/I18nProvider'
import { isSupabaseConfigured } from './lib/supabase'
import { ConfigMissingPage } from './pages/ConfigMissingPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { QuizPage } from './pages/QuizPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatsPage } from './pages/StatsPage'
import { StudyPage } from './pages/StudyPage'
import { WordsPage } from './pages/WordsPage'

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
