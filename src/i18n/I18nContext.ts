import { createContext, useContext } from 'react'
import { en } from './en'
import { vi, type Messages } from './vi'

export type Lang = 'vi' | 'en'

export const LANGS: Lang[] = ['vi', 'en']
export const MESSAGES: Record<Lang, Messages> = { vi, en }

export function isLang(value: unknown): value is Lang {
  return value === 'vi' || value === 'en'
}

export interface I18nState {
  lang: Lang
  t: Messages
  setLang: (lang: Lang) => void
}

export const I18nContext = createContext<I18nState>({ lang: 'vi', t: vi, setLang: () => {} })

export function useI18n(): I18nState {
  return useContext(I18nContext)
}
