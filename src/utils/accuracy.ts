export function calcAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped <= 0) return 100
  const pct = (correctChars / totalTyped) * 100
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10))
}
