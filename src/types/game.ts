export type TableNumber = 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1;
export type GamePhase = 'idle' | 'playing' | 'reviewing' | 'complete';
export type GameMode = 'practice' | 'timed' | 'blind';

export interface VoiceInputResult {
  spokenText: string;
  matchedChant: string | null;
  confidence: number; // 0-100
  isCorrect: boolean;
  feedback: string;
}

export interface GameState {
  currentTable: TableNumber;
  currentLineIndex: number;
  gamePhase: GamePhase;
  isListening: boolean;
  lastRecognitionResult: VoiceInputResult | null;
  sessionScore: {
    correct: number;
    total: number;
    byTable: Record<number, { correct: number; total: number }>;
    streak: number;
  };
  sessionStartTime: number;
}

export interface ChantLine {
  table: TableNumber;
  multiplier: number;
  cantonese: string;
  pinyin: string;
  toneMarks: string;
  result: number;
}
