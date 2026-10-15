import { describe, expect, it } from 'vitest'
import { avatarUrl, displayName } from './user'

describe('displayName', () => {
  it('prefers the full name saved in the profile', () => {
    expect(displayName({ email: 'thanh@gmail.com', user_metadata: { full_name: ' Nguyễn Văn Thành ' } })).toBe(
      'Nguyễn Văn Thành',
    )
    expect(displayName({ email: 'thanh@gmail.com', user_metadata: { name: 'Thành' } })).toBe('Thành')
  })

  it('falls back to the email without its domain', () => {
    expect(displayName({ email: 'thanh.nguyen@gmail.com', user_metadata: {} })).toBe('thanh.nguyen')
    expect(displayName({ email: 'a@b.vn', user_metadata: { full_name: '  ' } })).toBe('a')
  })

  it('is empty without a user', () => {
    expect(displayName(null)).toBe('')
  })
})

describe('avatarUrl', () => {
  it('returns the saved https URL', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/avatars/u/avatar.webp?v=1'
    expect(avatarUrl({ user_metadata: { avatar_url: url } })).toBe(url)
  })

  it('ignores missing or non-https values', () => {
    expect(avatarUrl({ user_metadata: {} })).toBeNull()
    expect(avatarUrl({ user_metadata: { avatar_url: 'javascript:alert(1)' } })).toBeNull()
    expect(avatarUrl(null)).toBeNull()
  })
})
