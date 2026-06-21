import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TableNumber } from '../types/game'
import { audioService } from '../services/AudioService'
import Footer from './Footer'

type GameMode = 'practice' | 'timed'

export default function HomeScreen() {
  const [selectedTable, setSelectedTable] = useState<TableNumber>(9)
  const [mode, setMode] = useState<GameMode>('practice')
  const navigate = useNavigate()

  const handleStart = () => {
    // Unlock audio on user gesture (required for iOS Safari)
    audioService.unlock()
    const path = mode === 'timed' ? '/timed' : '/game'
    navigate(path, { state: { startTable: selectedTable } })
  }

  const tables: TableNumber[] = [9, 8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4 safe-area-top safe-area-bottom">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 cantonese-text">背口決</h1>
          <p className="text-2xl text-white/90 cantonese-text">九因歌遊戲</p>
          <p className="text-lg text-white/70 mt-2 cantonese-text">學習廣東乘法表</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm">
          {/* Mode toggle */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-200 p-1">
              <button
                onClick={() => setMode('practice')}
                className={`flex-1 py-2 rounded-md font-semibold cantonese-text text-sm transition-all ${
                  mode === 'practice'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600'
                }`}
              >
                練習
              </button>
              <button
                onClick={() => setMode('timed')}
                className={`flex-1 py-2 rounded-md font-semibold cantonese-text text-sm transition-all ${
                  mode === 'timed'
                    ? 'bg-white text-red-500 shadow'
                    : 'text-gray-600'
                }`}
              >
                限時
              </button>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-center text-gray-700 font-semibold mb-4 cantonese-text text-lg">
              揀選乘數表
            </p>
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table) => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`py-3 px-2 rounded-lg font-bold text-xl cantonese-text transition-all transform hover:scale-105 ${
                    selectedTable === table
                      ? mode === 'timed'
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className={`w-full text-white font-bold py-4 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95 shadow-lg ${
              mode === 'timed'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {mode === 'timed' ? '開始挑戰' : '開始遊戲'}
          </button>

          <div className="mt-6 text-sm text-gray-600 text-center cantonese-text">
            {mode === 'timed' ? (
              <>
                <p>每句 20 秒，答啱自動下一句</p>
                <p>時間到會留低俾你再試！</p>
              </>
            ) : (
              <>
                <p>跟著 Amelia 學習乘法表</p>
                <p>用聲音回答問題</p>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
