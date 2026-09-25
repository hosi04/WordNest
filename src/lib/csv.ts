import { LEVELS, type Level, type WordInput } from './db'

export const CSV_COLUMNS = ['word', 'meaning_vi', 'part_of_speech', 'level', 'example_en', 'example_vi'] as const

/** RFC 4180-style parser: quoted fields, "" escapes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '') // strip BOM from Excel exports

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

export type CsvWord = Omit<WordInput, 'deck_id'>

export type CsvError =
  | { kind: 'empty' }
  | { kind: 'missingColumns'; columns: string[] }
  | { kind: 'missingFields'; line: number }
  | { kind: 'duplicate'; line: number; word: string }
  | { kind: 'badLevel'; line: number; level: string }

export interface CsvResult {
  words: CsvWord[]
  errors: CsvError[]
}

/** Turns CSV text with the columns in CSV_COLUMNS (header row required) into words to import. */
export function wordsFromCsv(text: string): CsvResult {
  const [header, ...rows] = parseCsv(text)
  if (!header) return { words: [], errors: [{ kind: 'empty' }] }

  const index = new Map(header.map((h, i) => [h.trim().toLowerCase(), i]))
  const missing = ['word', 'meaning_vi'].filter((c) => !index.has(c))
  if (missing.length) {
    return { words: [], errors: [{ kind: 'missingColumns', columns: missing }] }
  }

  const get = (row: string[], col: (typeof CSV_COLUMNS)[number]) => {
    const i = index.get(col)
    return i === undefined ? '' : (row[i] ?? '').trim()
  }

  const words: CsvWord[] = []
  const errors: CsvError[] = []
  const seen = new Set<string>()

  rows.forEach((row, i) => {
    const line = i + 2 // 1-based, after the header
    const word = get(row, 'word')
    const meaning = get(row, 'meaning_vi')
    if (!word || !meaning) {
      errors.push({ kind: 'missingFields', line })
      return
    }
    const key = word.toLowerCase()
    if (seen.has(key)) {
      errors.push({ kind: 'duplicate', line, word })
      return
    }
    seen.add(key)

    const rawLevel = get(row, 'level').toUpperCase()
    const level = (LEVELS as readonly string[]).includes(rawLevel) ? (rawLevel as Level) : null
    if (rawLevel && !level) errors.push({ kind: 'badLevel', line, level: rawLevel })

    const exampleEn = get(row, 'example_en')
    words.push({
      word,
      meaning_vi: meaning,
      part_of_speech: get(row, 'part_of_speech') || null,
      level,
      ipa: null,
      definition_en: null,
      examples: exampleEn ? [{ en: exampleEn, vi: get(row, 'example_vi') }] : [],
      synonyms: [],
    })
  })

  return { words, errors }
}
