// Colors a deck can be given. They are stored in decks.color, so they live here as data
// (the UI theme colors stay in src/index.css). Names are in the i18n messages under settings.decks.colors.
export const DECK_COLORS = [
  { id: 'terracotta', value: '#C2461F' },
  { id: 'green', value: '#2F7D5B' },
  { id: 'blue', value: '#2F5E9E' },
  { id: 'bronze', value: '#8A6D1D' },
  { id: 'purple', value: '#7A4FA0' },
  { id: 'pink', value: '#B83A6B' },
  { id: 'teal', value: '#2E7F86' },
  { id: 'gray', value: '#5A6270' },
] as const

export const DEFAULT_DECK_COLOR = DECK_COLORS[0].value
