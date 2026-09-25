export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="flex size-10 items-center justify-center rounded-control bg-logo font-display text-xl font-semibold text-ink">
        W
      </span>
      <span className="font-display text-2xl font-semibold">WordNest</span>
    </span>
  )
}
