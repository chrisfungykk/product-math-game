import { describe, expect, it } from 'vitest'
import { validateAlternatives, validateCantonese } from './voiceValidation'

describe('validateCantonese', () => {
  it('accepts an exact Cantonese chant', () => {
    const result = validateCantonese('九一如九', '九一如九', { strict: true })

    expect(result.isCorrect).toBe(true)
    expect(result.confidence).toBe(100)
  })

  it('accepts common Cantonese homophone transcripts', () => {
    const result = validateCantonese('狗一於狗', '九一如九', { strict: true })

    expect(result.isCorrect).toBe(true)
  })

  it('accepts Arabic digit skeletons for full chant values', () => {
    const result = validateCantonese('9218', '九二一十八', { strict: true })

    expect(result.isCorrect).toBe(true)
  })

  it('accepts structural 拾 as 十', () => {
    const result = validateCantonese('九二一拾八', '九二一十八', { strict: true })

    expect(result.isCorrect).toBe(true)
  })

  it('rejects partial utterances in strict mode', () => {
    const result = validateCantonese('九一如', '九一如九', { strict: true })

    expect(result.isCorrect).toBe(false)
  })
})

describe('validateAlternatives', () => {
  it('chooses the best correct transcript from alternatives', () => {
    const result = validateAlternatives(
      [
        { transcript: '九一如', confidence: 0.8 },
        { transcript: '狗一於狗', confidence: 0.7 },
      ],
      '九一如九',
      { strict: true }
    )

    expect(result.isCorrect).toBe(true)
    expect(result.spokenText).toBe('狗一於狗')
  })
})
