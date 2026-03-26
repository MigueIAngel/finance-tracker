import useSWR from 'swr'
import type { MonthlySummary } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSummary(month: number, year: number) {
  const { data, error, isLoading } = useSWR<MonthlySummary>(
    `/api/proxy/transactions/summary?month=${month}&year=${year}`,
    fetcher
  )
  return { summary: data, error, isLoading }
}

function getLast6Months(currentMonth: number, currentYear: number) {
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
        months.map(({ month, year }) =>
          fetch(`/api/proxy/transactions/summary?month=${month}&year=${year}`)
            .then(r => r.json())
        )
      )
      return results as MonthlySummary[]
    }
  )

  return { summaries: data ?? [], months, error, isLoading }
}
