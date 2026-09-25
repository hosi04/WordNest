import { Volume2 } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { speak } from '../lib/speech'

export function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={t.common.speak(text)}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-info-soft text-info transition-opacity hover:opacity-80 ${className}`}
    >
      <Volume2 className="size-5" aria-hidden />
    </button>
  )
}
