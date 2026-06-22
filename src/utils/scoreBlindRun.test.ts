import { describe, expect, it } from 'vitest'
import { scoreBlindRun } from './voiceValidation'
import { getChantsByTable } from './chantData'

const table9 = getChantsByTable(9)

describe('scoreBlindRun', () => {
  it('scores a perfect Cantonese recitation as all correct', () => {
    const transcript = table9.map((l) => l.cantonese).join(' ')
    const score = scoreBlindRun(transcript, table9)

    expect(score.total).toBe(9)
    expect(score.correct).toBe(9)
    expect(score.perLine.every((p) => p.isCorrect)).toBe(true)
  })

  it('scores a run transcribed as Arabic digits', () => {
    // Whisper sometimes returns digits: 9x1=9 → 919, 9x2=18 → 9218, ...
    const transcript = '919 9218 9327 9436 9545 9654 9763 9872 9981'
    const score = scoreBlindRun(transcript, table9)

    expect(score.correct).toBe(9)
  })

  it('marks a missing line incorrect but keeps the rest', () => {
    // Drop the 3rd line (九三二十七)
    const lines = table9.filter((_, i) => i !== 2)
    const transcript = lines.map((l) => l.cantonese).join(' ')
    const score = scoreBlindRun(transcript, table9)

    expect(score.correct).toBe(8)
    expect(score.perLine[2].isCorrect).toBe(false)
  })

  it('handles homophone transcripts (狗 for 九, 於 for 如)', () => {
    const transcript = '狗一於狗 九二一十八'
    const score = scoreBlindRun(transcript, table9.slice(0, 2))

    expect(score.correct).toBe(2)
  })

  it('scores an empty transcript as all incorrect', () => {
    const score = scoreBlindRun('', table9)

    expect(score.correct).toBe(0)
    expect(score.total).toBe(9)
  })
})
