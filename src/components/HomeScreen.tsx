import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TableNumber } from '../types/game'

export default function HomeScreen() {
  const [selectedTable, setSelectedTable] = useState<TableNumber>(9)
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/game', { state: { startTable: selectedTable } })
  }

  const tables: TableNumber[] = [9, 8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4 safe-area-top safe-area-bottom">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-2 cantonese-text">背口決</h1>
        <p className="text-2xl text-white/90 cantonese-text">九因歌遊戲</p>
        <p className="text-lg text-white/70 mt-2 cantonese-text">學習廣東乘法表</p>
      </div>

      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm">
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
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg cantonese-text text-lg transition-all active:scale-95 shadow-lg"
        >
          開始遊戲
        </button>

        <div className="mt-6 text-sm text-gray-600 text-center cantonese-text">
          <p>跟著 Amelia 學習乘法表</p>
          <p>用聲音回答問題</p>
        </div>
      </div>
    </div>
  )
}
