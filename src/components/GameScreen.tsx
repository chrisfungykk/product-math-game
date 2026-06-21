import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GameCanvas from './GameCanvas'
import ChantDisplay from './ChantDisplay'
import VoiceInput from './VoiceInput'
import GameOverlay from './GameOverlay'
import type { AmeliaAnimation } from './scene/AmeliaCharacter'
import { useGameStore } from '../contexts/GameContext'
import { getChant, tableLengths } from '../utils/chantData'
import { audioService } from '../services/AudioService'
import { useSwipe } from '../hooks/useSwipe'
import type { TableNumber, VoiceInputResult } from '../types/game'

export default function GameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const startTable = (location.state?.startTable as TableNumber) ?? 9

  const {
    currentTable,
    currentLineIndex,
    gamePhase,
    sessionScore,
    startGame,
    nextLine,
    checkVoiceInput,
    setListening,
  } = useGameStore()

  const [animation, setAnimation] = useState<AmeliaAnimation>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)
  const initRef = useRef(false)

  const chant = getChant(currentTable, currentLineIndex)
  const tableLength = tableLengths[currentTable]

  // Initialize game on mount
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      audioService.unlock()
      startGame(startTable)
    }
  }, [startGame, startTable])

  // Play Amelia's chant when line changes
  const playChant = useCallback(async () => {
    if (!chant) return
    setInputDisabled(true)
    setAnimation('chant')
    setShowResult(true)
    await audioService.speakChant(chant.cantonese, (level) => setAudioLevel(level))
    setAnimation('idle')
    setAudioLevel(0)
    setInputDisabled(false)
  }, [chant])

  // Auto-play chant on each new line
  useEffect(() => {
    if (gamePhase === 'playing' && chant) {
      setShowResult(false)
      setFeedback(null)
      const timer = setTimeout(() => playChant(), 400)
      return () => clearTimeout(timer)
    }
  }, [currentTable, currentLineIndex, gamePhase, chant, playChant])

  // Navigate to results when complete
  useEffect(() => {
    if (gamePhase === 'complete') {
      audioService.playEffect('level-complete')
      const timer = setTimeout(() => navigate('/results'), 2000)
      return () => clearTimeout(timer)
    }
  }, [gamePhase, navigate])

  const handleVoiceResult = useCallback(
    (result: VoiceInputResult) => {
      setListening(false)
      checkVoiceInput(result)
      setFeedback(result.feedback)
      setShowResult(true)

      if (result.isCorrect) {
        audioService.playEffect('correct')
        setAnimation('celebrate')
        setInputDisabled(true)
        setTimeout(() => {
          setAnimation('idle')
          setInputDisabled(false)
          nextLine()
        }, 2000)
      } else {
        audioService.playEffect('incorrect')
        setAnimation('error')
        setTimeout(() => setAnimation('idle'), 1000)
      }
    },
    [checkVoiceInput, nextLine, setListening]
  )

  const handleReplay = () => {
    audioService.playEffect('button-click')
    playChant()
  }

  const handleSkip = () => {
    audioService.playEffect('button-click')
    setAnimation('idle')
    nextLine()
  }

  const handleExit = () => {
    audioService.stopSpeaking()
    navigate('/')
  }

  // Touch swipe: left = skip, right = replay
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => !inputDisabled && handleSkip(),
    onSwipeRight: () => !inputDisabled && handleReplay(),
  })

  if (!chant) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white cantonese-text">加載中...</p>
      </div>
    )
  }

  // Completion screen flash
  if (gamePhase === 'complete') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-white text-4xl font-bold cantonese-text mb-2">
          全部完成！
        </h1>
        <p className="text-white/80 cantonese-text">你已經學完所有乘數表</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" {...swipeHandlers}>
      {/* 3D Canvas background */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-white cantonese-text">加載 3D 場景...</p>
            </div>
          }
        >
          <GameCanvas animation={animation} audioLevel={audioLevel} />
        </Suspense>
      </div>

      {/* Game overlay UI */}
      <GameOverlay
        currentTable={currentTable}
        currentLineIndex={currentLineIndex}
        tableLength={tableLength}
        score={sessionScore}
        onReplay={handleReplay}
        onSkip={handleSkip}
        onExit={handleExit}
      />

      {/* Chant display + voice input (center-bottom) */}
      <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-6 px-4 z-10">
        <ChantDisplay chant={chant} showResult={showResult} />

        {/* Feedback message */}
        {feedback && (
          <div
            className={`px-6 py-2 rounded-full cantonese-text font-bold text-lg ${
              feedback.includes('正確')
                ? 'bg-green-500/90 text-white'
                : 'bg-orange-500/90 text-white'
            }`}
          >
            {feedback}
          </div>
        )}

        <VoiceInput
          expectedChant={chant.cantonese}
          onResult={handleVoiceResult}
          disabled={inputDisabled}
        />
      </div>
    </div>
  )
}
