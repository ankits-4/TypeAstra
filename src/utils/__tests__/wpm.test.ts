import { describe, it, expect } from 'vitest'
import { calcWpm, calcCpm } from '../wpm'

describe('calcWpm', () => {
  it('computes standard WPM: (correctChars/5) / minutes', () => {
    // 250 correct chars in 60s = 50 words in 1 minute = 50 WPM
    expect(calcWpm(250, 60)).toBe(50)
  })
  it('returns 0 for zero elapsed time', () => {
    expect(calcWpm(100, 0)).toBe(0)
  })
  it('never returns a negative value', () => {
    expect(calcWpm(0, 10)).toBe(0)
  })
  it('rounds to the nearest whole number', () => {
    // 137 chars / 5 = 27.4 words, in 30s (0.5 min) = 54.8 -> 55
    expect(calcWpm(137, 30)).toBe(55)
  })
})

describe('calcCpm', () => {
  it('computes characters per minute', () => {
    expect(calcCpm(300, 60)).toBe(300)
  })
  it('returns 0 for zero elapsed time', () => {
    expect(calcCpm(100, 0)).toBe(0)
  })
})
