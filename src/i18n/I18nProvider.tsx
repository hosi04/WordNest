import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { updateUiLanguage } from '../lib/db'
import { I18nContext, isLang, MESSAGES, type Lang } from './I18nContext'

const STORAGE_KEY = 'wordnest.lang'
const STORAGE_AT_KEY = 'wordnest.lang.at'

interface Choice {
  lang: Lang
  at: number // when the user picked it (ms); 0 = default, never picked
}

function storedChoice(): Choice {
  try {
    const lang = localStorage.getItem(STORAGE_KEY)
    if (isLang(lang)) return { lang, at: Number(localStorage.getItem(STORAGE_AT_KEY)) || 0 }
  } catch {
    // storage unavailable (private mode) — fall back to the default
  }
  return { lang: 'vi', at: 0 }
}

/**
 * The display language is saved on the account (user_metadata.ui_language + ui_language_at) so it
 * follows the user across devices, and in localStorage so the login page already uses it.
 * When they disagree, the most recent choice wins — a save that was cut off by a reload can't
 * bring back the old language.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const meta = session?.user.user_metadata
  const account: Choice | null = isLang(meta?.ui_language)
    ? { lang: meta.ui_language, at: Number(meta.ui_language_at) || 0 }
    : null
  const [choice, setChoice] = useState<Choice>(storedChoice)

  // Adopt the account's language when it is newer (sign-in, or a change on another device).
  const accountKey = account ? `${account.lang}@${account.at}` : null
  const [seenAccountKey, setSeenAccountKey] = useState<string | null>(accountKey)
  if (accountKey !== seenAccountKey) {
    setSeenAccountKey(accountKey)
    // A device that never picked a language (at = 0) always follows the account.
    if (account && account.lang !== choice.lang && (account.at > choice.at || choice.at === 0)) setChoice(account)
  }

  // Remember locally; push a newer local choice up to the account.
  const signedIn = Boolean(session)
  const accountIsBehind = signedIn && choice.at > 0 && (!account || (choice.lang !== account.lang && choice.at > account.at))
  useEffect(() => {
    document.documentElement.lang = choice.lang
    try {
      localStorage.setItem(STORAGE_KEY, choice.lang)
      localStorage.setItem(STORAGE_AT_KEY, String(choice.at))
    } catch {
      // ignore
    }
    if (accountIsBehind) {
      updateUiLanguage(choice.lang, choice.at).catch((err) => console.error('Could not save language:', err))
    }
  }, [choice, accountIsBehind])

  const setLang = useCallback((lang: Lang) => setChoice({ lang, at: Date.now() }), [])

  const value = useMemo(() => ({ lang: choice.lang, t: MESSAGES[choice.lang], setLang }), [choice.lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
