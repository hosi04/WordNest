/** Pronounce English text with the browser's Web Speech API (en-US voice). */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  const voice = synth.getVoices().find((v) => v.lang === 'en-US')
  if (voice) utterance.voice = voice
  synth.cancel()
  synth.speak(utterance)
}
