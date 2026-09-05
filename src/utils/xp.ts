export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.35))
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpForLevel(level) && level < 100) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpForLevel(level) }
}

export function xpForResult(wpm: number, accuracy: number, durationSeconds: number): number {
  const base = Math.round(wpm * 0.8 + (accuracy - 80) * 0.5)
  const durationBonus = Math.min(20, Math.round(durationSeconds / 10))
  return Math.max(5, base + durationBonus)
}
