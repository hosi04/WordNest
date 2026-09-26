// All Supabase access (data + auth) goes through this module.
import type { AuthError, Session } from '@supabase/supabase-js'
import { SAMPLE_DECK, SAMPLE_WORDS } from '../data/sampleDeck'
import { addDays, computeStreak, toDayKey } from './date'
import { review, type Rating } from './srs'
import { usernameToEmail } from './username'
import type { ReviewRow } from './stats'
import { supabase } from './supabase'

function client() {
  if (!supabase) throw new Error('Supabase is not configured (.env.local).')
  return supabase
}

// ---------- Auth ----------

export async function getSession(): Promise<Session | null> {
  const { data, error } = await client().auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const { data } = client().auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export type AuthProblem =
  | 'invalidCredentials'
  | 'usernameTaken'
  | 'weakPassword'
  | 'confirmEmailOn'
  | 'signupDisabled'
  | 'rateLimited'
  | 'unknown'

/** Auth failure with a UI-translatable reason (message keeps the raw Supabase text). */
export class AuthFailure extends Error {
  readonly problem: AuthProblem
  constructor(problem: AuthProblem, message: string = problem) {
    super(message)
    this.name = 'AuthFailure'
    this.problem = problem
  }
}

const AUTH_PROBLEMS: Partial<Record<string, AuthProblem>> = {
  invalid_credentials: 'invalidCredentials',
  user_already_exists: 'usernameTaken',
  email_exists: 'usernameTaken',
  weak_password: 'weakPassword',
  email_not_confirmed: 'confirmEmailOn',
  signup_disabled: 'signupDisabled',
  email_provider_disabled: 'signupDisabled',
  over_request_rate_limit: 'rateLimited',
  over_email_send_rate_limit: 'rateLimited',
}

function authFailure(error: AuthError): AuthFailure {
  const problem = error.code ? AUTH_PROBLEMS[error.code] : undefined
  return new AuthFailure(problem ?? 'unknown', error.message)
}

export async function signInWithUsername(username: string, password: string): Promise<void> {
  const { error } = await client().auth.signInWithPassword({ email: usernameToEmail(username), password })
  if (error) throw authFailure(error)
}

export async function signUpWithUsername(username: string, password: string): Promise<void> {
  const { data, error } = await client().auth.signUp({ email: usernameToEmail(username), password })
  if (error) throw authFailure(error)
  // No session means Supabase wants to confirm the (internal, undeliverable) email first.
  if (!data.session) throw new AuthFailure('confirmEmailOn')
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await client().auth.updateUser({ password })
  if (error) throw authFailure(error)
}

export async function signOut(): Promise<void> {
  const { error } = await client().auth.signOut()
  if (error) throw error
}

// ---------- Streak ----------

const reviewListeners = new Set<() => void>()

/** Subscribe to "a review was just saved" (e.g. to refresh the streak). */
export function onReviewSaved(listener: () => void): () => void {
  reviewListeners.add(listener)
  return () => reviewListeners.delete(listener)
}

export interface Streak {
  days: number
  studiedToday: boolean
}

const PAGE_SIZE = 1000

export async function getStreak(): Promise<Streak> {
  const today = toDayKey(new Date())
  const studyDays = new Set<string>()

  // Page through reviews (newest first) until the streak is broken by a gap.
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client()
      .from('reviews')
      .select('reviewed_at')
      .order('reviewed_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error

    for (const row of data) studyDays.add(toDayKey(row.reviewed_at))
    const days = computeStreak(studyDays, today)
    const oldest = data.length ? toDayKey(data[data.length - 1].reviewed_at) : null

    if (data.length < PAGE_SIZE || (oldest && oldest < addDays(today, -days - 1))) {
      return { days, studiedToday: studyDays.has(today) }
    }
  }
}

// ---------- Decks & words ----------

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type Level = (typeof LEVELS)[number]

export interface Example {
  en: string
  vi?: string
}

export interface Deck {
  id: string
  name: string
  color: string
  description: string | null
  created_at: string
}

export interface Word {
  id: string
  deck_id: string | null
  word: string
  ipa: string | null
  part_of_speech: string | null
  level: Level | null
  meaning_vi: string
  definition_en: string | null
  examples: Example[]
  synonyms: string[]
  ease: number
  interval_days: number
  reps: number
  due_at: string
  last_reviewed_at: string | null
  created_at: string
}

export type WordInput = Pick<
  Word,
  'deck_id' | 'word' | 'ipa' | 'part_of_speech' | 'level' | 'meaning_vi' | 'definition_en' | 'examples' | 'synonyms'
>

export class DuplicateWordError extends Error {
  readonly word: string
  constructor(word: string) {
    super(`Duplicate word: ${word}`)
    this.name = 'DuplicateWordError'
    this.word = word
  }
}

const UNIQUE_VIOLATION = '23505'

function wordError(error: { code?: string; message: string }, word: string): Error {
  return error.code === UNIQUE_VIOLATION ? new DuplicateWordError(word) : new Error(error.message)
}

export async function listDecks(): Promise<Deck[]> {
  const { data, error } = await client().from('decks').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function listWords(): Promise<Word[]> {
  const words: Word[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client()
      .from('words')
      .select('*')
      .order('word')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    words.push(...data)
    if (data.length < PAGE_SIZE) return words
  }
}

export async function createWord(input: WordInput): Promise<Word> {
  const { data, error } = await client().from('words').insert(input).select().single()
  if (error) throw wordError(error, input.word)
  return data
}

export async function updateWord(id: string, input: WordInput): Promise<Word> {
  const { data, error } = await client().from('words').update(input).eq('id', id).select().single()
  if (error) throw wordError(error, input.word)
  return data
}

export async function deleteWord(id: string): Promise<void> {
  const { error } = await client().from('words').delete().eq('id', id)
  if (error) throw error
}

async function countRows(table: 'decks' | 'words'): Promise<number> {
  const { count, error } = await client().from(table).select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

// One seeding run per account, so parallel callers (StrictMode, several pages) don't insert twice.
const seeding = new Map<string, Promise<void>>()

/** On a brand-new account (no decks, no words), create the sample deck. */
export async function ensureSampleData(): Promise<void> {
  const session = await getSession()
  if (!session) return
  const userId = session.user.id
  let run = seeding.get(userId)
  if (!run) {
    run = (async () => {
      const [decks, words] = await Promise.all([countRows('decks'), countRows('words')])
      if (decks > 0 || words > 0) return

      const { data: deck, error } = await client().from('decks').insert(SAMPLE_DECK).select().single()
      if (error) throw error
      const { error: wordsError } = await client()
        .from('words')
        .insert(SAMPLE_WORDS.map((w) => ({ ...w, deck_id: deck.id })))
      if (wordsError) throw wordsError
    })().catch((err) => {
      seeding.delete(userId)
      throw err
    })
    seeding.set(userId, run)
  }
  return run
}

export async function getDeck(id: string): Promise<Deck | null> {
  const { data, error } = await client().from('decks').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getWord(id: string): Promise<Word | null> {
  const { data, error } = await client().from('words').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

// ---------- Settings ----------

export interface Settings {
  new_per_day: number
  timezone: string
}

/** Reads the user's settings, creating the default row on first use. */
export async function getSettings(): Promise<Settings> {
  const session = await getSession()
  if (!session) throw new Error('Not signed in.')
  const { error: upsertError } = await client()
    .from('settings')
    .upsert({ user_id: session.user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
  if (upsertError) throw upsertError
  const { data, error } = await client().from('settings').select('new_per_day, timezone').single()
  if (error) throw error
  return data
}

// ---------- Study ----------

/** Start of today in Vietnam time, as an ISO timestamp. */
function startOfToday(): string {
  return startOfDayAgo(0)
}

/** Reviewed cards whose due time has come. */
export async function getDueWords(deckId?: string): Promise<Word[]> {
  let q = client()
    .from('words')
    .select('*')
    .not('last_reviewed_at', 'is', null)
    .lte('due_at', new Date().toISOString())
    .order('due_at')
  if (deckId) q = q.eq('deck_id', deckId)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getNewWords(limit: number, deckId?: string): Promise<Word[]> {
  if (limit <= 0) return []
  let q = client().from('words').select('*').is('last_reviewed_at', null).order('created_at').limit(limit)
  if (deckId) q = q.eq('deck_id', deckId)
  const { data, error } = await q
  if (error) throw error
  return data
}

/** How many words got their very first review today (counts against new_per_day). */
export async function countNewStartedToday(): Promise<number> {
  const since = startOfToday()
  // Only flashcard reviews count: answering a quiz question does not "start" a new word.
  const { data: today, error } = await client()
    .from('reviews')
    .select('word_id')
    .eq('mode', 'flashcard')
    .gte('reviewed_at', since)
  if (error) throw error
  const ids = [...new Set(today.map((r) => r.word_id as string))]
  if (ids.length === 0) return 0

  const { data: earlier, error: earlierError } = await client()
    .from('reviews')
    .select('word_id')
    .eq('mode', 'flashcard')
    .in('word_id', ids)
    .lt('reviewed_at', since)
  if (earlierError) throw earlierError
  const seenBefore = new Set(earlier.map((r) => r.word_id as string))
  return ids.filter((id) => !seenBefore.has(id)).length
}

/** Applies a flashcard rating: updates the card's schedule and logs the review. */
export async function recordFlashcardReview(word: Word, rating: Rating): Promise<Word> {
  const now = new Date()
  const next = review(word, rating, now.getTime())
  const { data, error } = await client()
    .from('words')
    .update({ ...next, last_reviewed_at: now.toISOString() })
    .eq('id', word.id)
    .select()
    .single()
  if (error) throw error

  const { error: logError } = await client()
    .from('reviews')
    .insert({ word_id: word.id, mode: 'flashcard', rating, reviewed_at: now.toISOString() })
  if (logError) throw logError
  reviewListeners.forEach((listener) => listener())
  return data
}

/** Logs a quiz answer; a wrong answer makes the word due for review right away. */
export async function recordQuizAnswer(word: Word, correct: boolean): Promise<void> {
  const now = new Date().toISOString()
  if (!correct) {
    const { error } = await client().from('words').update({ due_at: now }).eq('id', word.id)
    if (error) throw error
  }
  const { error } = await client()
    .from('reviews')
    .insert({ word_id: word.id, mode: 'quiz', correct, reviewed_at: now })
  if (error) throw error
  reviewListeners.forEach((listener) => listener())
}

// ---------- Dashboard ----------

/** All reviews since `since` (ISO timestamp), for charts and accuracy. */
export async function getReviewsSince(since: string): Promise<ReviewRow[]> {
  const rows: ReviewRow[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client()
      .from('reviews')
      .select('reviewed_at, mode, rating, correct')
      .gte('reviewed_at', since)
      .order('reviewed_at')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

/** Start of the Vietnam calendar day `daysAgo` days before today, as ISO. */
export function startOfDayAgo(daysAgo: number): string {
  return new Date(`${addDays(toDayKey(new Date()), -daysAgo)}T00:00:00+07:00`).toISOString()
}

// ---------- Settings page ----------

export async function updateNewPerDay(newPerDay: number): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('Not signed in.')
  const { error } = await client()
    .from('settings')
    .upsert({ user_id: session.user.id, new_per_day: newPerDay }, { onConflict: 'user_id' })
  if (error) throw error
}

/** Stored in the auth profile (user_metadata.ui_language), so no schema change is needed. */
export async function updateUiLanguage(lang: 'vi' | 'en', chosenAt: number): Promise<void> {
  const { error } = await client().auth.updateUser({ data: { ui_language: lang, ui_language_at: chosenAt } })
  if (error) throw error
}

/** Stored in the auth profile (user_metadata.full_name), so no schema change is needed. */
export async function updateDisplayName(name: string): Promise<void> {
  const { error } = await client().auth.updateUser({ data: { full_name: name.trim() } })
  if (error) throw error
}

export type DeckInput = Pick<Deck, 'name' | 'color' | 'description'>

export async function createDeck(input: DeckInput): Promise<Deck> {
  const { data, error } = await client().from('decks').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateDeck(id: string, input: DeckInput): Promise<Deck> {
  const { data, error } = await client().from('decks').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Words in the deck are kept; their deck_id becomes null (on delete set null). */
export async function deleteDeck(id: string): Promise<void> {
  const { error } = await client().from('decks').delete().eq('id', id)
  if (error) throw error
}

/** Inserts words, skipping any that already exist (unique user_id + word). Returns how many were added. */
export async function importWords(words: WordInput[]): Promise<number> {
  let added = 0
  for (let i = 0; i < words.length; i += 500) {
    const { data, error } = await client()
      .from('words')
      .upsert(words.slice(i, i + 500), { onConflict: 'user_id,word', ignoreDuplicates: true })
      .select('id')
    if (error) throw error
    added += data.length
  }
  return added
}

async function selectAll(table: 'decks' | 'words' | 'reviews' | 'settings'): Promise<unknown[]> {
  const rows: unknown[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client()
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export async function exportAll() {
  const [decks, words, reviews, settings] = await Promise.all([
    selectAll('decks'),
    selectAll('words'),
    selectAll('reviews'),
    selectAll('settings'),
  ])
  return { app: 'WordNest', version: 1, exported_at: new Date().toISOString(), decks, words, reviews, settings }
}
