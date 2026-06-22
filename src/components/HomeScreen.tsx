import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameMode, TableNumber } from '../types/game'
import { audioService } from '../services/AudioService'
import ScreenShell from './ui/ScreenShell'
import ModeCard from './ui/ModeCard'
import TablePicker from './ui/TablePicker'
import Button from './ui/Button'
import Footer from './Footer'

interface ModeDef {
  id: GameMode
  emoji: string
  title: string
  desc: string
  route: string
  accent: 'practice' | 'timed' | 'blind'
  cta: string
}

const MODES: ModeDef[] = [
  {
    id: 'practice',
    emoji: '📖',
    title: '練習',
    desc: '跟住 Amelia 慢慢學，答啱先過下一句',
    route: '/game',
    accent: 'practice',
    cta: '開始練習',
  },
  {
    id: 'timed',
    emoji: '⏱️',
    title: '限時挑戰',
    desc: '每句 20 秒，睇吓你有幾快',
    route: '/timed',
    accent: 'timed',
    cta: '開始挑戰',
  },
  {
    id: 'blind',
    emoji: '🧠',
    title: '盲背',
    desc: '冚住口訣一口氣背曬，最後睇準確度同時間',
    route: '/blind',
    accent: 'blind',
    cta: '開始盲背',
  },
]

export default function HomeScreen() {
  const [selectedTable, setSelectedTable] = useState<TableNumber>(9)
  const [mode, setMode] = useState<GameMode>('practice')
  const navigate = useNavigate()

  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0]

  const handleStart = () => {
    // Unlock audio on user gesture (required for iOS Safari).
    audioService.unlock()
    navigate(activeMode.route, { state: { startTable: selectedTable } })
  }

  return (
    <>
      <ScreenShell gradient="home">
        <div className="text-center mb-8 animate-fadeUp">
          <h1 className="text-5xl font-bold text-white mb-2 cantonese-text drop-shadow">
            背口訣
          </h1>
          <p className="text-xl text-white/90 cantonese-text">九因歌遊戲</p>
          <p className="text-sm text-white/70 mt-1 cantonese-text">用聲音學廣東乘數表</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-pop">
          {/* Mode selection */}
          <p className="text-gray-700 font-semibold mb-3 cantonese-text">揀選模式</p>
          <div className="flex flex-col gap-2 mb-6">
            {MODES.map((m) => (
              <ModeCard
                key={m.id}
                emoji={m.emoji}
                title={m.title}
                desc={m.desc}
                selected={mode === m.id}
                accent={m.accent}
                onClick={() => setMode(m.id)}
              />
            ))}
          </div>

          {/* Table selection */}
          <p className="text-gray-700 font-semibold mb-3 cantonese-text">揀選乘數表</p>
          <div className="mb-6">
            <TablePicker
              value={selectedTable}
              onChange={setSelectedTable}
              accent={activeMode.accent}
            />
          </div>

          <Button variant={activeMode.accent} onClick={handleStart}>
            {activeMode.cta}（{selectedTable} 因歌）
          </Button>
        </div>
      </ScreenShell>

      <Footer />
    </>
  )
}
