import { Logo } from '../components/Logo'
import { useI18n } from '../i18n/I18nContext'
import { LanguageFab } from '../i18n/LanguageFab'

export function ConfigMissingPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-lg rounded-card border border-line bg-card p-8">
        <Logo size="h-9" tagline className="mb-6" />
        <h1 className="text-2xl">{t.config.title}</h1>
        <p className="mt-3 text-ink-muted">{t.config.body}</p>
        <pre className="mt-4 overflow-x-auto rounded-control bg-soft px-4 py-3 text-sm">
          VITE_SUPABASE_URL=…{'\n'}VITE_SUPABASE_ANON_KEY=…
        </pre>
      </div>
      <LanguageFab />
    </div>
  )
}
