/**
 * Readable text for anything thrown. Supabase errors are plain objects ({ message, code }),
 * not Error instances, so String(err) would print "[object Object]".
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  return String(err)
}
