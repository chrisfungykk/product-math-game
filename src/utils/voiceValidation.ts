import type { VoiceInputResult } from '../types/game'

const CONFIDENCE_THRESHOLD = 75 // 75% minimum confidence to mark as correct
const DIGIT_MATCH_CONFIDENCE = 90 // confidence when digit skeletons match exactly

// Map Chinese number characters to Arabic digits
const DIGIT_MAP: Record<string, string> = {
  '零': '0', '一': '1', '二': '2', '三': '3', '四': '4',
  '五': '5', '六': '6', '七': '7', '八': '8', '九': '9',
  // Superscript digits from toneMarks
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
}

// Convert any text (Chinese number chars or Arabic digits) to a pure digit sequence.
// Structural chars (十, 如, 得, 歸, 中, etc.) are implicitly dropped — only DIGIT_MAP
// entries and ASCII digits pass through.
// "九三二十七" → "9327", "9327" → "9327", "九一如九" → "919"
function toDigitSkeleton(text: string): string {
  let result = ''
  for (const ch of text) {
    if (DIGIT_MAP[ch]) {
      result += DIGIT_MAP[ch]
    } else if (ch >= '0' && ch <= '9') {
      result += ch
    }
    // structural chars are silently dropped
    // non-number Chinese chars (non-digit, non-structural) are also dropped
  }
  return result
}

// Levenshtein distance algorithm for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Normalize Cantonese text
function normalizeCantonese(text: string): string {
  // Remove punctuation and spaces
  let normalized = text.replace(/[，。！？；：、\s]/g, '')

  // Strip combining diacritical marks (tone accents) so toned and
  // un-toned romanizations compare equal. Decompose then drop marks.
  normalized = normalized.normalize('NFD').replace(/\p{M}+/gu, '')

  return normalized.toLowerCase()
}

// Count matching characters between two strings
function countMatchingCharacters(spoken: string, expected: string): number {
  let matches = 0
  const minLength = Math.min(spoken.length, expected.length)

  for (let i = 0; i < minLength; i++) {
    if (spoken[i] === expected[i]) {
      matches++
    }
  }

  return matches
}

/**
 * Validate Cantonese speech recognition result
 * @param spokenText - What the user said
 * @param expectedChant - What they should have said
 * @returns VoiceInputResult with confidence and feedback
 */
export function validateCantonese(
  spokenText: string,
  expectedChant: string
): VoiceInputResult {
  if (!spokenText || !expectedChant) {
    return {
      spokenText: spokenText || '',
      matchedChant: null,
      confidence: 0,
      isCorrect: false,
      feedback: '無法識別，請重試',
    }
  }

  // Normalize both inputs
  const spokenNorm = normalizeCantonese(spokenText)
  const expectedNorm = normalizeCantonese(expectedChant)

  // 1. Exact match check (after normalization)
  if (spokenNorm === expectedNorm) {
    return {
      spokenText,
      matchedChant: expectedChant,
      confidence: 100,
      isCorrect: true,
      feedback: '正確！',
    }
  }

  // 2. Digit skeleton match — handles ASR engines that return Arabic
  //    digits ("9327") for Cantonese number words ("九三二十七")
  const spokenDigits = toDigitSkeleton(spokenNorm)
  const expectedDigits = toDigitSkeleton(expectedNorm)
  if (spokenDigits.length > 0 && spokenDigits === expectedDigits) {
    return {
      spokenText,
      matchedChant: expectedChant,
      confidence: DIGIT_MATCH_CONFIDENCE,
      isCorrect: true,
      feedback: '正確！',
    }
  }

  // 3. Fuzzy matching using Levenshtein distance
  const distance = levenshteinDistance(spokenNorm, expectedNorm)
  const maxDistance = Math.ceil(expectedNorm.length * 0.2) // 20% tolerance

  if (distance <= maxDistance) {
    const confidence = Math.max(0, 100 - (distance * (100 / expectedNorm.length)))
    const isCorrect = confidence >= CONFIDENCE_THRESHOLD

    return {
      spokenText,
      matchedChant: expectedChant,
      confidence: Math.round(confidence),
      isCorrect,
      feedback: isCorrect ? '正確！' : '部分正確，再試一次',
    }
  }

  // 4. Character-level fallback
  const matchedChars = countMatchingCharacters(spokenNorm, expectedNorm)
  const accuracy = (matchedChars / expectedNorm.length) * 100

  return {
    spokenText,
    matchedChant: expectedChant,
    confidence: Math.round(accuracy),
    isCorrect: false,
    feedback: accuracy >= 50 ? '部分正確' : '再試一次',
  }
}

/**
 * Batch validate multiple recognition alternatives
 * Used with Web Speech API's maxAlternatives feature
 */
export function validateAlternatives(
  alternatives: Array<{ transcript: string; confidence: number }>,
  expectedChant: string
): VoiceInputResult {
  if (!alternatives || alternatives.length === 0) {
    return {
      spokenText: '',
      matchedChant: null,
      confidence: 0,
      isCorrect: false,
      feedback: '未能識別',
    }
  }

  // Find best match among alternatives
  let bestResult = validateCantonese(alternatives[0].transcript, expectedChant)
  let bestScore = bestResult.confidence

  for (let i = 1; i < alternatives.length; i++) {
    const result = validateCantonese(alternatives[i].transcript, expectedChant)
    if (result.confidence > bestScore) {
      bestResult = result
      bestScore = result.confidence
    }
  }

  return bestResult
}
