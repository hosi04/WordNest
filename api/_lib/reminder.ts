// Shared by the push endpoints. Files under api/_lib are not exposed as routes.
import webpush from 'web-push'

export type Lang = 'vi' | 'en'

export interface Target {
  endpoint: string
  p256dh: string
  auth: string
  lang?: string
  hour?: number // the device's reminder hour (Vietnam time), shown in the message
  name?: string // the user's display name, shown in the title
  streak?: number // consecutive study days up to yesterday: the streak that is at risk today
}

export interface Payload {
  title: string
  body: string
  url: string
}

export interface MessageInput {
  lang?: string
  hour?: number
  name?: string
  streak?: number
  now?: number // ms; picks today's wording
}

/** 19 → "7 PM", 0 → "12 AM" */
function hour12(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`
}

interface Copy {
  fallbackName: string
  titles: ((name: string) => string)[]
  /** Streak at risk (n ≥ 1). `at` is "Đã 19h rồi" / "It's 7 PM" or a generic phrase. */
  atRisk: ((n: number, at: string) => string)[]
  /** No streak to lose. */
  fresh: ((at: string) => string)[]
  at: (hour?: number) => string
  testTitle: (name: string) => string
  testBody: (hour?: number) => string
}

// Duolingo-style: short, personal, a little cheeky, always about the streak; wording rotates daily.
const COPY: Record<Lang, Copy> = {
  vi: {
    fallbackName: 'Bạn',
    titles: [(name) => `${name} ơi! 👋`, (name) => `${name} ơi, Hosi đây 🔥`, (name) => `Này ${name}…`],
    atRisk: [
      (n) => `Chuỗi ${n} ngày của bạn sắp tắt lửa! 🔥 Ôn vài thẻ trước nửa đêm nhé.`,
      (n) => `Chỉ cần 2 phút để giữ chuỗi ${n} ngày. Hosi tin bạn làm được! 💪`,
      (n) => `Hosi để ý là hôm nay bạn chưa học… Chuỗi ${n} ngày đang chờ bạn đấy 👀`,
      (n, at) => `${at}! Đừng để chuỗi ${n} ngày dừng lại ở đây nhé.`,
    ],
    fresh: [
      (at) => `${at}! Ôn vài thẻ để bắt đầu một chuỗi ngày học mới nhé.`,
      () => 'Từ vựng không tự vào đầu đâu 😉 Học vài thẻ với Hosi nhé!',
      () => 'Hôm nay mình học vài từ nhé? Chỉ mất 2 phút thôi.',
    ],
    at: (hour) => (hour === undefined ? 'Đến giờ học rồi' : `Đã ${hour}h rồi`),
    testTitle: (name) => `${name} ơi, Hosi đây 🔥`,
    testBody: (hour) => `Thông báo thử: nhắc học${hour === undefined ? '' : ` lúc ${hour}h`} đã bật trên thiết bị này.`,
  },
  en: {
    fallbackName: 'there',
    titles: [(name) => `Hey ${name}! 👋`, (name) => `Hi ${name}, it's Hosi 🔥`, (name) => `Psst, ${name}…`],
    atRisk: [
      (n) => `Your ${n}-day streak is about to burn out! 🔥 Review a few cards before midnight.`,
      (n) => `Just 2 minutes keeps your ${n}-day streak alive. You've got this! 💪`,
      (n) => `Hosi noticed you haven't studied today… your ${n}-day streak is waiting 👀`,
      (n, at) => `${at}! Don't let your ${n}-day streak end here.`,
    ],
    fresh: [
      (at) => `${at}! Review a few cards to start a new streak.`,
      () => "Words don't learn themselves 😉 Study a few cards with Hosi!",
      () => 'How about a few words today? It only takes 2 minutes.',
    ],
    at: (hour) => (hour === undefined ? "It's study time" : `It's ${hour12(hour)}`),
    testTitle: (name) => `Hi ${name}, it's Hosi 🔥`,
    testBody: (hour) =>
      `Test notification: the${hour === undefined ? '' : ` ${hour12(hour)}`} study reminder is on for this device.`,
  },
}

const DAY_MS = 86_400_000
const VIETNAM_OFFSET_MS = 7 * 3_600_000

export function message(kind: 'reminder' | 'test', input: MessageInput = {}): Payload {
  const copy = COPY[input.lang === 'en' ? 'en' : 'vi']
  const hour = Number.isInteger(input.hour) && input.hour! >= 0 && input.hour! <= 23 ? input.hour : undefined
  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 40) : copy.fallbackName
  if (kind === 'test') return { title: copy.testTitle(name), body: copy.testBody(hour), url: '/' }

  const streak = Number.isInteger(input.streak) && input.streak! > 0 ? input.streak! : 0
  const day = Math.floor(((input.now ?? Date.now()) + VIETNAM_OFFSET_MS) / DAY_MS) // Vietnam calendar day
  const at = copy.at(hour)
  const body = streak ? copy.atRisk[day % copy.atRisk.length](streak, at) : copy.fresh[day % copy.fresh.length](at)
  return { title: copy.titles[day % copy.titles.length](name), body, url: '/study' }
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
          JSON.stringify(message(kind, { lang: t.lang, hour: t.hour, name: t.name, streak: t.streak })),
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
