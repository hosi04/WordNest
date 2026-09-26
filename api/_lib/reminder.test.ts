import { describe, expect, it } from 'vitest'
import { message, validTargets } from './reminder.js'

describe('push reminder helpers', () => {
  it('picks the message language, defaulting to Vietnamese', () => {
    expect(message('reminder', 'en', 19).title).toContain("haven't studied")
    expect(message('reminder', 'vi', 19).body).toBe('Đã 19h rồi! Ôn vài thẻ để giữ chuỗi ngày học nhé.')
    expect(message('reminder', undefined, 21).body).toContain('Đã 21h rồi')
    expect(message('reminder', 'fr').url).toBe('/study')
  })

  it('mentions the chosen hour, in 12-hour format for English', () => {
    expect(message('reminder', 'en', 19).body).toContain("It's 7 PM!")
    expect(message('reminder', 'en', 0).body).toContain("It's 12 AM!")
    expect(message('test', 'en', 12).body).toContain('the 12 PM study reminder')
    expect(message('test', 'vi', 7).body).toContain('lúc 7h')
    expect(message('reminder', 'vi', 99).body).toContain('Đến giờ học rồi')
  })

  it('keeps only well-formed https push targets', () => {
    const good = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', p256dh: 'p', auth: 'a' }
    expect(validTargets([good, { endpoint: 'http://x', p256dh: 'p', auth: 'a' }, { endpoint: 'https://y' }, null, 3])).toEqual([
      good,
    ])
    expect(validTargets('nope')).toEqual([])
  })
})
