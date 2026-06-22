import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GameCanvas from './GameCanvas'
import { useVadRecorder, type VadSegment } from '../hooks/useVadRecorder'
import { transcribeAudio } from '../services/SpeechToTextService'
import { scoreBlindRun } from '../utils/voiceValidation'
import { getChantsByTable } from '../utils/chantData'
import { audioService } from '../services/AudioService'
import type { AmeliaAnimation } from './scene/AmeliaCharacter'
import type { TableNumber } from '../types/game'

// Auto-finish after this much silence once the child has started reciting.
const IDLE_FINISH_MS = 6000
// Grace period to let in-flight transcriptions resolve before scoring.
const DRAIN_MS = 2500

export default function BlindModeScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const table = (location.state?.startTable as TableNumber) ?? 9

  const lines = getChantsByTable(table)
  const total = lines.length

  const [phase, setPhase] = useState<'ready' | 'reciting' | 'done'>('ready')
  const [matched, setMatched] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [animation, setAnimation] = useState<AmeliaAnimation>('idle')

  const startedAtRef = useRef(0)
  const lastSegmentAtRef = useRef(0)
  const segmentsRef = useRef<string[]>([])
  const segIndexRef = useRef(0)
  const pendingRef = useRef(0)
  const doneRef = useRef(false)
  const clockRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    recorderStopRef.current()
    if (clockRef.current) clearInterval(clockRef.current)
    setPhase('done')

    const elapsedSec = Math.max(0, (Date.now() - startedAtRef.current) / 1000)

    const wrap = () => {
      const transcript = segmentsRef.current.filter(Boolean).join(' ')
      const score = scoreBlindRun(transcript, lines)
      setAnimation(score.correct === total ? 'celebrate' : 'idle')
      audioService.playEffect(score.correct === total ? 'level-complete' : 'correct')
      navigate('/results', {
        state: {
          blind: true,
          table,
          perLine: score.perLine,
          correct: score.correct,
          total: score.total,
          elapsedSec,
          transcript,
        },
      })
    }

    // Wait briefly for any pending Groq calls so late lines still count.
    if (pendingRef.current > 0) {
      const t0 = Date.now()
      const poll = setInterval(() => {
        if (pendingRef.current === 0 || Date.now() - t0 > DRAIN_MS) {
          clearInterval(poll)
          wrap()
        }
      }, 150)
    } else {
      wrap()
    }
  }, [lines, navigate, table, total])

  const finishRef = useRef(finish)
  finishRef.current = finish

  const handleSegment = useCallback(
    (seg: VadSegment) => {
      const idx = segIndexRef.current++
      pendingRef.current += 1
      lastSegmentAtRef.current = Date.now()
      setAnalyzing(true)

      transcribeAudio(seg.blob, seg.filename)
        .then(({ text }) => {
          segmentsRef.current[idx] = text
        })
        .catch(() => {
          segmentsRef.current[idx] = ''
        })
        .finally(() => {
          pendingRef.current -= 1
          if (pendingRef.current === 0) setAnalyzing(false)

          const joined = segmentsRef.current.filter(Boolean).join(' ')
          const score = scoreBlindRun(joined, lines)
          setMatched(score.correct)
          if (score.correct >= total && !doneRef.current) {
            finishRef.current()
          }
        })
    },
    [lines, total]
  )

  const recorder = useVadRecorder({ mode: 'continuous', onSegment: handleSegment })
  const recorderStopRef = useRef(recorder.stop)
  recorderStopRef.current = recorder.stop

  // Count-up clock + idle auto-finish.
  useEffect(() => {
    if (phase !== 'reciting') return
    clockRef.current = setInterval(() => {
      setElapsed((Date.now() - startedAtRef.current) / 1000)
      const sinceLast = Date.now() - lastSegmentAtRef.current
      if (segIndexRef.current > 0 && sinceLast > IDLE_FINISH_MS && !doneRef.current) {
        finishRef.current()
      }
    }, 100)
    return () => {
      if (clockRef.current) clearInterval(clockRef.current)
    }
  }, [phase])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      recorderStopRef.current()
      if (clockRef.current) clearInterval(clockRef.current)
    }
  }, [])

  const handleStart = () => {
    audioService.unlock()
    doneRef.current = false
    segmentsRef.current = []
    segIndexRef.current = 0
    pendingRef.current = 0
    startedAtRef.current = Date.now()
    lastSegmentAtRef.current = Date.now()
    setMatched(0)
    setElapsed(0)
    setAnalyzing(false)
    setAnimation('chant')
    setPhase('reciting')
    void recorder.start()
  }

  const handleExit = () => {
    recorder.stop()
    audioService.stopSpeaking()
    navigate('/')
  }

  const supported = recorder.isSupported
  const active = recorder.state === 'listening' || recorder.state === 'speaking'

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-white cantonese-text">加載 3D 場景...</p>
            </div>
          }
        >
          <GameCanvas animation={animation} audioLevel={active ? recorder.level : 0} />
        </Suspense>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-between py-10 px-4 z-10 pointer-events-none">
        {/* Header */}
        <div className="flex flex-col items-center gap-1 pointer-events-auto text-center">
          <h1 className="text-white text-3xl font-bold cantonese-text drop-shadow-lg">
            盲背 {table} 因歌
          </h1>
          <p className="text-white/70 cantonese-text text-sm">
            由 {table}×1 順住背到 {table}×{table}，唔使停！
          </p>
        </div>

        {/* Center: timer + progress (no chant shown — recite from memory) */}
        <div className="flex flex-col items-center gap-6 pointer-events-auto">
          <div className="text-center">
            <div className="text-white font-mono font-bold text-6xl drop-shadow-lg">
              {elapsed.toFixed(1)}
            </div>
            <div className="text-white/60 cantonese-text text-sm">秒</div>
          </div>

          {/* Progress dots — how many lines recognized so far */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs">
            {lines.map((line, i) => (
              <span
                key={line.multiplier}
                className={`w-4 h-4 rounded-full transition-colors ${
                  i < matched ? 'bg-green-400' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
          <p className="text-white/80 cantonese-text">
            已背 {matched}/{total} 句
          </p>

          {/* Live mic level */}
          {active && (
            <div className="flex items-end justify-center gap-1 h-[40px] w-44 rounded-lg bg-black/30 px-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const h = Math.min(1, recorder.level * 6 + 0.12)
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
          {analyzing && (
            <div className="flex items-center gap-2 text-white/70 text-xs cantonese-text">
              <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              分析緊…
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 pointer-events-auto w-full max-w-sm">
          {recorder.error && (
            <p className="text-red-300 text-sm cantonese-text">
              {recorder.error === 'not-allowed'
                ? '需要麥克風權限'
                : '此瀏覽器不支援錄音'}
            </p>
          )}

          {phase === 'ready' && (
            <>
              <button
                onClick={handleStart}
                disabled={!supported}
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
                aria-label="開始盲背"
              >
                🎤
              </button>
              <p className="text-white/80 cantonese-text">點一下開始，然後一口氣背</p>
              {!supported && (
                <p className="text-white/50 text-xs cantonese-text text-center">
                  此瀏覽器不支援錄音，請用 Chrome / Edge / Safari
                </p>
              )}
            </>
          )}

          {phase === 'reciting' && (
            <button
              onClick={() => finish()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full cantonese-text text-lg shadow-lg active:scale-95 transition-all"
            >
              完成
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleExit}
        className="absolute top-4 left-4 z-20 bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded-lg cantonese-text text-sm transition-all"
      >
        ← 返主頁
      </button>
    </div>
  )
}
