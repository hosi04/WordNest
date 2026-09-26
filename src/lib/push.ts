// Study reminders: subscribe this device to web push at a chosen hour (default 19:00, Vietnam time).
// The hourly check and sending happen on the server (Supabase pg_cron → /api/send-reminders);
// see docs/push-reminders.sql.
import { deletePushSubscription, getReminderHour, savePushSubscription, updateReminderHour } from './db'

export const DEFAULT_REMINDER_HOUR = 19

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export type ReminderSupport =
  | 'ok'
  | 'notConfigured' // no VAPID key in this build
  | 'unsupported' // browser without service worker / push
  | 'iosNeedsInstall' // iPhone/iPad: push only works in the app added to the Home Screen

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function reminderSupport(): ReminderSupport {
  if (!VAPID_PUBLIC_KEY) return 'notConfigured'
  if (isIos() && !isStandalone()) return 'iosNeedsInstall'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  return 'ok'
}

export function notificationPermission(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'default'
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

function toTarget(sub: PushSubscription) {
  const json = sub.toJSON()
  return { endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' }
}

// getRegistration() answers right away; `ready` would wait forever without a service worker (dev).
async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) throw new Error('Service worker not available')
  return reg
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration()
  return reg ? reg.pushManager.getSubscription() : null
}

/** The reminder hour if reminders are on for this device (subscribed here and saved), else null. */
export async function reminderHour(): Promise<number | null> {
  if (reminderSupport() !== 'ok' || notificationPermission() !== 'granted') return null
  const sub = await currentSubscription()
  return sub ? getReminderHour(sub.endpoint) : null
}

export class PermissionDenied extends Error {}

/** Asks for permission (must run from a tap), subscribes and saves the subscription. */
export async function enableReminders(hour: number): Promise<void> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new PermissionDenied(permission)
  const reg = await registration()
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    }))
  await savePushSubscription(toTarget(sub), hour)
}

export async function changeReminderHour(hour: number): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) throw new Error('Not subscribed')
  await updateReminderHour(sub.endpoint, hour)
}

export async function disableReminders(): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) return
  await deletePushSubscription(sub.endpoint)
  await sub.unsubscribe()
}

/** Asks the server to push a test notification to this device. */
export async function sendTestReminder(lang: string, hour: number, name: string): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) throw new Error('Not subscribed')
  const res = await fetch('/api/send-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: toTarget(sub), lang, hour, name }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
