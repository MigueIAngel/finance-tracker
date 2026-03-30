import useSWR from 'swr'
import { getSummary } from '@/lib/api'
import type { MonthlySummary } from '@/types'

export function useSummary(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR<MonthlySummary>(
    `/api/proxy/transactions/summary?month=${month}&year=${year}`,
    () => getSummary(month, year)
  )
  return { summary: data, error, isLoading, mutate }
}

export function getLast6Months(currentMonth: number, currentYear: number) {
  return Array.from({ length: 6 }, (_, i) => {
    let m = currentMonth - (5 - i)
    let y = currentYear
    while (m <= 0) { m += 12; y -= 1 }
    return { month: m, year: y }
  })
}

export function useLast6MonthsSummary(currentMonth: number, currentYear: number) {
  const months = getLast6Months(currentMonth, currentYear)

  const { data, error, isLoading } = useSWR<MonthlySummary[]>(
    ['summary-6months', currentMonth, currentYear],
    async () => {
      const results = await Promise.all(
        months.map(({ month, year }) => getSummary(month, year))
      )
      return results
    }
  )

  return { summaries: data ?? [], months, error, isLoading }
}
