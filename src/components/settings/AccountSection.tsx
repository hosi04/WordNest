import { KeyRound, LogOut } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { signOutByUser } from '../../auth/signOut'
import { useI18n } from '../../i18n/I18nContext'
import { updateDisplayName } from '../../lib/db'
import { displayName } from '../../lib/user'
import { usernameFromEmail } from '../../lib/username'
import { ChangePasswordDialog } from './ChangePasswordDialog'
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
  const [changingPassword, setChangingPassword] = useState(false)
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
      setStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSaving(false)
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

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => {
            setPasswordStatus(null)
            setChangingPassword(true)
          }}
          className={SECONDARY_BTN}
        >
          <KeyRound className="size-5" aria-hidden />
          {a.changePassword}
        </button>
        <button type="button" onClick={() => signOutByUser()} className={SECONDARY_BTN}>
          <LogOut className="size-5" aria-hidden />
          {a.signOut}
        </button>
      </div>
      <div className="mt-2">
        <StatusText status={passwordStatus} />
      </div>

      {changingPassword && (
        <ChangePasswordDialog
          username={identity ?? ''}
          onSaved={() => {
            setChangingPassword(false)
            setPasswordStatus({ kind: 'ok', text: a.passwordSaved })
          }}
          onClose={() => setChangingPassword(false)}
        />
      )}
    </SettingsSection>
  )
}
