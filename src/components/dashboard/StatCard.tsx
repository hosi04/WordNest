import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  iconClass: string // background + icon color tokens
  value: string
  label: string
  /** Makes the whole card a button (e.g. the streak card opens the streak view). */
  onClick?: () => void
  actionLabel?: string
}

export function StatCard({ icon: Icon, iconClass, value, label, onClick, actionLabel }: Props) {
  const body = (
    <span className="flex items-center gap-3 p-4 @max-2xs:gap-2.5 @xs:gap-4 @xs:p-5">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-control @max-2xs:size-9 ${iconClass}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="block min-w-0">
        <span className="block font-display text-3xl leading-none font-semibold">{value}</span>
        <span className="mt-1.5 block text-sm leading-snug text-ink-muted @max-2xs:text-[13px]">{label}</span>
      </span>
    </span>
  )

  // Container query: narrow cards shrink the icon and label so the label stays on one line.
  const card = '@container rounded-card border border-line bg-card'
  if (!onClick) return <div className={card}>{body}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={actionLabel}
      className={`${card} block w-full text-left transition-colors hover:border-gold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {body}
    </button>
  )
}
