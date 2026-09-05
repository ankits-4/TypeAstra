export function dateOnly(iso: string): string {
  return iso.slice(0, 10)
}
export function todayDateOnly(): string {
  return dateOnly(new Date().toISOString())
}
export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.round((d2.getTime() - d1.getTime()) / 86400000)
}
