// Called by Supabase pg_cron every hour with the push targets whose reminder hour (Vietnam time)
// is now and whose user has not studied today. The selection happens in SQL
// (docs/push-reminders.sql), so this function needs no database access.
import { json, sendAll, validTargets } from './_lib/reminder.js'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'unauthorized' }, 401)
  }
  const body = (await request.json().catch(() => null)) as { subscriptions?: unknown } | null
  const targets = validTargets(body?.subscriptions)
  return json(await sendAll(targets, 'reminder'))
}
