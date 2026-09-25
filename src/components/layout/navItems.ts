import { Book, ChartNoAxesColumn, CircleHelp, Copy, House, type LucideIcon } from 'lucide-react'
import type { Messages } from '../../i18n/vi'

type NavKey = keyof Messages['nav']

export interface NavItem {
  to: string
  label: NavKey
  shortLabel: NavKey
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'overview', shortLabel: 'overview', icon: House },
  { to: '/study', label: 'study', shortLabel: 'study', icon: Copy },
  { to: '/quiz', label: 'quiz', shortLabel: 'quiz', icon: CircleHelp },
  { to: '/words', label: 'words', shortLabel: 'wordsShort', icon: Book },
  { to: '/stats', label: 'stats', shortLabel: 'stats', icon: ChartNoAxesColumn },
]
