import { describe, it, expect } from 'vitest'
import { calcAccuracy } from '../accuracy'

describe('calcAccuracy', () => {
  it('computes correct/total as a percentage', () => {
    expect(calcAccuracy(90, 100)).toBe(90)
  })
  it('returns 100 when nothing has been typed yet', () => {
    expect(calcAccuracy(0, 0)).toBe(100)
  })
  it('never exceeds 100', () => {
    // guards against impossible inputs (e.g. correctChars > totalTyped)
    expect(calcAccuracy(120, 100)).toBe(100)
  })
  it('never goes below 0', () => {
    expect(calcAccuracy(-5, 100)).toBe(0)
  })
  it('rounds to one decimal place', () => {
    expect(calcAccuracy(1, 3)).toBe(33.3)
  })
})
