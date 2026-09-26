// Primary: Free Dictionary API (https://dictionaryapi.dev) — has IPA and synonyms but is often down.
// Fallback: Wiktionary REST API — definitions and examples only.
const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/'
const WIKTIONARY_API = 'https://en.wiktionary.org/api/rest_v1/page/definition/'
const TIMEOUT_MS = 5000

export type DictionarySource = 'freeDictionary' | 'wiktionary'

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

interface WiktionaryDefinition {
  definition?: string
  examples?: string[]
  parsedExamples?: { example?: string }[]
}

interface WiktionaryEntry {
  partOfSpeech?: string
  definitions?: WiktionaryDefinition[]
}

/** Wiktionary returns HTML; keep only the top-level text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<(ol|ul|style|script)[\s\S]*?<\/\1>/g, ' ') // nested sub-senses, inline CSS
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseWiktionary(data: { en?: WiktionaryEntry[] }): DictionaryResult | null {
  const entries = data.en ?? []
  const definitions = entries.flatMap((e) => e.definitions ?? [])
  const definition = definitions.map((d) => stripHtml(d.definition ?? '')).find(Boolean) ?? null
  if (!definition) return null
  const example =
    definitions
      .flatMap((d) => [...(d.parsedExamples ?? []).map((p) => p.example ?? ''), ...(d.examples ?? [])])
      .map(stripHtml)
      .find(Boolean) ?? null
  return {
    ipa: null,
    partOfSpeech: entries[0]?.partOfSpeech?.toLowerCase() ?? null,
    definition,
    example,
    synonyms: [],
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

async function fetchJson(url: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  return { status: res.status, body: res.ok ? await res.json() : null }
}

async function fromFreeDictionary(word: string): Promise<DictionaryResult | null> {
  const { status, body } = await fetchJson(FREE_DICTIONARY_API + encodeURIComponent(word))
  if (status === 404) return null
  if (status !== 200) throw new DictionaryError(status)
  return parseEntries(body as ApiEntry[])
}

async function fromWiktionary(word: string): Promise<DictionaryResult | null> {
  const { status, body } = await fetchJson(WIKTIONARY_API + encodeURIComponent(word.replace(/ /g, '_')))
  if (status === 404) return null
  if (status !== 200) throw new DictionaryError(status)
  return parseWiktionary(body as { en?: WiktionaryEntry[] })
}

export interface LookupResult extends DictionaryResult {
  source: DictionarySource
}

/**
 * Looks the word up in Free Dictionary, falling back to Wiktionary when it is down, slow or
 * has no entry. Returns null when neither knows the word; throws when both are unreachable.
 */
export async function lookupWord(input: string): Promise<LookupResult | null> {
  const word = input.trim().toLowerCase()
  let primaryError: unknown = null
  try {
    const result = await fromFreeDictionary(word)
    if (result) return { ...result, source: 'freeDictionary' }
  } catch (err) {
    primaryError = err
  }
  try {
    const result = await fromWiktionary(word)
    return result && { ...result, source: 'wiktionary' }
  } catch (err) {
    throw primaryError ?? err
  }
}
