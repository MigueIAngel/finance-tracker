import { describe, it, expect } from 'vitest'
import { buildParams, formatAmount } from '@/lib/api'

describe('buildParams', () => {
  it('builds query string from object, omitting undefined values', () => {
    const result = buildParams({ month: 3, year: 2026, type: undefined })
    expect(result).toBe('month=3&year=2026')
  })

  it('returns empty string for empty object', () => {
    expect(buildParams({})).toBe('')
  })
})

describe('formatAmount', () => {
  it('formats a string number to 2 decimal places', () => {
    expect(formatAmount('45.5')).toBe(45.5)
    expect(formatAmount('100')).toBe(100)
  })
})
