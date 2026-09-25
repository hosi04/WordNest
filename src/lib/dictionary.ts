// Free Dictionary API: https://dictionaryapi.dev
const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

export interface DictionaryResult {
  ipa: string | null
  partOfSpeech: string | null
  definition: string | null
  example: string | null
  synonyms: string[]
}

interface ApiDefinition {
  definition?: string
  example?: string
  synonyms?: string[]
}

interface ApiEntry {
  phonetic?: string
  phonetics?: { text?: string }[]
  meanings?: { partOfSpeech?: string; definitions?: ApiDefinition[]; synonyms?: string[] }[]
}

const MAX_SYNONYMS = 6

export function parseEntries(entries: ApiEntry[]): DictionaryResult | null {
  if (!Array.isArray(entries) || entries.length === 0) return null

  const ipa =
    entries.map((e) => e.phonetic).find(Boolean) ??
    entries.flatMap((e) => e.phonetics ?? []).map((p) => p.text).find(Boolean) ??
    null

  const meanings = entries.flatMap((e) => e.meanings ?? [])
  const definitions = meanings.flatMap((m) => m.definitions ?? [])
  const synonyms = [
    ...new Set([
      ...meanings.flatMap((m) => m.synonyms ?? []),
      ...definitions.flatMap((d) => d.synonyms ?? []),
    ]),
  ].slice(0, MAX_SYNONYMS)

  return {
    ipa,
    partOfSpeech: meanings[0]?.partOfSpeech ?? null,
    definition: meanings[0]?.definitions?.[0]?.definition ?? null,
    example: definitions.map((d) => d.example).find(Boolean) ?? null,
    synonyms,
  }
}

export class DictionaryError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`Dictionary error ${status}`)
    this.name = 'DictionaryError'
    this.status = status
  }
}

/** Returns null when the word is not in the dictionary. */
export async function lookupWord(word: string): Promise<DictionaryResult | null> {
  const res = await fetch(API + encodeURIComponent(word.trim().toLowerCase()))
  if (res.status === 404) return null
  if (!res.ok) throw new DictionaryError(res.status)
  return parseEntries(await res.json())
}
