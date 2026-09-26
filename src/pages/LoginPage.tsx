import { LoaderCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { clearDeliberateSignOut } from '../auth/signOut'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { Logo } from '../components/Logo'
import { PasswordInput } from '../components/PasswordInput'
import { useI18n } from '../i18n/I18nContext'
import { LanguageFab } from '../i18n/LanguageFab'
import type { Messages } from '../i18n/vi'
import { AuthFailure, signInWithUsername, signUpWithUsername, type AuthProblem } from '../lib/db'
import {
  normalizeUsername,
  PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
  usernameProblem,
  type UsernameProblem,
} from '../lib/username'

type Mode = 'signIn' | 'signUp'

type LoginError =
  | { kind: 'username'; problem: UsernameProblem }
  | { kind: 'passwordTooShort' }
  | { kind: 'mismatch' }
  | { kind: 'auth'; problem: AuthProblem; message: string }

function describeError(error: LoginError, m: Messages['login']): string {
  switch (error.kind) {
    case 'username':
      if (error.problem === 'tooShort') return m.usernameProblems.tooShort(USERNAME_MIN)
      if (error.problem === 'tooLong') return m.usernameProblems.tooLong(USERNAME_MAX)
      return m.usernameProblems.invalidChars
    case 'passwordTooShort':
      return m.passwordTooShort(PASSWORD_MIN)
    case 'mismatch':
      return m.mismatch
    case 'auth':
      return error.problem === 'unknown' ? m.errors.unknown(error.message) : m.errors[error.problem]
  }
}

const INPUT =
  'min-h-11 w-full rounded-control border border-line bg-white px-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft'

export function LoginPage() {
  const { session, loading } = useAuth()
  const { t } = useI18n()
  const m = t.login
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('signIn')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)

  if (loading) return <FullPageSpinner />
  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  const signingUp = mode === 'signUp'

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setPassword('')
    setConfirm('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const name = normalizeUsername(username)
    if (signingUp) {
      const problem = usernameProblem(name)
      if (problem) return setError({ kind: 'username', problem })
      if (password.length < PASSWORD_MIN) return setError({ kind: 'passwordTooShort' })
      if (password !== confirm) return setError({ kind: 'mismatch' })
    }

    setSubmitting(true)
    setError(null)
    clearDeliberateSignOut()
    try {
      if (signingUp) await signUpWithUsername(name, password)
      else await signInWithUsername(name, password)
      // On success the auth listener updates the session and this page redirects.
    } catch (err) {
      setError(
        err instanceof AuthFailure
          ? { kind: 'auth', problem: err.problem, message: err.message }
          : { kind: 'auth', problem: 'unknown', message: err instanceof Error ? err.message : String(err) },
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-card border border-line bg-card p-6 sm:p-8">
          <h1 className="text-3xl">{signingUp ? m.signUpTitle : m.signInTitle}</h1>
          <p className="mt-2 text-ink-muted">{m.subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                {m.username}
              </label>
              <input
                id="username"
                required
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                maxLength={USERNAME_MAX}
                placeholder={m.usernamePlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby={signingUp ? 'username-hint' : undefined}
                className={INPUT}
              />
              {signingUp && (
                <p id="username-hint" className="mt-1.5 text-sm text-ink-muted">
                  {m.usernameHint(USERNAME_MIN, USERNAME_MAX)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                {m.password}
              </label>
              <PasswordInput
                id="password"
                required
                autoComplete={signingUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={signingUp ? 'password-hint' : undefined}
                inputClassName={INPUT}
              />
              {signingUp && (
                <p id="password-hint" className="mt-1.5 text-sm text-ink-muted">
                  {m.passwordHint(PASSWORD_MIN)}
                </p>
              )}
            </div>

            {signingUp && (
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">
                  {m.confirmPassword}
                </label>
                <PasswordInput
                  id="confirm-password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  inputClassName={INPUT}
                />
              </div>
            )}

            {error && (
              <p className="rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
                {describeError(error, m)}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !username.trim() || !password}
              className="flex min-h-12 items-center justify-center gap-2 rounded-control bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
              {signingUp ? m.signUp : m.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {signingUp ? m.haveAccount : m.noAccount}{' '}
            <button
              type="button"
              onClick={() => switchMode(signingUp ? 'signIn' : 'signUp')}
              className="min-h-11 px-1 font-semibold text-accent hover:text-accent-hover"
            >
              {signingUp ? m.toSignIn : m.toSignUp}
            </button>
          </p>
        </div>
      </div>
      <LanguageFab />
    </div>
  )
}
