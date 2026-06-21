import { create } from 'zustand'
import type { GameState, TableNumber, VoiceInputResult } from '../types/game'

interface GameStore extends GameState {
  startGame: (table: TableNumber) => void
  nextLine: () => void
  prevTable: () => void
  checkVoiceInput: (result: VoiceInputResult) => void
  markCorrect: () => void
  markIncorrect: () => void
  skipLine: () => void
  completeTable: () => void
  endSession: () => void
  resetGame: () => void
  setListening: (listening: boolean) => void
}

const initialState: GameState = {
  currentTable: 9,
  currentLineIndex: 0,
  gamePhase: 'idle',
  isListening: false,
  lastRecognitionResult: null,
  sessionScore: {
    correct: 0,
    total: 0,
    byTable: {},
    streak: 0,
  },
  sessionStartTime: 0,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (table: TableNumber) => {
    set({
      currentTable: table,
      currentLineIndex: 0,
      gamePhase: 'playing',
      sessionStartTime: Date.now(),
      sessionScore: {
        correct: 0,
        total: 0,
        byTable: { [table]: { correct: 0, total: 0 } },
        streak: 0,
      },
    })
  },

  nextLine: () => {
    const state = get()
    const maxLines = state.currentTable
    if (state.currentLineIndex < maxLines - 1) {
      set({ currentLineIndex: state.currentLineIndex + 1 })
    } else {
      get().completeTable()
    }
  },

  prevTable: () => {
    const state = get()
    if (state.currentTable < 9) {
      const prevTable = (state.currentTable + 1) as TableNumber
      set({
        currentTable: prevTable,
        currentLineIndex: 0,
      })
    }
  },

  checkVoiceInput: (result: VoiceInputResult) => {
    set({ lastRecognitionResult: result })
    if (result.isCorrect) {
      get().markCorrect()
    } else {
      get().markIncorrect()
    }
  },

  markCorrect: () => {
    const state = get()
    const table = state.currentTable
    const byTable = { ...state.sessionScore.byTable }
    if (!byTable[table]) {
      byTable[table] = { correct: 0, total: 0 }
    }

    set({
      sessionScore: {
        correct: state.sessionScore.correct + 1,
        total: state.sessionScore.total + 1,
        byTable: {
          ...byTable,
          [table]: {
            correct: byTable[table].correct + 1,
            total: byTable[table].total + 1,
          },
        },
        streak: state.sessionScore.streak + 1,
      },
    })
  },

  markIncorrect: () => {
    const state = get()
    const table = state.currentTable
    const byTable = { ...state.sessionScore.byTable }
    if (!byTable[table]) {
      byTable[table] = { correct: 0, total: 0 }
    }

    set({
      sessionScore: {
        correct: state.sessionScore.correct,
        total: state.sessionScore.total + 1,
        byTable: {
          ...byTable,
          [table]: {
            correct: byTable[table].correct,
            total: byTable[table].total + 1,
          },
        },
        streak: 0,
      },
    })
  },

  skipLine: () => {
    get().nextLine()
  },

  completeTable: () => {
    const state = get()
    if (state.currentTable > 1) {
      const nextTable = (state.currentTable - 1) as TableNumber
      set({
        currentTable: nextTable,
        currentLineIndex: 0,
      })
    } else {
      set({ gamePhase: 'complete' })
    }
  },

  endSession: () => {
    set({ gamePhase: 'idle' })
  },

  resetGame: () => {
    set(initialState)
  },

  setListening: (listening: boolean) => {
    set({ isListening: listening })
  },
}))
