import type { GameMode, TableNumber } from '../types/game'

/** Persisted personal best for a mode+table, kept in localStorage. */
export interface BestScore {
  accuracy: number // 0-100
  elapsedSec: number
  correct: number
  total: number
  at: number // epoch ms
}

function key(mode: GameMode, table: TableNumber): string {
  return `mathgame:best:${mode}:${table}`
}

export function getBest(mode: GameMode, table: TableNumber): BestScore | null {
  try {
    const raw = localStorage.getItem(key(mode, table))
    return raw ? (JSON.parse(raw) as BestScore) : null
  } catch {
    return null
  }
}

/**
 * Store a run if it beats the existing best (higher accuracy, then faster).
 * Returns the current best and whether this run improved it.
 */
export function saveBest(
  mode: GameMode,
  table: TableNumber,
  score: BestScore
): { best: BestScore; improved: boolean } {
  const prev = getBest(mode, table)
  const improved =
    !prev ||
    score.accuracy > prev.accuracy ||
    (score.accuracy === prev.accuracy && score.elapsedSec < prev.elapsedSec)

  if (improved) {
    try {
      localStorage.setItem(key(mode, table), JSON.stringify(score))
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
    return { best: score, improved: true }
  }
  return { best: prev, improved: false }
}
