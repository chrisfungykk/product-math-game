interface ModeCardProps {
  emoji: string
  title: string
  desc: string
  selected: boolean
  accent: 'practice' | 'timed' | 'blind'
  onClick: () => void
}

const ACCENT_SELECTED: Record<ModeCardProps['accent'], string> = {
  practice: 'border-blue-500 bg-blue-50 ring-2 ring-blue-300',
  timed: 'border-red-500 bg-red-50 ring-2 ring-red-300',
  blind: 'border-purple-500 bg-purple-50 ring-2 ring-purple-300',
}

/** Selectable game-mode card for the home screen. */
export default function ModeCard({
  emoji,
  title,
  desc,
  selected,
  accent,
  onClick,
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-3 w-full text-left rounded-xl border-2 p-3 transition-all active:scale-[0.98] ${
        selected
          ? ACCENT_SELECTED[accent]
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="text-3xl shrink-0">{emoji}</span>
      <span className="flex flex-col">
        <span className="font-bold text-gray-800 cantonese-text">{title}</span>
        <span className="text-xs text-gray-500 cantonese-text leading-snug">{desc}</span>
      </span>
    </button>
  )
}
