// Browser detection + Web API capability helpers.
// Centralizes cross-browser quirks (Safari, Edge, iOS) so feature code
// doesn't repeat UA sniffing or vendor-prefix fallbacks.

interface WebkitWindow {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
  SpeechRecognition?: new () => unknown
  webkitSpeechRecognition?: new () => unknown
}

function ua(): string {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent || ''
}

/** True for desktop & iOS Safari (but NOT Chrome/Edge/Firefox on any platform). */
export function isSafari(): boolean {
  const s = ua()
  // Chrome/Edge/Opera all include "Safari" — exclude them explicitly.
  return /Safari/i.test(s) && !/Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|FxiOS|Firefox/i.test(s)
}

/** True for any iOS device (incl. iPadOS, which may report as Mac). */
export function isIOS(): boolean {
  const s = ua()
  if (/iPad|iPhone|iPod/i.test(s)) return true
  // iPadOS 13+ masquerades as desktop Safari but has touch points.
  return /Macintosh/i.test(s) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1
}

/** True for Chromium-based Edge (Edg/ token). */
export function isEdge(): boolean {
  return /Edg/i.test(ua())
}

/** AudioContext constructor with Safari webkit prefix fallback. */
export function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as WebkitWindow
  return w.AudioContext || w.webkitAudioContext
}

/** SpeechRecognition constructor with webkit fallback (Safari/Chrome/Edge). */
export function getSpeechRecognitionClass(): (new () => unknown) | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as WebkitWindow
  return w.SpeechRecognition || w.webkitSpeechRecognition
}

/**
 * Ordered Cantonese recognition language tags to try.
 * Engines disagree on tags: Chrome/Edge accept `yue-Hant-HK`; Safari's
 * recognizer prefers `zh-HK`. We try the most specific first and fall back
 * on a `language-not-supported` error.
 */
export function cantoneseLangCandidates(): string[] {
  // Safari's speech recognizer does not know `yue-*`; lead with zh-HK there.
  if (isSafari()) return ['zh-HK', 'yue-Hant-HK', 'zh-Hant-HK']
  return ['yue-Hant-HK', 'zh-HK', 'zh-Hant-HK']
}
