import { useId } from 'react'
import type { Lang } from './I18nContext'

// Flags are fixed national colors (image content), not theme tokens.

function VietnamFlag({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
      />
    </svg>
  )
}

function UnitedKingdomFlag({ className }: { className: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <clipPath id={`${id}-diag`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-diag)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

/** Flag for a display language: Vietnam for Tiếng Việt, United Kingdom for English. */
export function Flag({ lang, className = '' }: { lang: Lang; className?: string }) {
  return lang === 'vi' ? <VietnamFlag className={className} /> : <UnitedKingdomFlag className={className} />
}
