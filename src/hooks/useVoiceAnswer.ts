import { useCallback, useRef, useState } from 'react'
import { useVadRecorder, type VadSegment } from './useVadRecorder'
import { transcribeAudio } from '../services/SpeechToTextService'
import { validateCantonese } from '../utils/voiceValidation'
import type { VoiceInputResult } from '../types/game'

export type VoiceAnswerStatus = 'idle' | 'listening' | 'speaking' | 'analyzing'

interface UseVoiceAnswerOptions {
  expectedChant: string
  onResult: (result: VoiceInputResult) => void
  strict?: boolean
}

export interface UseVoiceAnswerResult {
  status: VoiceAnswerStatus
  level: number
  lastTranscript: string
  error: string | null
  isSupported: boolean
  start: () => void
  stop: () => void
}

/**
 * Single-utterance voice answer for practice/timed modes:
 * record one VAD segment → Groq transcription → Cantonese validation → onResult.
 * The recorder self-stops after one segment; call start() again to retry.
 */
export function useVoiceAnswer(options: UseVoiceAnswerOptions): UseVoiceAnswerResult {
  const [analyzing, setAnalyzing] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [sttError, setSttError] = useState<string | null>(null)

  const expectedRef = useRef(options.expectedChant)
  expectedRef.current = options.expectedChant
  const strictRef = useRef(options.strict)
  strictRef.current = options.strict
  const onResultRef = useRef(options.onResult)
  onResultRef.current = options.onResult

  const handleSegment = useCallback(async (seg: VadSegment) => {
    setAnalyzing(true)
    setSttError(null)
    try {
      const { text } = await transcribeAudio(seg.blob, seg.filename)
      setLastTranscript(text)
      const result = validateCantonese(text, expectedRef.current, {
        strict: strictRef.current === true,
      })
      onResultRef.current(result)
    } catch {
      setSttError('stt-failed')
      onResultRef.current({
        spokenText: '',
        matchedChant: null,
        confidence: 0,
        isCorrect: false,
        feedback: '語音分析失敗，請再試',
      })
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const recorder = useVadRecorder({ mode: 'single', onSegment: handleSegment })

  const start = useCallback(() => {
    setSttError(null)
    void recorder.start()
  }, [recorder])

  const status: VoiceAnswerStatus = analyzing ? 'analyzing' : recorder.state

  return {
    status,
    level: recorder.level,
    lastTranscript,
    error: sttError ?? recorder.error,
    isSupported: recorder.isSupported,
    start,
    stop: recorder.stop,
  }
}
