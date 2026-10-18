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
  streak?: number // the streak before today's study
  frozen?: boolean // that streak is frozen (a whole day without study); studying today thaws it
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
  frozen?: boolean
  now?: number // ms; picks today's wording
}

/** 19 → "7 PM", 0 → "12 AM" */
function hour12(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`
}

interface Copy {
  fallbackName: string
  titles: ((name: string) => string)[]
  /** Streak at risk of freezing tonight (n ≥ 1). `at` is "Đã 19h rồi" / "It's 7 PM" or a generic phrase. */
  atRisk: ((n: number, at: string) => string)[]
  /** Streak already frozen (n ≥ 1): one card thaws it. */
  frozen: ((n: number, at: string) => string)[]
  /** No streak to lose. */
  fresh: ((at: string) => string)[]
  at: (hour?: number) => string
}

// Duolingo-style: short, personal, a little cheeky, always about the streak; wording rotates daily.
const COPY: Record<Lang, Copy> = {
  vi: {
    fallbackName: 'Bạn',
    titles: [(name) => `${name} ơi! 👋`, (name) => `${name} ơi, Hosi đây 🔥`, (name) => `Này ${name}…`],
    atRisk: [
      (n) => `Chuỗi ${n} ngày của bạn sắp bị đóng băng! 🧊 Ôn vài thẻ trước nửa đêm nhé.`,
      (n) => `Chỉ cần 2 phút để chuỗi ${n} ngày tiếp tục cháy. Hosi tin bạn làm được! 💪`,
      (n) => `Hosi để ý là hôm nay bạn chưa học… Chuỗi ${n} ngày đang chờ bạn đấy 👀`,
      (n, at) => `${at}! Đừng để chuỗi ${n} ngày đứng yên nhé 🔥`,
    ],
    frozen: [
      (n) => `Chuỗi ${n} ngày đang bị đóng băng 🧊 Ôn 1 thẻ là phá băng ngay!`,
      (n, at) => `${at}! Chuỗi ${n} ngày vẫn còn nguyên, chỉ chờ bạn phá băng thôi 🔥`,
      (n) => `Hosi nhớ bạn đó 🥺 Ôn vài thẻ để chuỗi ${n} ngày cháy lại nhé.`,
    ],
    fresh: [
      (at) => `${at}! Ôn vài thẻ để bắt đầu một chuỗi ngày học mới nhé.`,
      () => 'Từ vựng không tự vào đầu đâu 😉 Học vài thẻ với Hosi nhé!',
      () => 'Hôm nay mình học vài từ nhé? Chỉ mất 2 phút thôi.',
    ],
    at: (hour) => (hour === undefined ? 'Đến giờ học rồi' : `Đã ${hour}h rồi`),
  },
  en: {
    fallbackName: 'there',
    titles: [(name) => `Hey ${name}! 👋`, (name) => `Hi ${name}, it's Hosi 🔥`, (name) => `Psst, ${name}…`],
    atRisk: [
      (n) => `Your ${n}-day streak is about to freeze! 🧊 Review a few cards before midnight.`,
      (n) => `Just 2 minutes keeps your ${n}-day streak burning. You've got this! 💪`,
      (n) => `Hosi noticed you haven't studied today… your ${n}-day streak is waiting 👀`,
      (n, at) => `${at}! Don't let your ${n}-day streak stand still 🔥`,
    ],
    frozen: [
      (n) => `Your ${n}-day streak is frozen 🧊 One card thaws it!`,
      (n, at) => `${at}! Your ${n}-day streak is still there, waiting to be thawed 🔥`,
      (n) => `Hosi misses you 🥺 Review a few cards to light your ${n}-day streak again.`,
    ],
    fresh: [
      (at) => `${at}! Review a few cards to start a new streak.`,
      () => "Words don't learn themselves 😉 Study a few cards with Hosi!",
      () => 'How about a few words today? It only takes 2 minutes.',
    ],
    at: (hour) => (hour === undefined ? "It's study time" : `It's ${hour12(hour)}`),
  },
}

const DAY_MS = 86_400_000
const VIETNAM_OFFSET_MS = 7 * 3_600_000

/** The study reminder; "Send a test" in Settings shows exactly this too. */
export function message(input: MessageInput = {}): Payload {
  const copy = COPY[input.lang === 'en' ? 'en' : 'vi']
  const hour = Number.isInteger(input.hour) && input.hour! >= 0 && input.hour! <= 23 ? input.hour : undefined
  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 40) : copy.fallbackName
  const streak = Number.isInteger(input.streak) && input.streak! > 0 ? input.streak! : 0
  const day = Math.floor(((input.now ?? Date.now()) + VIETNAM_OFFSET_MS) / DAY_MS) // Vietnam calendar day
  const at = copy.at(hour)
  const lines = streak ? (input.frozen === true ? copy.frozen : copy.atRisk) : null
  const body = lines ? lines[day % lines.length](streak, at) : copy.fresh[day % copy.fresh.length](at)
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

export async function sendAll(targets: Target[]): Promise<SendResult> {
  configure()
  const result: SendResult = { sent: 0, gone: [], failed: 0 }
  await Promise.all(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          JSON.stringify(message({ lang: t.lang, hour: t.hour, name: t.name, streak: t.streak, frozen: t.frozen })),
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
