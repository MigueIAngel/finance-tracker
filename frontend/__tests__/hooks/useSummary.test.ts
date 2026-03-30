import { describe, it, expect } from 'vitest'
import { getLast6Months } from '@/hooks/useSummary'

describe('getLast6Months', () => {
  it('returns 6 months ending in current month', () => {
    const result = getLast6Months(3, 2026)
    expect(result).toHaveLength(6)
    expect(result[5]).toEqual({ month: 3, year: 2026 })
    expect(result[0]).toEqual({ month: 10, year: 2025 })
  })

  it('wraps correctly when current month is January', () => {
    const result = getLast6Months(1, 2026)
    expect(result[0]).toEqual({ month: 8, year: 2025 })
    expect(result[5]).toEqual({ month: 1, year: 2026 })
  })
})
