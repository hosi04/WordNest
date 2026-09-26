import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Flag } from './Flag'
import { LANGS, useI18n } from './I18nContext'

interface Props {
  /** On phones, sit above the bottom navigation bar. */
  aboveBottomNav?: boolean
}

// Fixed spot; bars that slide in from the bottom (quiz feedback, z-20) simply cover it.
const POSITION = {
  withNav: 'bottom-[calc(var(--bottom-nav-h)_+_1rem)] md:bottom-6',
  withoutNav: 'bottom-[calc(var(--safe-bottom)_+_1rem)] md:bottom-6',
}

/** Round floating button in the bottom-right corner for switching the display language. */
export function LanguageFab({ aboveBottomNav = false }: Props) {
  const { lang, t, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`fixed right-4 z-[15] md:right-6 ${aboveBottomNav ? POSITION.withNav : POSITION.withoutNav}`}
    >
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t.language.label}
          className="absolute right-0 bottom-full mb-3 w-48 rounded-card border border-line bg-card p-1.5 shadow-[0_18px_40px_-16px_rgb(30_42_58/0.35)]"
        >
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === code}
              lang={code}
              onClick={() => {
                setLang(code)
                setOpen(false)
                buttonRef.current?.focus()
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left font-semibold hover:bg-soft focus-visible:bg-soft focus-visible:outline-none"
            >
              <Flag lang={code} className="h-4 w-6 shrink-0 rounded-sm ring-1 ring-line" />
              <span className="flex-1">{t.language[code]}</span>
              {lang === code && <Check className="size-4 text-accent" aria-hidden />}
            </button>
          ))}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.language.change(t.language[lang])}
        title={t.language.label}
        className="block size-14 overflow-hidden rounded-full border-[3px] border-white shadow-[0_10px_24px_-8px_rgb(30_42_58/0.5)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Flag lang={lang} className="size-full" />
      </button>
    </div>
  )
}
