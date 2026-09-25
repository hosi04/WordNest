import { LoaderCircle, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { Logo } from '../components/Logo'
import { useI18n } from '../i18n/I18nContext'
import { LanguageFab } from '../i18n/LanguageFab'
import { signInWithEmail, signInWithGoogle } from '../lib/db'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function LoginPage() {
  const { session, loading } = useAuth()
  const { t } = useI18n()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  if (loading) return <FullPageSpinner />
  if (session) {
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await signInWithEmail(email.trim())
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-card border border-line bg-card p-6 sm:p-8">
          <h1 className="text-3xl">{t.login.title}</h1>
          <p className="mt-2 text-ink-muted">{t.login.subtitle}</p>

          {status === 'sent' ? (
            <div className="mt-6 rounded-control bg-success-soft p-4 text-success" role="status">
              <p className="font-semibold">{t.login.sentTitle}</p>
              <p className="mt-1 text-sm">{t.login.sentText(email)}</p>
            </div>
          ) : (
            <form onSubmit={handleEmail} className="mt-6 flex flex-col gap-3">
              <label htmlFor="email" className="text-sm font-medium">
                {t.login.email}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 rounded-control border border-line bg-white px-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                ) : (
                  <Mail className="size-5" aria-hidden />
                )}
                {t.login.sendLink}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-accent" role="alert">
              {t.login.error(error)}
            </p>
          )}

          <div className="my-6 flex items-center gap-3 text-sm text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            {t.login.or}
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-line bg-white px-5 font-semibold transition-colors hover:bg-soft"
          >
            <GoogleIcon />
            {t.login.google}
          </button>
        </div>
      </div>
      <LanguageFab />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
