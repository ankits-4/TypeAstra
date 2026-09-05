export function calcWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0
  const minutes = elapsedSeconds / 60
  const wpm = (correctChars / 5) / minutes
  return Math.max(0, Math.round(wpm))
}

export function calcCpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0
  const minutes = elapsedSeconds / 60
  return Math.max(0, Math.round(correctChars / minutes))
}
