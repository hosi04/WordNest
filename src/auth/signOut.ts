import { signOut } from '../lib/db'
import { releaseDeviceReminders } from '../lib/push'

// Set while the user deliberately signs out, so RequireAuth does not remember the current page
// as the place to return to — the next sign-in (maybe someone else) starts at the overview.
// Read-only during render (StrictMode renders twice); cleared when the next sign-in starts.
let deliberateSignOut = false

export async function signOutByUser(): Promise<void> {
  deliberateSignOut = true
  await releaseDeviceReminders()
  await signOut()
}

export function isDeliberateSignOut(): boolean {
  return deliberateSignOut
}

export function clearDeliberateSignOut(): void {
  deliberateSignOut = false
}
