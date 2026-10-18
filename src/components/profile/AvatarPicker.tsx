import { Camera, LoaderCircle } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { uploadAvatar } from '../../lib/db'
import { toSquareWebp } from '../../lib/image'
import { Avatar } from '../Avatar'
import { StatusText } from '../settings/SettingsSection'
import { AvatarViewer } from './AvatarViewer'
import { errorMessage } from '../../lib/errors'

const AVATAR_SIZE = 'size-28 text-5xl ring-4 ring-card sm:size-32'

type Status = { kind: 'ok' | 'error'; text: string } | null

/** Large profile picture (click to view it full size) with a camera button to upload a new one. */
export function AvatarPicker({ name, url }: { name: string; url: string | null }) {
  const { t } = useI18n()
  const p = t.profile
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [viewing, setViewing] = useState(false)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // picking the same file again should still fire onChange
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus({ kind: 'error', text: p.notImage })
      return
    }
    setUploading(true)
    setStatus(null)
    try {
      await uploadAvatar(await toSquareWebp(file))
      setStatus({ kind: 'ok', text: p.photoSaved })
    } catch (err) {
      setStatus({ kind: 'error', text: p.photoError(errorMessage(err)) })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {url ? (
          <button
            type="button"
            onClick={() => setViewing(true)}
            aria-label={p.viewPhoto}
            className="block cursor-zoom-in rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Avatar name={name} url={url} className={AVATAR_SIZE} />
          </button>
        ) : (
          <Avatar name={name} url={url} className={AVATAR_SIZE} />
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          aria-label={uploading ? p.uploading : p.changePhoto}
          title={p.changePhoto}
          className="absolute right-0 bottom-0 flex size-10 items-center justify-center rounded-full border-2 border-card bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-80"
        >
          {uploading ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-5" aria-hidden />
          )}
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={handleFile} tabIndex={-1} />
      </div>
      <StatusText status={status} />
      {viewing && url && <AvatarViewer name={name} url={url} onClose={() => setViewing(false)} />}
    </div>
  )
}
