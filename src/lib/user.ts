import type { User } from '@supabase/supabase-js'

/** Display name saved in the profile (Settings), else the username / email without its domain. */
export function displayName(user: Pick<User, 'email' | 'user_metadata'> | null | undefined): string {
  const meta = user?.user_metadata ?? {}
  const fullName = [meta.full_name, meta.name].find((v): v is string => typeof v === 'string' && v.trim() !== '')
  if (fullName) return fullName.trim()
  return user?.email?.split('@')[0] ?? ''
}

/** Public URL of the profile picture (Storage), or null to show the initial instead. */
export function avatarUrl(user: Pick<User, 'user_metadata'> | null | undefined): string | null {
  const url = user?.user_metadata?.avatar_url
  return typeof url === 'string' && url.startsWith('https://') ? url : null
}
