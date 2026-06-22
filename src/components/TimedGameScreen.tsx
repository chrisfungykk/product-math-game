import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GameCanvas from './GameCanvas'
import { useVoiceAnswer } from '../hooks/useVoiceAnswer'
import { validateCantonese } from '../utils/voiceValidation'
import { getChantsByTable } from '../utils/chantData'
import { audioService } from '../services/AudioService'
import type { TableNumber, VoiceInputResult } from '../types/game'
import type { AmeliaAnimation } from './scene/AmeliaCharacter'

const LINE_TIME_LIMIT = 20 // seconds per chant line
const AUTO_ADVANCE_DELAY_MS = 900
const RETRY_DELAY_MS = 900

interface TimedResult {
  table: TableNumber
  passed: boolean
  elapsedSec: number
  confidence: number
  spokenText: string
  totalLines: number
  correctLines: number
  misses: number
  averageConfidence: number
}

export default function TimedGameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const startTable = (location.state?.startTable as TableNumber) ?? 9

  const lines = getChantsByTable(startTable)
  const totalLines = lines.length

  const [phase, setPhase] = useState<'ready' | 'counting' | 'done'>('ready')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(LINE_TIME_LIMIT)
  const [animation, setAnimation] = useState<AmeliaAnimation>('idle')
  const [timedResult, setTimedResult] = useState<TimedResult | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctLines, setCorrectLines] = useState(0)
  const [misses, setMisses] = useState(0)

  const startedAtRef = useRef(0)
  const lineStartedAtRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const doneRef = useRef(false)
  const processingRef = useRef(false)
  const missesRef = useRef(0)
  const correctResultsRef = useRef<VoiceInputResult[]>([])
  const spokenHistoryRef = useRef<string[]>([])

  const currentLine = lines[currentLineIndex]

  const clearTransitionTimer = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = undefined
    }
  }

  const resetLineClock = useCallback(() => {
    lineStartedAtRef.current = Date.now()
    setTimeLeft(LINE_TIME_LIMIT)
  }, [])

  const finishRun = useCallback(
    (nextResults: VoiceInputResult[]) => {
      if (doneRef.current) return

      doneRef.current = true
      processingRef.current = true
      voiceStopRef.current()
      clearTransitionTimer()
      if (intervalRef.current) clearInterval(intervalRef.current)

      const elapsedSec = Math.max(0, (Date.now() - startedAtRef.current) / 1000)
      const correctLineCount = nextResults.length
      const averageConfidence =
        correctLineCount > 0
          ? Math.round(
              nextResults.reduce((sum, result) => sum + result.confidence, 0) /
                correctLineCount
            )
          : 0
      const passed = correctLineCount === totalLines
      const spokenText = spokenHistoryRef.current.filter(Boolean).join(' ')

      const resultState: TimedResult = {
        table: startTable,
        passed,
        elapsedSec,
        confidence: averageConfidence,
        spokenText,
        totalLines,
        correctLines: correctLineCount,
        misses: missesRef.current,
        averageConfidence,
      }

      setTimedResult(resultState)
      setPhase('done')
      setAnimation(passed ? 'celebrate' : 'error')
      audioService.playEffect(passed ? 'level-complete' : 'incorrect')

      transitionTimerRef.current = setTimeout(() => {
        navigate('/results', {
          state: {
            timed: true,
            table: resultState.table,
            passed: resultState.passed,
            elapsedSec: resultState.elapsedSec,
            confidence: resultState.confidence,
            spokenText: resultState.spokenText,
            totalLines: resultState.totalLines,
            correctLines: resultState.correctLines,
            misses: resultState.misses,
            averageConfidence: resultState.averageConfidence,
          },
        })
      }, 1800)
    },
    [navigate, startTable, totalLines]
  )

  const scheduleRetry = useCallback(
    (message: string) => {
      if (doneRef.current) return

      processingRef.current = true
      voiceStopRef.current()
      clearTransitionTimer()

      missesRef.current += 1
      setMisses(missesRef.current)
      setFeedback(message)
      setAnimation('error')
      audioService.playEffect('incorrect')

      transitionTimerRef.current = setTimeout(() => {
        resetLineClock()
        setFeedback(null)
        setAnimation('idle')
        processingRef.current = false

        if (!showManualRef.current) {
          voiceStartRef.current()
        }
      }, RETRY_DELAY_MS)
    },
    [resetLineClock]
  )

  const handleLineCorrect = useCallback(
    (result: VoiceInputResult) => {
      if (processingRef.current || doneRef.current) return

      processingRef.current = true
      voiceStopRef.current()
      clearTransitionTimer()

      const nextResults = [...correctResultsRef.current, result]
      correctResultsRef.current = nextResults
      spokenHistoryRef.current = [...spokenHistoryRef.current, result.spokenText]
      setCorrectLines(nextResults.length)
      setFeedback('正確！')
      setAnimation('celebrate')
      audioService.playEffect('correct')

      if (currentLineIndex >= totalLines - 1) {
        transitionTimerRef.current = setTimeout(() => {
          finishRun(nextResults)
        }, AUTO_ADVANCE_DELAY_MS)
        return
      }

      transitionTimerRef.current = setTimeout(() => {
        setCurrentLineIndex((index) => index + 1)
        resetLineClock()
        setManualText('')
        setFeedback(null)
        setAnimation('idle')
        processingRef.current = false

        if (!showManualRef.current) {
          voiceStartRef.current()
        }
      }, AUTO_ADVANCE_DELAY_MS)
    },
    [currentLineIndex, finishRun, resetLineClock, totalLines]
  )

  const handleResult = useCallback(
    (result: VoiceInputResult) => {
      if (processingRef.current || doneRef.current || phaseRef.current !== 'counting') return
      if (result.isCorrect) {
        handleLineCorrect(result)
      } else {
        scheduleRetry(result.feedback || '再試一次')
      }
    },
    [handleLineCorrect, scheduleRetry]
  )

  const voice = useVoiceAnswer({
    expectedChant: currentLine?.cantonese ?? '',
    onResult: handleResult,
    strict: true,
  })

  // Stable refs to voice controls + derived flags for use inside timers.
  const voiceStartRef = useRef(voice.start)
  const voiceStopRef = useRef(voice.stop)
  voiceStartRef.current = voice.start
  voiceStopRef.current = voice.stop
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const showManual = manualMode || !voice.isSupported
  const showManualRef = useRef(showManual)
  showManualRef.current = showManual

  const handleLineTimeout = useCallback(() => {
    if (phaseRef.current !== 'counting' || processingRef.current || doneRef.current) return
    if (voice.status === 'analyzing') return // a result is in flight
    scheduleRetry('時間到，再試一次')
  }, [scheduleRetry, voice.status])

  useEffect(() => {
    if (phase !== 'counting') return

    intervalRef.current = setInterval(() => {
      if (processingRef.current) return

      const elapsed = (Date.now() - lineStartedAtRef.current) / 1000
      const remaining = Math.max(0, LINE_TIME_LIMIT - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        handleLineTimeout()
      }
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [handleLineTimeout, phase])

  useEffect(() => {
    return () => {
      voiceStopRef.current()
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearTransitionTimer()
    }
  }, [])

  const handleStart = () => {
    audioService.unlock()
    doneRef.current = false
    processingRef.current = false
    missesRef.current = 0
    correctResultsRef.current = []
    spokenHistoryRef.current = []
    clearTransitionTimer()

    setCurrentLineIndex(0)
    setCorrectLines(0)
    setMisses(0)
    setFeedback(null)
    setManualText('')
    setTimedResult(null)
    setAnimation('idle')
    startedAtRef.current = Date.now()
    resetLineClock()
    setPhase('counting')
    phaseRef.current = 'counting'

    if (!showManual) {
      voice.start()
    }
  }

  const handleManualSubmit = () => {
    if (!manualText.trim() || !currentLine || processingRef.current) return

    audioService.unlock()
    const result = validateCantonese(manualText, currentLine.cantonese, {
      strict: true,
    })
    setManualText('')

    if (result.isCorrect) {
      handleLineCorrect(result)
      return
    }

    scheduleRetry(result.feedback)
  }

  const handleUseManual = () => {
    voice.stop()
    setManualMode(true)
  }

  const handleUseVoice = () => {
    setManualMode(false)
    if (phase === 'counting' && !processingRef.current) {
      voice.start()
    }
  }

  const handleExit = () => {
    voice.stop()
    audioService.stopSpeaking()
    navigate('/')
  }

  const barFraction = timeLeft / LINE_TIME_LIMIT
  const barColor =
    barFraction > 0.5
      ? 'bg-green-500'
      : barFraction > 0.25
        ? 'bg-yellow-400'
        : 'bg-red-500'

  const active = voice.status === 'listening' || voice.status === 'speaking'

  if (!currentLine) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white cantonese-text">加載中...</p>
      </div>
    )
  }

  if (phase === 'done' && timedResult) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-7xl mb-4 animate-bounce">
          {timedResult.passed ? '🎉' : '⏰'}
        </div>
        <h1 className="text-white text-4xl font-bold cantonese-text mb-2">
          {timedResult.passed ? '完成！' : '再接再厲'}
        </h1>
        <p className="text-white/80 cantonese-text text-xl">
          {timedResult.correctLines}/{timedResult.totalLines} 句
        </p>
      </div>
    )
  }

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
          <GameCanvas animation={animation} audioLevel={active ? voice.level : 0} />
        </Suspense>
      </div>

      {phase === 'counting' && (
        <div className="absolute top-0 inset-x-0 h-2 bg-gray-800/50 z-10">
          <div
            className={`h-full ${barColor} transition-all duration-100 ease-linear`}
            style={{ width: `${barFraction * 100}%` }}
          />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-between py-8 px-4 z-10 pointer-events-none">
        <div className="flex flex-col items-center gap-1 pointer-events-auto">
          <h1 className="text-white text-3xl font-bold cantonese-text drop-shadow-lg">
            背 {startTable} 因歌
          </h1>
          <p className="text-white/70 cantonese-text text-sm">
            第 {currentLineIndex + 1}/{totalLines} 句 • 每句 {LINE_TIME_LIMIT} 秒
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
          {phase === 'counting' && (
            <p className="text-white/70 cantonese-text text-xs">
              答對 {correctLines}/{totalLines} • 重試 {misses}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 pointer-events-auto w-full max-w-lg">
          <div className="bg-black/40 backdrop-blur rounded-xl px-5 py-4 max-h-[36vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {lines.map((line, index) => (
                <div
                  key={line.multiplier}
                  className={`rounded-md px-3 py-2 text-sm cantonese-text whitespace-nowrap transition-colors ${
                    index < currentLineIndex
                      ? 'bg-green-500/20 text-green-100'
                      : index === currentLineIndex
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/45'
                  }`}
                >
                  {line.cantonese}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-white/70 text-sm cantonese-text mb-1">目前口訣</p>
            <p className="text-white text-4xl font-bold cantonese-text tracking-wider drop-shadow-lg">
              {currentLine.cantonese}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-sm pointer-events-auto">
          {feedback && (
            <div
              className={`px-5 py-2 rounded-full cantonese-text font-bold text-base ${
                feedback.includes('正確')
                  ? 'bg-green-500/90 text-white'
                  : 'bg-orange-500/90 text-white'
              }`}
            >
              {feedback}
            </div>
          )}

          {voice.status === 'analyzing' && (
            <div className="flex items-center gap-2 text-white/80 text-sm cantonese-text">
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              分析緊…
            </div>
          )}

          {active && (
            <div className="flex items-end justify-center gap-1 h-[40px] w-full max-w-xs rounded-lg bg-black/30 px-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const h = Math.min(1, voice.level * 6 + 0.12)
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

          {voice.error && (
            <p className="text-red-300 text-sm cantonese-text">
              {voice.error === 'not-allowed'
                ? '需要麥克風權限'
                : voice.error === 'unsupported'
                  ? '此瀏覽器不支援錄音'
                  : '語音分析失敗，請再試'}
            </p>
          )}

          {!showManual ? (
            <div className="flex flex-col items-center gap-2">
              {phase === 'ready' ? (
                <button
                  onClick={handleStart}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
                  aria-label="開始錄音"
                >
                  🎤
                </button>
              ) : (
                <button
                  onClick={active ? voice.stop : voice.start}
                  disabled={voice.status === 'analyzing'}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                    active ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
                  }`}
                  aria-label={active ? '停止錄音' : '開始錄音'}
                >
                  {active ? '⏹️' : '🎤'}
                </button>
              )}
              <p className="text-white/80 text-sm cantonese-text">
                {phase === 'ready' ? '點擊開始挑戰' : '講出口訣，答啱會自動下一句'}
              </p>
              <button
                onClick={handleUseManual}
                className="text-white/50 text-xs underline cantonese-text"
              >
                改用文字輸入
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="輸入目前口訣..."
                className="w-full px-3 py-2 rounded-lg cantonese-text text-gray-800 text-sm resize-none"
                rows={2}
                disabled={phase === 'done'}
              />
              <div className="flex gap-2">
                {phase === 'ready' ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg cantonese-text text-base transition-all active:scale-95"
                  >
                    開始
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={processingRef.current}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cantonese-text text-base transition-all active:scale-95"
                  >
                    提交
                  </button>
                )}
                {voice.isSupported && (
                  <button
                    onClick={handleUseVoice}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg cantonese-text text-base transition-all active:scale-95"
                  >
                    語音
                  </button>
                )}
              </div>
              {!voice.isSupported && (
                <p className="text-white/50 text-xs cantonese-text text-center">
                  此瀏覽器不支援錄音
                </p>
              )}
            </div>
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
