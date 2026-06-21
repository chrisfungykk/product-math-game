import type { ChantLine } from '../types/game'

interface ChantDisplayProps {
  chant: ChantLine
  showResult: boolean
}

export default function ChantDisplay({ chant, showResult }: ChantDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {/* Multiplication equation */}
      <div className="text-white/70 text-lg cantonese-text">
        {chant.table} × {chant.multiplier} = {showResult ? chant.result : '?'}
      </div>

      {/* Main chant text */}
      <div className="text-white text-5xl font-bold cantonese-text tracking-wider drop-shadow-lg">
        {chant.cantonese}
      </div>

      {/* Pinyin pronunciation guide */}
      <div className="text-white/60 text-sm italic">{chant.pinyin}</div>
    </div>
  )
}
