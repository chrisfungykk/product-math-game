import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGameStore } from '../contexts/GameContext'
import { getBest, saveBest, type BestScore } from '../utils/bestScores'
import type { BlindLineResult } from '../utils/voiceValidation'
import type { TableNumber } from '../types/game'

interface TimedResultsState {
  timed?: boolean
  table?: number
  passed?: boolean
  elapsedSec?: number
  confidence?: number
  spokenText?: string
  totalLines?: number
  correctLines?: number
  misses?: number
  averageConfidence?: number
}

interface BlindResultsState {
  blind?: boolean
  table?: TableNumber
  perLine?: BlindLineResult[]
  correct?: number
  total?: number
  elapsedSec?: number
  transcript?: string
}

function BlindResults({ data }: { data: BlindResultsState }) {
  const navigate = useNavigate()
  const table = (data.table ?? 9) as TableNumber
  const perLine = data.perLine ?? []
  const correct = data.correct ?? perLine.filter((p) => p.isCorrect).length
  const total = data.total ?? (perLine.length || 1)
  const elapsedSec = data.elapsedSec ?? 0
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  // Persist personal best once.
  const [best, setBest] = useState<BestScore | null>(null)
  const [isRecord, setIsRecord] = useState(false)
  const savedRef = useRef(false)
  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    const prev = getBest('blind', table)
    const { best: stored, improved } = saveBest('blind', table, {
      accuracy,
      elapsedSec,
      correct,
      total,
      at: Date.now(),
    })
    setBest(stored)
    setIsRecord(improved && prev !== null)
  }, [accuracy, correct, elapsedSec, table, total])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-8 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-1 cantonese-text">盲背結果</h1>
        <p className="text-gray-500 cantonese-text mb-3">{table} 因歌</p>

        {isRecord && (
          <div className="inline-block bg-yellow-100 text-yellow-700 font-bold px-4 py-1 rounded-full mb-3 cantonese-text animate-bounce">
            🏆 新紀錄！
          </div>
        )}

        <div className="text-5xl mb-3">
          {'⭐'.repeat(stars)}
          {'☆'.repeat(3 - stars)}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg px-3 py-3">
            <div className="text-gray-500 text-xs cantonese-text">準確度</div>
            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-3">
            <div className="text-gray-500 text-xs cantonese-text">用時</div>
            <div className="text-2xl font-bold text-purple-600">
              {elapsedSec.toFixed(1)}秒
            </div>
          </div>
        </div>

        {/* Per-line breakdown */}
        <div className="text-left bg-gray-50 rounded-lg p-3 mb-4 max-h-56 overflow-y-auto">
          <div className="text-gray-500 text-xs cantonese-text mb-2">
            答對 {correct}/{total} 句
          </div>
          <ul className="space-y-1">
            {perLine.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm cantonese-text"
              >
                <span className={p.isCorrect ? 'text-gray-700' : 'text-gray-400'}>
                  {p.expected}
                </span>
                <span>{p.isCorrect ? '✅' : '❌'}</span>
              </li>
            ))}
          </ul>
        </div>

        {best && (
          <p className="text-gray-500 text-xs cantonese-text mb-4">
            最佳：{best.accuracy}% · {best.elapsedSec.toFixed(1)}秒
          </p>
        )}

        <button
          onClick={() => navigate('/blind', { state: { startTable: table } })}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95 shadow-lg mb-3"
        >
          再背一次
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg cantonese-text text-base transition-all active:scale-95"
        >
          返主頁
        </button>
      </div>
    </div>
  )
}

export default function ResultsScreen() {
  const navigate = useNavigate()
  const location = useLocation()

  const blindData = location.state as BlindResultsState
  const timed = (location.state as TimedResultsState)?.timed
  const timedData = location.state as TimedResultsState

  const { sessionScore, sessionStartTime, resetGame } = useGameStore()

  // Blind mode has its own results layout (rendered after all hooks).
  if (blindData?.blind) {
    return <BlindResults data={blindData} />
  }

  const accuracy =
    sessionScore.total > 0
      ? Math.round((sessionScore.correct / sessionScore.total) * 100)
      : 0

  const elapsedMin =
    sessionStartTime > 0
      ? Math.round((Date.now() - sessionStartTime) / 60000)
      : 0

  const handleReplay = () => {
    resetGame()
    navigate('/')
  }

  // Star rating
  const practiceStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  const timedTotalLines = timedData?.totalLines ?? 1
  const timedCorrectLines =
    timedData?.correctLines ?? (timedData?.passed ? timedTotalLines : 0)
  const timedMisses = timedData?.misses ?? 0
  const timedAverageConfidence = timedData?.averageConfidence ?? timedData?.confidence ?? 0

  // Timed stars: complete all lines, with fewer retries earning more stars.
  const timedStars = timedData?.passed
    ? timedMisses === 0
      ? 3
      : timedMisses <= 2
        ? 2
        : 1
    : 0

  const stars = timed ? timedStars : practiceStars

  // ── Timed Results ──
  if (timed && timedData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4 safe-area-top safe-area-bottom">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 cantonese-text">
            限時挑戰
          </h1>

          {/* Pass / Fail badge */}
          <div
            className={`inline-block text-3xl font-bold px-6 py-2 rounded-full mb-4 ${
              timedData.passed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {timedData.passed ? '✓ 過關' : '✗ 再接再厲'}
          </div>

          {/* Stars */}
          <div className="text-5xl mb-4">
            {'⭐'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-600 cantonese-text">乘數表</span>
              <span className="text-2xl font-bold text-blue-600">
                {timedData.table}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-600 cantonese-text">用時</span>
              <span className="text-2xl font-bold text-purple-600">
                {timedData.elapsedSec?.toFixed(1)} 秒
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-600 cantonese-text">答對句數</span>
              <span className="text-2xl font-bold text-green-600">
                {timedCorrectLines}/{timedTotalLines}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-600 cantonese-text">重試/逾時</span>
              <span className="text-2xl font-bold text-orange-500">
                {timedMisses}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-gray-600 cantonese-text">平均準確度</span>
              <span className="text-2xl font-bold text-green-600">
                {timedAverageConfidence}%
              </span>
            </div>
          </div>

          {/* Encouragement */}
          <p className="text-gray-600 cantonese-text mb-6">
            {stars === 3
              ? '又準又穩，完成得好靚！'
              : stars === 2
                ? '好穩陣！再練少少就滿分！'
                : stars === 1
                  ? '完成咗！下次試吓少啲重試！'
                  : '繼續練習，你會越來越快！'}
          </p>

          <button
            onClick={handleReplay}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95 shadow-lg mb-3"
          >
            再挑戰
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg cantonese-text text-base transition-all active:scale-95"
          >
            返主頁
          </button>
        </div>
      </div>
    )
  }

  // ── Practice Results (existing) ──
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 cantonese-text">結果</h1>

        {/* Stars */}
        <div className="text-5xl mb-4">
          {'⭐'.repeat(stars)}
          {'☆'.repeat(3 - stars)}
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-gray-600 cantonese-text">準確度</span>
            <span className="text-2xl font-bold text-blue-600">{accuracy}%</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-gray-600 cantonese-text">答對題數</span>
            <span className="text-2xl font-bold text-green-600">
              {sessionScore.correct}/{sessionScore.total}
            </span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-gray-600 cantonese-text">用時</span>
            <span className="text-2xl font-bold text-purple-600">
              {elapsedMin} 分鐘
            </span>
          </div>
        </div>

        {/* Encouragement message */}
        <p className="text-gray-600 cantonese-text mb-6">
          {accuracy >= 90
            ? '非常好！你係乘法高手！'
            : accuracy >= 70
            ? '好叻！繼續努力！'
            : '繼續練習，你會越來越好！'}
        </p>

        <button
          onClick={handleReplay}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95 shadow-lg"
        >
          再玩一次
        </button>
      </div>
    </div>
  )
}
