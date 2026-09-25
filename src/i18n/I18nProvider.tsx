import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { updateUiLanguage } from '../lib/db'
import { I18nContext, isLang, MESSAGES, type Lang } from './I18nContext'

const STORAGE_KEY = 'wordnest.lang'

function storedLang(): Lang {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (isLang(value)) return value
  } catch {
    // storage unavailable (private mode) — fall back to the default
  }
  return 'vi'
}

/**
 * The display language is saved on the account (user_metadata.ui_language) so it follows the
 * user across devices, and in localStorage so the login page already uses it.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const accountLang = session?.user.user_metadata?.ui_language
  const [lang, setLangState] = useState<Lang>(storedLang)

  // Adopt the account's language whenever it changes (sign-in, or a change on another device).
  const [seenAccountLang, setSeenAccountLang] = useState<unknown>(accountLang)
  if (accountLang !== seenAccountLang) {
    setSeenAccountLang(accountLang)
    if (isLang(accountLang)) setLangState(accountLang)
  }

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [lang])

  const signedIn = Boolean(session)
  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next)
      if (signedIn) updateUiLanguage(next).catch((err) => console.error('Could not save language:', err))
    },
    [signedIn],
  )

  const value = useMemo(() => ({ lang, t: MESSAGES[lang], setLang }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
