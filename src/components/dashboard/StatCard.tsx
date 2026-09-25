import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  iconClass: string // background + icon color tokens
  value: string
  label: string
}

export function StatCard({ icon: Icon, iconClass, value, label }: Props) {
  return (
    // Container query: narrow cards shrink the icon and label so the label stays on one line.
    <div className="@container rounded-card border border-line bg-card">
      <div className="flex items-center gap-3 p-4 @max-2xs:gap-2.5 @xs:gap-4 @xs:p-5">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-control @max-2xs:size-9 ${iconClass}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-3xl leading-none font-semibold">{value}</p>
          <p className="mt-1.5 text-sm leading-snug text-ink-muted @max-2xs:text-[13px]">{label}</p>
        </div>
      </div>
    </div>
  )
}
