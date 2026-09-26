// Shared by the push endpoints. Files under api/_lib are not exposed as routes.
import webpush from 'web-push'

export type Lang = 'vi' | 'en'

export interface Target {
  endpoint: string
  p256dh: string
  auth: string
  lang?: string
  hour?: number // the device's reminder hour (Vietnam time), shown in the message
}

export interface Payload {
  title: string
  body: string
  url: string
}

/** 19 → "7 PM", 0 → "12 AM" */
function hour12(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`
}

const MESSAGES: Record<Lang, { reminder: (hour?: number) => Payload; test: (hour?: number) => Payload }> = {
  vi: {
    reminder: (hour) => ({
      title: 'Hosi 🔥 Hôm nay bạn chưa học',
      body: `${hour === undefined ? 'Đến giờ học rồi' : `Đã ${hour}h rồi`}! Ôn vài thẻ để giữ chuỗi ngày học nhé.`,
      url: '/study',
    }),
    test: (hour) => ({
      title: 'Hosi',
      body: `Thông báo thử: nhắc học${hour === undefined ? '' : ` lúc ${hour}h`} đã bật trên thiết bị này.`,
      url: '/',
    }),
  },
  en: {
    reminder: (hour) => ({
      title: "Hosi 🔥 You haven't studied today",
      body: `${hour === undefined ? "It's study time" : `It's ${hour12(hour)}`}! Review a few cards to keep your streak.`,
      url: '/study',
    }),
    test: (hour) => ({
      title: 'Hosi',
      body: `Test notification: the${hour === undefined ? '' : ` ${hour12(hour)}`} study reminder is on for this device.`,
      url: '/',
    }),
  },
}

export function message(kind: 'reminder' | 'test', lang: string | undefined, hour?: number): Payload {
  const validHour = Number.isInteger(hour) && hour! >= 0 && hour! <= 23 ? hour : undefined
  return MESSAGES[lang === 'en' ? 'en' : 'vi'][kind](validHour)
}

/** Keeps only well-formed push targets (https endpoint + both keys). */
export function validTargets(input: unknown): Target[] {
  if (!Array.isArray(input)) return []
  return input.filter(
    (t): t is Target =>
      typeof t === 'object' &&
      t !== null &&
      typeof t.endpoint === 'string' &&
      t.endpoint.startsWith('https://') &&
      typeof t.p256dh === 'string' &&
      typeof t.auth === 'string',
  )
}

function configure() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) throw new Error('VAPID keys are not configured')
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export interface SendResult {
  sent: number
  gone: string[] // endpoints the push service says no longer exist (unsubscribed / app removed)
  failed: number
}

export async function sendAll(targets: Target[], kind: 'reminder' | 'test'): Promise<SendResult> {
  configure()
  const result: SendResult = { sent: 0, gone: [], failed: 0 }
  await Promise.all(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          JSON.stringify(message(kind, t.lang, t.hour)),
          { TTL: 60 * 60 * 4, urgency: 'high' },
        )
        result.sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) result.gone.push(t.endpoint)
        else result.failed++
      }
    }),
  )
  return result
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
