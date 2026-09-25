import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { useI18n } from '../i18n/I18nContext'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { inputClassName: string }

/** Password field with a show/hide toggle. */
export function PasswordInput({ inputClassName, ...inputProps }: Props) {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...inputProps} type={visible ? 'text' : 'password'} className={`${inputClassName} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.login.hidePassword : t.login.showPassword}
        aria-pressed={visible}
        className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-ink-muted hover:bg-soft"
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  )
}
