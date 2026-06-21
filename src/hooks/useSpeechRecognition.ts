import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cantoneseLangCandidates,
  getSpeechRecognitionClass,
  isSafari,
} from '../utils/browser'

// Web Speech API types (not in standard lib.dom)
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionResultEvent {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      length: number
      [index: number]: { transcript: string; confidence: number }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition
    webkitSpeechRecognition?: new () => ISpeechRecognition
  }
}

export interface RecognitionAlternative {
  transcript: string
  confidence: number
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean
  isListening: boolean
  interimText: string
  finalText: string
  alternatives: RecognitionAlternative[]
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

/**
 * Cantonese speech recognition with cross-browser handling.
 *
 * - Resolves the recognizer via webkit fallback (Safari/Chrome/Edge).
 * - Tries multiple language tags in order; Safari rejects `yue-*`, so we
 *   retry with `zh-HK` on a `language-not-supported` error.
 * - Optimistic listening state for Safari, whose `onstart` is unreliable.
 *
 * @param langCandidates ordered BCP-47 tags to try (default: Cantonese set).
 */
export function useSpeechRecognition(
  langCandidates: string[] = cantoneseLangCandidates()
): UseSpeechRecognitionResult {
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const langIndexRef = useRef(0)
  const retryingRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [alternatives, setAlternatives] = useState<RecognitionAlternative[]>([])
  const [error, setError] = useState<string | null>(null)

  const SpeechRecognitionClass = getSpeechRecognitionClass() as
    | (new () => ISpeechRecognition)
    | undefined
  const isSupported = !!SpeechRecognitionClass

  // Stable ref to candidates so the recognizer instance lives across renders.
  const candidatesRef = useRef(langCandidates)
  candidatesRef.current = langCandidates

  useEffect(() => {
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.lang = candidatesRef.current[langIndexRef.current] ?? 'zh-HK'
    recognition.continuous = false
    recognition.interimResults = true
    // Safari often returns only 1 alternative regardless; ask for more anyway.
    recognition.maxAlternatives = 5

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let interim = ''
      let final = ''
      const alts: RecognitionAlternative[] = []

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          final += transcript
          // Collect all alternatives (Safari may expose only one)
          for (let j = 0; j < result.length; j++) {
            alts.push({
              transcript: result[j].transcript,
              confidence: result[j].confidence,
            })
          }
        } else {
          interim += transcript
        }
      }

      if (interim) setInterimText(interim)
      if (final) {
        setFinalText(final)
        setAlternatives(alts)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Language not supported by this engine → advance to next candidate
      // tag and transparently retry (covers Safari rejecting `yue-*`).
      if (
        event.error === 'language-not-supported' &&
        langIndexRef.current < candidatesRef.current.length - 1
      ) {
        langIndexRef.current += 1
        retryingRef.current = true
        try {
          recognition.abort()
        } catch {
          /* not started */
        }
        return
      }
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      // If we aborted to switch languages, restart with the new tag.
      if (retryingRef.current) {
        retryingRef.current = false
        recognition.lang = candidatesRef.current[langIndexRef.current] ?? 'zh-HK'
        try {
          recognition.start()
          return
        } catch {
          /* fall through to stop */
        }
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.abort()
      } catch {
        /* Safari throws if never started — safe to ignore */
      }
      recognitionRef.current = null
    }
    // Recreate only if the recognizer class itself changes (effectively once).
  }, [SpeechRecognitionClass])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setInterimText('')
    setFinalText('')
    setAlternatives([])
    setError(null)
    // Safari's onstart is unreliable — flip listening on optimistically so the
    // UI (and mic visual) react immediately; onend/onerror will clear it.
    if (isSafari()) setIsListening(true)
    try {
      recognitionRef.current.start()
    } catch {
      // Already started — ignore (Safari throws InvalidStateError)
    }
  }, [])

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* not started */
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setInterimText('')
    setFinalText('')
    setAlternatives([])
  }, [])

  return {
    isSupported,
    isListening,
    interimText,
    finalText,
    alternatives,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
