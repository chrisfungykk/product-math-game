import { useCallback, useEffect, useRef, useState } from 'react'

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

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
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

export function useSpeechRecognition(
  lang = 'yue-Hant-HK'
): UseSpeechRecognitionResult {
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [alternatives, setAlternatives] = useState<RecognitionAlternative[]>([])
  const [error, setError] = useState<string | null>(null)

  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined

  const isSupported = !!SpeechRecognitionClass

  useEffect(() => {
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
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
          // Collect all alternatives
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
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [lang, SpeechRecognitionClass])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setInterimText('')
    setFinalText('')
    setAlternatives([])
    setError(null)
    try {
      recognitionRef.current.start()
    } catch {
      // Already started — ignore
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
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
