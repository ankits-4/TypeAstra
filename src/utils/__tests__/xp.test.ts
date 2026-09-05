import { describe, it, expect } from 'vitest'
import { xpForLevel, levelFromXp, xpForResult } from '../xp'

describe('xpForLevel', () => {
  it('increases as level increases', () => {
    expect(xpForLevel(5)).toBeGreaterThan(xpForLevel(1))
    expect(xpForLevel(20)).toBeGreaterThan(xpForLevel(5))
  })
})

describe('levelFromXp', () => {
  it('starts at level 1 with zero xp', () => {
    const { level } = levelFromXp(0)
    expect(level).toBe(1)
  })
  it('levels up once enough xp for level 1 is earned', () => {
    const threshold = xpForLevel(1)
    const { level } = levelFromXp(threshold)
    expect(level).toBe(2)
  })
  it('tracks remaining xp into the current level', () => {
    const { level, xpIntoLevel } = levelFromXp(50)
    expect(level).toBe(1)
    expect(xpIntoLevel).toBe(50)
  })
  it('caps at level 100', () => {
    const { level } = levelFromXp(10_000_000)
    expect(level).toBeLessThanOrEqual(100)
  })
})

describe('xpForResult', () => {
  it('awards more xp for higher wpm', () => {
    const low = xpForResult(20, 95, 30)
    const high = xpForResult(80, 95, 30)
    expect(high).toBeGreaterThan(low)
  })
  it('never awards less than the minimum', () => {
    expect(xpForResult(0, 0, 1)).toBeGreaterThanOrEqual(5)
  })
})
