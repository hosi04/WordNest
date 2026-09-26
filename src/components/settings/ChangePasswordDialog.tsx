import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { AuthFailure, updatePassword } from '../../lib/db'
import { PASSWORD_MIN } from '../../lib/username'
import { PasswordInput } from '../PasswordInput'
import { INPUT, PRIMARY_BTN, SECONDARY_BTN } from './SettingsSection'

interface Props {
  username: string // for password managers
  onSaved: () => void
  onClose: () => void
}

export function ChangePasswordDialog({ username, onSaved, onClose }: Props) {
  const { t } = useI18n()
  const a = t.settings.account
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < PASSWORD_MIN) return setError(t.login.passwordTooShort(PASSWORD_MIN))
    if (password !== confirm) return setError(t.login.mismatch)
    setSaving(true)
    setError('')
    try {
      await updatePassword(password)
      onSaved()
    } catch (err) {
      setError(
        err instanceof AuthFailure && err.problem !== 'unknown'
          ? t.login.errors[err.problem]
          : t.login.errors.unknown(err instanceof Error ? err.message : String(err)),
      )
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="change-password-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="change-password-title" className="text-2xl">
            {a.changePassword}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t.common.close}
            className="flex size-11 items-center justify-center rounded-control text-ink-muted hover:bg-soft"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <input type="text" autoComplete="username" value={username} readOnly hidden />
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
              {a.newPassword}
            </label>
            <PasswordInput
              id="new-password"
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="new-password-hint"
              inputClassName={INPUT}
            />
            <p id="new-password-hint" className="mt-1.5 text-sm text-ink-muted">
              {t.login.passwordHint(PASSWORD_MIN)}
            </p>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium">
              {t.login.confirmPassword}
            </label>
            <PasswordInput
              id="confirm-new-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              inputClassName={INPUT}
            />
          </div>
          {error && (
            <p className="rounded-control bg-accent-soft px-4 py-3 text-sm text-accent" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={() => dialogRef.current?.close()} className={SECONDARY_BTN}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving || !password} className={PRIMARY_BTN}>
            {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {a.savePassword}
          </button>
        </div>
      </form>
    </dialog>
  )
}
