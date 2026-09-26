import { BellOff, BellRing, LoaderCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useI18n } from '../../i18n/I18nContext'
import {
  changeReminderHour,
  DEFAULT_REMINDER_HOUR,
  disableReminders,
  enableReminders,
  notificationPermission,
  PermissionDenied,
  reminderHour,
  reminderSupport,
  sendTestReminder,
} from '../../lib/push'
import { displayName } from '../../lib/user'
import { INPUT, PRIMARY_BTN, SECONDARY_BTN, SettingsSection, StatusText } from './SettingsSection'

type Status = { kind: 'ok' | 'error'; text: string } | null

const HOURS = Array.from({ length: 24 }, (_, h) => h)
const SELECT = `${INPUT.replace('w-full', '')} w-36`

export function ReminderSection() {
  const { t, lang } = useI18n()
  const { session } = useAuth()
  const r = t.settings.reminders
  const [support] = useState(reminderSupport)
  const [enabled, setEnabled] = useState<boolean | null>(null) // null = still checking
  const [hour, setHour] = useState(DEFAULT_REMINDER_HOUR)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  useEffect(() => {
    if (support !== 'ok') return
    let cancelled = false
    reminderHour()
      .then((saved) => {
        if (cancelled) return
        setEnabled(saved !== null)
        if (saved !== null) setHour(saved)
      })
      .catch(() => !cancelled && setEnabled(false))
    return () => {
      cancelled = true
    }
  }, [support])

  async function run(action: () => Promise<void>, ok: string, nextEnabled?: boolean) {
    setBusy(true)
    setStatus(null)
    try {
      await action()
      if (nextEnabled !== undefined) setEnabled(nextEnabled)
      setStatus({ kind: 'ok', text: ok })
    } catch (err) {
      const text =
        err instanceof PermissionDenied || notificationPermission() === 'denied'
          ? r.denied
          : r.error(err instanceof Error ? err.message : String(err))
      setStatus({ kind: 'error', text })
    } finally {
      setBusy(false)
    }
  }

  function handleHourChange(next: number) {
    setHour(next)
    if (enabled) void run(() => changeReminderHour(next), r.hourSaved(next))
  }

  const notice =
    support === 'notConfigured'
      ? r.notConfigured
      : support === 'unsupported'
        ? r.unsupported
        : support === 'iosNeedsInstall'
          ? r.iosNeedsInstall
          : null

  return (
    <SettingsSection title={r.title} description={r.description}>
      {notice ? (
        <p className="rounded-control bg-soft px-4 py-3 text-sm">{notice}</p>
      ) : enabled === null ? (
        <p className="text-sm text-ink-muted">{r.checking}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="reminder-hour" className="mb-1.5 block text-sm font-medium">
              {r.hour}
            </label>
            <select
              id="reminder-hour"
              value={hour}
              disabled={busy}
              onChange={(e) => handleHourChange(Number(e.target.value))}
              className={SELECT}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {r.hourOption(h)}
                </option>
              ))}
            </select>
          </div>

          {enabled && (
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <BellRing className="size-4" aria-hidden />
              {r.on(hour)}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {enabled ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => sendTestReminder(lang, hour, displayName(session?.user)), r.testSent)}
                  className={PRIMARY_BTN}
                >
                  {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
                  {r.test}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(disableReminders, r.disabled, false)}
                  className={SECONDARY_BTN}
                >
                  <BellOff className="size-5" aria-hidden />
                  {r.disable}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => enableReminders(hour), r.enabled, true)}
                className={PRIMARY_BTN}
              >
                {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <BellRing className="size-5" aria-hidden />}
                {r.enable}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="mt-3">
        <StatusText status={status} />
      </div>
    </SettingsSection>
  )
}
