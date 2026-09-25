import { describe, expect, it } from 'vitest'
import { normalizeUsername, usernameFromEmail, usernameProblem, usernameToEmail } from './username'

describe('username', () => {
  it('normalizes to trimmed lowercase', () => {
    expect(normalizeUsername('  Thanh.Nguyen ')).toBe('thanh.nguyen')
  })

  it('validates length and characters', () => {
    expect(usernameProblem('ab')).toBe('tooShort')
    expect(usernameProblem('a'.repeat(31))).toBe('tooLong')
    expect(usernameProblem('thanh nguyen')).toBe('invalidChars')
    expect(usernameProblem('thành')).toBe('invalidChars')
    expect(usernameProblem('thanh_nguyen-04.x')).toBeNull()
  })

  it('maps usernames to internal emails and back', () => {
    expect(usernameToEmail(' Hosi04 ')).toBe('hosi04@wordnest.local')
    expect(usernameFromEmail('hosi04@wordnest.local')).toBe('hosi04')
    expect(usernameFromEmail('hosinguyenn@gmail.com')).toBeNull()
    expect(usernameFromEmail(undefined)).toBeNull()
  })
})
