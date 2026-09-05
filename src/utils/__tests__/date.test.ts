import { describe, it, expect } from 'vitest'
import { dateOnly, daysBetween } from '../date'

describe('date utils', () => {
  it('extracts the date-only portion of an ISO string', () => {
    expect(dateOnly('2026-09-02T10:30:00.000Z')).toBe('2026-09-02')
  })
  it('computes the number of days between two dates', () => {
    expect(daysBetween('2026-09-01', '2026-09-02')).toBe(1)
    expect(daysBetween('2026-09-01', '2026-09-05')).toBe(4)
    expect(daysBetween('2026-09-01', '2026-09-01')).toBe(0)
  })
})
