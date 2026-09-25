// Supabase Auth has no usernames, so a username is stored as an internal email
// "<username>@wordnest.local". No mail is ever sent there ("Confirm email" must be off).
export const USERNAME_EMAIL_DOMAIN = 'wordnest.local'

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30
export const PASSWORD_MIN = 6

const USERNAME_PATTERN = /^[a-z0-9._-]+$/

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase()
}

export type UsernameProblem = 'tooShort' | 'tooLong' | 'invalidChars'

/** null when the (normalized) username is valid. */
export function usernameProblem(username: string): UsernameProblem | null {
  if (username.length < USERNAME_MIN) return 'tooShort'
  if (username.length > USERNAME_MAX) return 'tooLong'
  if (!USERNAME_PATTERN.test(username)) return 'invalidChars'
  return null
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`
}

/** The username for an internal email; null for a real email (older accounts). */
export function usernameFromEmail(email: string | undefined): string | null {
  const suffix = `@${USERNAME_EMAIL_DOMAIN}`
  return email?.endsWith(suffix) ? email.slice(0, -suffix.length) : null
}
