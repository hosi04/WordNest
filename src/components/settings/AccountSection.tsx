import { LogOut } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useI18n } from '../../i18n/I18nContext'
import { signOutByUser } from '../../auth/signOut'
import { AuthFailure, updateDisplayName, updatePassword } from '../../lib/db'
import { displayName } from '../../lib/user'
import { PASSWORD_MIN, usernameFromEmail } from '../../lib/username'
import { PasswordInput } from '../PasswordInput'
import { INPUT, PRIMARY_BTN, SECONDARY_BTN, SettingsSection, StatusText } from './SettingsSection'

type Status = { kind: 'ok' | 'error'; text: string } | null

export function AccountSection() {
  const { session } = useAuth()
  const { t } = useI18n()
  const a = t.settings.account
  const user = session?.user
  const [name, setName] = useState(() => displayName(user))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<Status>(null)
  const identity = usernameFromEmail(user?.email) ?? user?.email

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await updateDisplayName(name)
      setStatus({ kind: 'ok', text: a.saved })
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setSaving(false)
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < PASSWORD_MIN) {
      return setPasswordStatus({ kind: 'error', text: t.login.passwordTooShort(PASSWORD_MIN) })
    }
    if (newPassword !== confirmPassword) return setPasswordStatus({ kind: 'error', text: t.login.mismatch })
    setSavingPassword(true)
    setPasswordStatus(null)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setPasswordStatus({ kind: 'ok', text: a.passwordSaved })
    } catch (err) {
      const text =
        err instanceof AuthFailure && err.problem !== 'unknown'
          ? t.login.errors[err.problem]
          : t.login.errors.unknown(err instanceof Error ? err.message : String(err))
      setPasswordStatus({ kind: 'error', text })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <SettingsSection title={a.title} description={identity ? a.signedInAs(identity) : undefined}>
      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <label htmlFor="display-name" className="text-sm font-medium">
          {a.displayName}
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="display-name"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${INPUT} flex-1 basis-56`}
          />
          <button type="submit" disabled={saving || !name.trim()} className={PRIMARY_BTN}>
            {a.saveName}
          </button>
        </div>
        <StatusText status={status} />
      </form>

      <form onSubmit={handlePassword} className="mt-6 flex flex-col gap-2 border-t border-line pt-6" noValidate>
        <p className="font-semibold">{a.changePassword}</p>
        <input type="text" autoComplete="username" value={identity ?? ''} readOnly hidden />
        <label htmlFor="new-password" className="text-sm font-medium">
          {a.newPassword}
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          inputClassName={INPUT}
        />
        <label htmlFor="confirm-new-password" className="mt-2 text-sm font-medium">
          {t.login.confirmPassword}
        </label>
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          inputClassName={INPUT}
        />
        <button
          type="submit"
          disabled={savingPassword || !newPassword}
          className={`${PRIMARY_BTN} mt-2 self-start`}
        >
          {a.savePassword}
        </button>
        <StatusText status={passwordStatus} />
      </form>

      <button
        type="button"
        onClick={() => signOutByUser()}
        className={`${SECONDARY_BTN} mt-6`}
      >
        <LogOut className="size-5" aria-hidden />
        {a.signOut}
      </button>
    </SettingsSection>
  )
}
