import { useState } from 'react'

interface Props {
  name: string
  url: string | null
  /** Size + text size classes, e.g. "size-9 text-base". */
  className?: string
}

/** Profile picture, or the first letter of the name when there is none (or it fails to load). */
export function Avatar({ name, url, className = 'size-9' }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-bold text-accent uppercase ${className}`
  if (url && failedUrl !== url) {
    return (
      <span className={base} aria-hidden>
        <img src={url} alt="" className="size-full object-cover" onError={() => setFailedUrl(url)} />
      </span>
    )
  }
  return (
    <span className={base} aria-hidden>
      {name[0] ?? '?'}
    </span>
  )
}
