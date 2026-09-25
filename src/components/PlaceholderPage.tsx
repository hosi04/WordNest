import type { ReactNode } from 'react'

interface Props {
  title: string
  message: string
  children?: ReactNode
}

/** Temporary page body for screens that are not built yet. */
export function PlaceholderPage({ title, message, children }: Props) {
  return (
    <section>
      <h1 className="text-4xl md:text-5xl">{title}</h1>
      <div className="mt-8 rounded-card border border-dashed border-line bg-card p-8 text-ink-muted">
        {message}
      </div>
      {children}
    </section>
  )
}
