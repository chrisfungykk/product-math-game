import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GameCanvas from './GameCanvas'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { validateCantonese, validateAlternatives } from '../utils/voiceValidation'
import { getChantsByTable } from '../utils/chantData'
import { audioService } from '../services/AudioService'
import { isSafari, cantoneseLangCandidates } from '../utils/browser'
import type { TableNumber, VoiceInputResult } from '../types/game'
import type { AmeliaAnimation } from './scene/AmeliaCharacter'

const TIME_LIMIT = 10 // seconds

interface TimedResult {
  table: TableNumber
  passed: boolean
  elapsedSec: number
  confidence: number
  spokenText: string
}

export default function TimedGameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const startTable = (location.state?.startTable as TableNumber) ?? 9

  const {
    isSupported,
    isListening,
    interimText,
    finalText,
    alternatives,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(cantoneseLangCandidates(), true)

  const safari = isSafari()

  const [phase, setPhase] = useState<'ready' | 'counting' | 'done'>('ready')
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [animation, setAnimation] = useState<AmeliaAnimation>('idle')
  const [timedResult, setTimedResult] = useState<TimedResult | null>(null)
  const [manualText, setManualText] = useState('')

  const startedAtRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const doneRef = useRef(false)

  const lines = getChantsByTable(startTable)
  const expectedFull = lines.map((l) => l.cantonese).join('')

  // Finish: validate and show result
  const finish = useCallback(
    (elapsed: number) => {
      if (doneRef.current) return
      doneRef.current = true
      stopListening()
      if (intervalRef.current) clearInterval(intervalRef.current)

      const spoken = finalText || interimText
      let result: VoiceInputResult
      if (alternatives.length > 1) {
        result = validateAlternatives(alternatives, expectedFull)
      } else {
        result = validateCantonese(spoken, expectedFull)
      }

      const passed = result.isCorrect
      audioService.playEffect(passed ? 'correct' : 'incorrect')
      setAnimation(passed ? 'celebrate' : 'error')
      setTimedResult({
        table: startTable,
        passed,
        elapsedSec: Math.min(elapsed, TIME_LIMIT),
        confidence: result.confidence,
        spokenText: result.spokenText,
      })

      setTimeout(() => {
        navigate('/results', {
          state: {
            timed: true,
            table: startTable,
            passed,
            elapsedSec: Math.min(elapsed, TIME_LIMIT),
            confidence: result.confidence,
            spokenText: result.spokenText,
          },
        })
      }, 2500)
    },
    [
      stopListening, finalText, interimText, alternatives, expectedFull,
      startTable, navigate,
    ]
  )

  // Countdown timer
  useEffect(() => {
    if (phase !== 'counting') return
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000
      const remaining = Math.max(0, TIME_LIMIT - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        finish(TIME_LIMIT)
      }
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase, finish])

  // Start
  const handleStart = () => {
    audioService.unlock()
    resetTranscript()
    startedAtRef.current = Date.now()
    setTimeLeft(TIME_LIMIT)
    setPhase('counting')
    startListening()
  }

  // Manual stop (tap mic while counting)
  const handleStop = () => {
    const elapsed = (Date.now() - startedAtRef.current) / 1000
    finish(elapsed)
  }

  // Manual text submit fallback
  const handleManualSubmit = () => {
    if (!manualText.trim()) return
    audioService.unlock()
    // Measure time manually — start "counting" on first submit
    if (phase === 'ready') {
      startedAtRef.current = Date.now()
    }
    const elapsed = (Date.now() - startedAtRef.current) / 1000
    const result = validateCantonese(manualText, expectedFull)
    doneRef.current = true
    if (intervalRef.current) clearInterval(intervalRef.current)
    setAnimation(result.isCorrect ? 'celebrate' : 'error')
    audioService.playEffect(result.isCorrect ? 'correct' : 'incorrect')
    setTimedResult({
      table: startTable,
      passed: result.isCorrect,
      elapsedSec: Math.min(elapsed, TIME_LIMIT),
      confidence: result.confidence,
      spokenText: result.spokenText,
    })
    setTimeout(() => {
      navigate('/results', {
        state: {
          timed: true,
          table: startTable,
          passed: result.isCorrect,
          elapsedSec: Math.min(elapsed, TIME_LIMIT),
          confidence: result.confidence,
          spokenText: result.spokenText,
        },
      })
    }, 2500)
  }

  // Countdown bar color
  const barFraction = timeLeft / TIME_LIMIT
  const barColor =
    barFraction > 0.5
      ? 'bg-green-500'
      : barFraction > 0.25
        ? 'bg-yellow-400'
        : 'bg-red-500'

  // Done flash
  if (phase === 'done' && timedResult) {
    const { passed, elapsedSec } = timedResult
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-7xl mb-4 animate-bounce">
          {passed ? '🎉' : '⏰'}
        </div>
        <h1 className="text-white text-4xl font-bold cantonese-text mb-2">
          {passed ? '過關！' : '時間到！'}
        </h1>
        <p className="text-white/80 cantonese-text text-xl">
          {elapsedSec.toFixed(1)} 秒
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Canvas background */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-white cantonese-text">加載 3D 場景...</p>
            </div>
          }
        >
          <GameCanvas animation={animation} audioLevel={0} />
        </Suspense>
      </div>

      {/* Countdown bar */}
      {phase === 'counting' && (
        <div className="absolute top-0 inset-x-0 h-2 bg-gray-800/50 z-10">
          <div
            className={`h-full ${barColor} transition-all duration-100 ease-linear`}
            style={{ width: `${barFraction * 100}%` }}
          />
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-8 px-4 z-10 pointer-events-none">
        {/* Top: table title + timer */}
        <div className="flex flex-col items-center gap-1 pointer-events-auto">
          <h1 className="text-white text-3xl font-bold cantonese-text drop-shadow-lg">
            背 {startTable} 因歌
          </h1>
          <p className="text-white/70 cantonese-text text-sm">
            一口氣讀晒成個表 • {TIME_LIMIT} 秒內
          </p>
          {phase === 'counting' && (
            <div className="text-white font-mono font-bold mt-1">
              <span
                className={`text-3xl ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}
              >
                {timeLeft.toFixed(1)}
              </span>
              <span className="text-lg text-white/60"> 秒</span>
            </div>
          )}
        </div>

        {/* Center: chant reference table */}
        <div className="bg-black/40 backdrop-blur rounded-xl px-6 py-4 pointer-events-auto max-h-[45vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-x-6 gap-y-1">
            {lines.map((line) => (
              <div key={line.multiplier} className="text-white text-sm cantonese-text whitespace-nowrap">
                {line.cantonese}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: mic / input area */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm pointer-events-auto">
          {/* Interim text */}
          {isListening && interimText && (
            <p className="text-white/70 text-sm cantonese-text italic text-center">
              {interimText}...
            </p>
          )}
          {isListening && safari && (
            <div className="flex items-end justify-center gap-1 h-[40px] w-full max-w-xs rounded-lg bg-black/30">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="w-2 rounded-full bg-blue-400"
                  style={{
                    height: '70%',
                    transformOrigin: 'bottom',
                    animation: `voicePulse 0.9s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-300 text-sm cantonese-text">
              {error === 'no-speech'
                ? '未能識別，請重試'
                : error === 'not-allowed' || error === 'audio-capture'
                  ? '需要麥克風權限'
                  : '語音識別出錯'}
            </p>
          )}

          {/* Voice mode */}
          {isSupported ? (
            <div className="flex flex-col items-center gap-2">
              {phase === 'ready' && (
                <button
                  onClick={handleStart}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label="開始錄音"
                >
                  🎤
                </button>
              )}
              {phase === 'counting' && (
                <button
                  onClick={handleStop}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg bg-red-500 animate-pulse active:scale-95 transition-all"
                  aria-label="停止錄音"
                >
                  ⏹️
                </button>
              )}
              <p className="text-white/80 text-sm cantonese-text">
                {phase === 'ready'
                  ? '點擊開始挑戰'
                  : phase === 'counting'
                    ? '讀完按停止'
                    : ''}
              </p>
              <button
                onClick={() => setPhase('ready')}
                className="text-white/50 text-xs underline cantonese-text"
              >
                改用文字輸入
              </button>
            </div>
          ) : (
            /* Manual input fallback */
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="輸入成個乘數表..."
                className="w-full px-3 py-2 rounded-lg cantonese-text text-gray-800 text-sm resize-none"
                rows={3}
              />
              <button
                onClick={handleManualSubmit}
                disabled={doneRef.current}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95"
              >
                提交
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded-lg cantonese-text text-sm transition-all"
      >
        ← 返主頁
      </button>
    </div>
  )
}
