import type { TableNumber } from '../../types/game'

interface TablePickerProps {
  value: TableNumber
  onChange: (table: TableNumber) => void
  accent: 'practice' | 'timed' | 'blind'
}

const TABLES: TableNumber[] = [9, 8, 7, 6, 5, 4, 3, 2, 1]

const ACCENT: Record<TablePickerProps['accent'], string> = {
  practice: 'bg-blue-600',
  timed: 'bg-red-500',
  blind: 'bg-purple-600',
}

/** 3×3 grid for choosing which multiplication table to drill. */
export default function TablePicker({ value, onChange, accent }: TablePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TABLES.map((table) => {
        const selected = value === table
        return (
          <button
            key={table}
            onClick={() => onChange(table)}
            className={`py-3 px-2 rounded-xl font-bold text-xl cantonese-text transition-all transform hover:scale-105 ${
              selected
                ? `${ACCENT[accent]} text-white shadow-lg scale-105`
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {table}
          </button>
        )
      })}
    </div>
  )
}
