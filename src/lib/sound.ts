// Quiz feedback sounds, synthesized with the Web Audio API: no audio files to license or load,
// and they work offline. Correct = bright rising fifth (A5 → E6); wrong = soft falling low pair
// (D#4 → A#3). Kept short and quiet so they read as feedback, not as a game buzzer.

interface Note {
  freq: number
  start: number // seconds after the sound begins
  duration: number
  type: OscillatorType
  gain: number
}

const CORRECT: Note[] = [
  { freq: 880, start: 0, duration: 0.28, type: 'sine', gain: 0.22 },
  { freq: 1760, start: 0, duration: 0.18, type: 'sine', gain: 0.05 }, // bell-like overtone
  { freq: 1318.51, start: 0.09, duration: 0.34, type: 'sine', gain: 0.22 },
  { freq: 2637.02, start: 0.09, duration: 0.2, type: 'sine', gain: 0.04 },
]

const WRONG: Note[] = [
  { freq: 311.13, start: 0, duration: 0.18, type: 'triangle', gain: 0.24 },
  { freq: 233.08, start: 0.13, duration: 0.24, type: 'triangle', gain: 0.24 },
]

/** Schedules the notes on any audio context (live or offline); returns the total length in seconds. */
function schedule(ctx: BaseAudioContext, notes: Note[], at: number, lowpassHz?: number): number {
  const out = ctx.createGain()
  out.gain.value = 0.9
  if (lowpassHz) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = lowpassHz
    out.connect(filter).connect(ctx.destination)
  } else {
    out.connect(ctx.destination)
  }

  let end = 0
  for (const n of notes) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const t0 = at + n.start
    osc.type = n.type
    osc.frequency.value = n.freq
    // Quick attack, exponential decay: a soft "ding" without clicks.
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(n.gain, t0 + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + n.duration)
    osc.connect(env).connect(out)
    osc.start(t0)
    osc.stop(t0 + n.duration + 0.02)
    end = Math.max(end, n.start + n.duration)
  }
  return end
}

export function scheduleCorrect(ctx: BaseAudioContext, at = ctx.currentTime): number {
  return schedule(ctx, CORRECT, at)
}

export function scheduleWrong(ctx: BaseAudioContext, at = ctx.currentTime): number {
  return schedule(ctx, WRONG, at, 1400)
}

let liveContext: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  liveContext ??= new AudioContext()
  // Browsers start contexts suspended until a user gesture; answering is one.
  if (liveContext.state === 'suspended') void liveContext.resume()
  return liveContext
}

export function playCorrect(): void {
  const ctx = context()
  if (ctx) scheduleCorrect(ctx)
}

export function playWrong(): void {
  const ctx = context()
  if (ctx) scheduleWrong(ctx)
}

// ---- On/off preference, per device (a convenience, so localStorage is enough).

const STORAGE_KEY = 'wordnest.sound'

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // storage unavailable — the choice just won't be remembered
  }
}
