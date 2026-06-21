import { useEffect, useRef, useState } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { validateAlternatives, validateCantonese } from '../utils/voiceValidation'
import type { VoiceInputResult } from '../types/game'

interface VoiceInputProps {
  expectedChant: string
  onResult: (result: VoiceInputResult) => void
  disabled?: boolean
}

export default function VoiceInput({ expectedChant, onResult, disabled }: VoiceInputProps) {
  const {
    isSupported,
    isListening,
    interimText,
    finalText,
    alternatives,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition('yue-Hant-HK')

  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Process final recognition result
  useEffect(() => {
    if (finalText && alternatives.length > 0) {
      const result = validateAlternatives(alternatives, expectedChant)
      onResult(result)
    } else if (finalText) {
      const result = validateCantonese(finalText, expectedChant)
      onResult(result)
    }
  }, [finalText, alternatives, expectedChant, onResult])

  // Waveform visualization
  useEffect(() => {
    if (!isListening) {
      // Cleanup
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current?.close().catch(() => {
        /* ignore close errors */
      })
      audioCtxRef.current = null
      analyserRef.current = null
      return
    }

    let mounted = true

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const audioCtx = new AudioContext()
        audioCtxRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser
        drawWaveform()
      })
      .catch(() => {
        // Mic permission denied — visualization unavailable
      })

    function drawWaveform() {
      const canvas = canvasRef.current
      const analyser = analyserRef.current
      if (!canvas || !analyser) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bufferLength
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255
        const barHeight = value * canvas.height
        const hue = 200 + value * 100
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
        ctx.fillRect(
          i * barWidth,
          canvas.height - barHeight,
          barWidth - 1,
          barHeight
        )
      }

      animationRef.current = requestAnimationFrame(drawWaveform)
    }

    return () => {
      mounted = false
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isListening])

  const handleManualSubmit = () => {
    if (!manualText.trim()) return
    const result = validateCantonese(manualText, expectedChant)
    onResult(result)
    setManualText('')
  }

  // Fall back to manual mode if not supported
  const showManual = manualMode || !isSupported

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Waveform */}
      {isListening && (
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="rounded-lg bg-black/30 w-full max-w-xs"
        />
      )}

      {/* Interim text display */}
      {isListening && interimText && (
        <p className="text-white/70 text-sm cantonese-text italic">
          {interimText}...
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-300 text-sm cantonese-text">
          {error === 'no-speech'
            ? '未能識別，請重試'
            : error === 'not-allowed' || error === 'audio-capture'
            ? '需要麥克風權限'
            : '語音識別出錯'}
        </p>
      )}

      {!showManual ? (
        <>
          {/* Voice button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all active:scale-95 ${
              isListening
                ? 'bg-red-500 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={isListening ? '停止錄音' : '開始錄音'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
          <p className="text-white/80 text-sm cantonese-text">
            {isListening ? '聆聽中...' : '按住錄音'}
          </p>

          <button
            onClick={() => setManualMode(true)}
            className="text-white/60 text-xs underline cantonese-text"
          >
            改用文字輸入
          </button>
        </>
      ) : (
        <>
          {/* Manual text input fallback */}
          <div className="flex gap-2 w-full max-w-xs">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder="輸入答案"
              className="flex-1 px-3 py-2 rounded-lg cantonese-text text-gray-800"
              disabled={disabled}
            />
            <button
              onClick={handleManualSubmit}
              disabled={disabled}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cantonese-text"
            >
              提交
            </button>
          </div>
          {isSupported && (
            <button
              onClick={() => setManualMode(false)}
              className="text-white/60 text-xs underline cantonese-text"
            >
              改用語音輸入
            </button>
          )}
          {!isSupported && (
            <p className="text-white/50 text-xs cantonese-text text-center">
              此瀏覽器不支援語音輸入
            </p>
          )}
        </>
      )}
    </div>
  )
}
