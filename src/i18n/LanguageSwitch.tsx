import { Flag } from './Flag'
import { LANGS, useI18n } from './I18nContext'

/** Segmented VI / EN control. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, t, setLang } = useI18n()
  return (
    <div role="radiogroup" aria-label={t.language.label} className={`inline-flex rounded-control bg-soft p-1 ${className}`}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={lang === code}
          lang={code}
          onClick={() => setLang(code)}
          className={`flex min-h-10 items-center gap-2 rounded-[9px] px-4 text-sm font-semibold transition-colors ${
            lang === code ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Flag lang={code} className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-line" />
          {t.language[code]}
        </button>
      ))}
    </div>
  )
}
