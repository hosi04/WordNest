import { describe, expect, it } from 'vitest'
import { errorMessage } from './errors'

describe('errorMessage', () => {
  it('reads Error instances', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
  })

  it('reads plain Supabase error objects', () => {
    expect(errorMessage({ code: '42501', message: 'new row violates row-level security policy' })).toBe(
      'new row violates row-level security policy',
    )
  })

  it('falls back to String()', () => {
    expect(errorMessage('offline')).toBe('offline')
    expect(errorMessage({ code: 1 })).toBe('[object Object]')
  })
})
