import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '../../i18n/I18nContext'

/** Full-size profile picture over a dark backdrop; Esc, the X or a click outside closes it. */
export function AvatarViewer({ name, url, onClose }: { name: string; url: string; onClose: () => void }) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      aria-label={t.profile.photoOf(name)}
      className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-ink/80"
    >
      <img
        src={url}
        alt={t.profile.photoOf(name)}
        className="size-[min(85vw,85vh,40rem)] rounded-card object-cover shadow-2xl"
      />
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        aria-label={t.common.close}
        className="absolute -top-3 -right-3 flex size-11 items-center justify-center rounded-full bg-card text-ink shadow-lg hover:bg-soft"
      >
        <X className="size-5" aria-hidden />
      </button>
    </dialog>
  )
}
