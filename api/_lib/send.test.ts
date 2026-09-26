import { execFileSync } from 'node:child_process'
import { createECDH, randomBytes } from 'node:crypto'
import { mkdtempSync, readFileSync } from 'node:fs'
import type { IncomingHttpHeaders } from 'node:http'
import { createServer } from 'node:https'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AddressInfo } from 'node:net'
import webpush from 'web-push'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { POST } from '../send-reminders.js'
import { sendAll } from './reminder.js'

// web-push always speaks HTTPS, so the fake push service uses a throwaway self-signed certificate.
const dir = mkdtempSync(join(tmpdir(), 'push-test-'))
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=127.0.0.1',
  '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem')], { stdio: 'ignore' })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// A fake push service: /ok accepts, /gone says the subscription expired, /fail errors.
const seen: { path: string; headers: IncomingHttpHeaders; bytes: number }[] = []
const server = createServer({ key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')) }, (req, res) => {
  let bytes = 0
  req.on('data', (c: Buffer) => (bytes += c.length))
  req.on('end', () => {
    seen.push({ path: req.url ?? '', headers: req.headers, bytes })
    res.statusCode = req.url === '/ok' ? 201 : req.url === '/gone' ? 410 : 500
    res.end()
  })
})
let base = ''

function fakeDevice(path: string) {
  const ecdh = createECDH('prime256v1')
  ecdh.generateKeys()
  return { endpoint: base + path, p256dh: ecdh.getPublicKey('base64url'), auth: randomBytes(16).toString('base64url') }
}

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `https://127.0.0.1:${(server.address() as AddressInfo).port}`
  const keys = webpush.generateVAPIDKeys()
  process.env.VAPID_PUBLIC_KEY = keys.publicKey
  process.env.VAPID_PRIVATE_KEY = keys.privateKey
  process.env.VAPID_SUBJECT = 'https://example.com'
  process.env.CRON_SECRET = 'test-secret'
})
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

describe('sendAll', () => {
  it('sends encrypted, VAPID-signed pushes and reports expired subscriptions', async () => {
    const result = await sendAll([fakeDevice('/ok'), fakeDevice('/gone'), fakeDevice('/fail')])
    expect(result).toEqual({ sent: 1, gone: [`${base}/gone`], failed: 1 })
    const ok = seen.find((r) => r.path === '/ok')!
    expect(ok.headers['content-encoding']).toBe('aes128gcm')
    expect(String(ok.headers.authorization)).toMatch(/^vapid t=.+, k=.+/)
    expect(ok.headers.urgency).toBe('high')
    expect(ok.bytes).toBeGreaterThan(0)
  })
})

describe('POST /api/send-reminders', () => {
  it('rejects calls without the cron secret', async () => {
    const res = await POST(new Request('http://x/api/send-reminders', { method: 'POST', body: '{}' }))
    expect(res.status).toBe(401)
  })

  it('accepts the cron secret and ignores malformed targets', async () => {
    const res = await POST(
      new Request('http://x/api/send-reminders', {
        method: 'POST',
        headers: { authorization: 'Bearer test-secret' },
        body: JSON.stringify({ subscriptions: [{ endpoint: 'not-a-url' }] }),
      }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sent: 0, gone: [], failed: 0 })
  })
})
