// "Send a test" button in Settings: pushes the real reminder (today's wording, the user's name,
// hour and streak at risk) to the caller's own subscription, so they see exactly what they will get.
import { json, sendAll, validTargets } from './_lib/reminder.js'

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as {
    subscription?: unknown
    lang?: string
    hour?: number
    name?: string
    streak?: number
  } | null
  const [target] = validTargets([body?.subscription])
  if (!target) return json({ error: 'invalid subscription' }, 400)
  const result = await sendAll([
    { ...target, lang: body?.lang, hour: body?.hour, name: body?.name, streak: body?.streak },
  ])
  return json(result, result.sent ? 200 : 502)
}
