import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="rounded-card border border-line bg-card p-6 sm:p-7">
      <h2 className="text-2xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export const INPUT =
  'min-h-11 w-full rounded-control border border-line bg-white px-3.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft'

export const PRIMARY_BTN =
  'flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60'

export const SECONDARY_BTN =
  'flex min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white px-5 font-semibold transition-colors hover:bg-soft disabled:opacity-60'

export function StatusText({ status }: { status: { kind: 'ok' | 'error'; text: string } | null }) {
  if (!status) return null
  return (
    <p className={`text-sm ${status.kind === 'ok' ? 'text-success' : 'text-accent'}`} role="status">
      {status.text}
    </p>
  )
}
