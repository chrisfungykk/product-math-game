import { useState } from 'react'
import { useVoiceAnswer } from '../hooks/useVoiceAnswer'
import { validateCantonese } from '../utils/voiceValidation'
import type { VoiceInputResult } from '../types/game'

interface VoiceInputProps {
  expectedChant: string
  onResult: (result: VoiceInputResult) => void
  disabled?: boolean
  /** Match strictly (no partial credit). Default false for practice. */
  strict?: boolean
}

/**
 * Voice answer input backed by Groq Whisper (via useVoiceAnswer):
 * tap the mic, speak one line, and on a silence the clip is transcribed and
 * graded. Falls back to manual text entry where recording is unavailable.
 */
export default function VoiceInput({
  expectedChant,
  onResult,
  disabled,
  strict,
}: VoiceInputProps) {
  const { status, level, error, isSupported, start, stop } = useVoiceAnswer({
    expectedChant,
    onResult,
    strict,
  })

  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState('')

  const active = status === 'listening' || status === 'speaking'
  const analyzing = status === 'analyzing'
  const showManual = manualMode || !isSupported

  const handleManualSubmit = () => {
    if (!manualText.trim()) return
    const result = validateCantonese(manualText, expectedChant, { strict: strict === true })
    onResult(result)
    setManualText('')
  }

  const statusLabel =
    status === 'analyzing'
      ? '分析緊…'
      : status === 'speaking'
        ? '錄緊音…'
        : status === 'listening'
          ? '聆聽中…'
          : '按一下開始講'

  // Bar heights track live mic level while speaking.
  const bars = [0, 1, 2, 3, 4, 5, 6]

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Live level meter while listening/speaking */}
      {active && (
        <div className="flex items-end justify-center gap-1 h-[60px] w-full max-w-xs rounded-lg bg-black/30 px-2">
          {bars.map((i) => {
            const phase = (i % 4) * 0.15
            const h = Math.min(1, level * 6 + 0.12 + phase * (status === 'speaking' ? 1 : 0.2))
            return (
              <span
                key={i}
                className="w-2 rounded-full bg-blue-400 transition-[height] duration-100"
                style={{ height: `${Math.round(h * 100)}%`, transformOrigin: 'bottom' }}
              />
            )
          })}
        </div>
      )}

      {/* Analyzing spinner */}
      {analyzing && (
        <div className="flex items-center gap-2 text-white/80 text-sm cantonese-text">
          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          分析緊…
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-300 text-sm cantonese-text">
          {error === 'not-allowed'
            ? '需要麥克風權限'
            : error === 'unsupported'
              ? '此瀏覽器不支援錄音'
              : '語音分析失敗，請再試'}
        </p>
      )}

      {!showManual ? (
        <>
          <button
            onClick={active ? stop : start}
            disabled={disabled || analyzing}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
              active ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={active ? '停止錄音' : '開始錄音'}
          >
            {active ? '⏹️' : '🎤'}
          </button>
          <p className="text-white/80 text-sm cantonese-text">{statusLabel}</p>

          <button
            onClick={() => setManualMode(true)}
            className="text-white/60 text-xs underline cantonese-text"
          >
            改用文字輸入
          </button>
        </>
      ) : (
        <>
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
              此瀏覽器不支援錄音，請用文字輸入
            </p>
          )}
        </>
      )}
    </div>
  )
}
