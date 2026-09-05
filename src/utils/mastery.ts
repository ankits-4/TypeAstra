export function masteryStars(wpm: number, accuracy: number, targetWpm: number, targetAccuracy: number): number {
  if (accuracy < targetAccuracy - 8 || wpm < targetWpm * 0.55) return 0

  const speedScore = Math.min(1, wpm / targetWpm)
  const accuracyScore = Math.min(1, accuracy / targetAccuracy)
  const score = speedScore * 0.4 + accuracyScore * 0.6
  if (score >= 0.98 && accuracy >= targetAccuracy) return 5
  if (score >= 0.9) return 4
  if (score >= 0.8) return 3
  if (score >= 0.68) return 2
  return 1
}
