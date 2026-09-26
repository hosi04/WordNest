// "Send a test" button in Settings: pushes a fixed test message to the caller's own subscription.
import { json, sendAll, validTargets } from './_lib/reminder.js'

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as {
    subscription?: unknown
    lang?: string
    hour?: number
  } | null
  const [target] = validTargets([body?.subscription])
  if (!target) return json({ error: 'invalid subscription' }, 400)
  const result = await sendAll([{ ...target, lang: body?.lang, hour: body?.hour }], 'test')
  return json(result, result.sent ? 200 : 502)
}
