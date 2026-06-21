import type { TableNumber } from '../types/game'

interface GameOverlayProps {
  currentTable: TableNumber
  currentLineIndex: number
  tableLength: number
  score: { correct: number; total: number; streak: number }
  onReplay: () => void
  onSkip: () => void
  onExit: () => void
}

export default function GameOverlay({
  currentTable,
  currentLineIndex,
  tableLength,
  score,
  onReplay,
  onSkip,
  onExit,
}: GameOverlayProps) {
  // Tables completed: 9 is first, 1 is last. Progress = (9 - currentTable) + line progress
  const tablesCompleted = 9 - currentTable
  const overallProgress = ((tablesCompleted + currentLineIndex / tableLength) / 9) * 100

  return (
    <>
      {/* Top bar: progress + exit */}
      <div className="absolute top-0 left-0 right-0 p-4 safe-area-top flex items-center justify-between z-10">
        <button
          onClick={onExit}
          className="bg-white/20 backdrop-blur-md text-white w-11 h-11 rounded-full flex items-center justify-center text-xl active:scale-95"
          aria-label="離開"
        >
          ✕
        </button>

        <div className="flex-1 mx-4">
          <div className="text-white/80 text-xs cantonese-text mb-1 text-center">
            第 {currentTable} 個乘數表 · 第 {currentLineIndex + 1}/{tableLength} 題
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-yellow-400 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm cantonese-text">
          {score.correct}/{score.total}
        </div>
      </div>

      {/* Streak indicator */}
      {score.streak >= 3 && (
        <div className="absolute top-20 right-4 z-10 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm cantonese-text animate-bounce">
          🔥 連續 {score.streak} 次！
        </div>
      )}

      {/* Bottom action buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 safe-area-bottom flex items-center justify-center gap-4 z-10">
        <button
          onClick={onReplay}
          className="bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-full cantonese-text text-sm active:scale-95 flex items-center gap-2"
        >
          🔊 重播
        </button>
        <button
          onClick={onSkip}
          className="bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-full cantonese-text text-sm active:scale-95 flex items-center gap-2"
        >
          ⏭️ 略過
        </button>
      </div>
    </>
  )
}
