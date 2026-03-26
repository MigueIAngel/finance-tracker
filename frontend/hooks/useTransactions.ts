import useSWR from 'swr'
import type { Transaction } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Params {
  month: number
  year: number
  type?: string
  categoryId?: number
}

export function useTransactions({ month, year, type, categoryId }: Params) {
  const qs = new URLSearchParams({ month: String(month), year: String(year) })
  if (type) qs.set('type', type)
  if (categoryId) qs.set('categoryId', String(categoryId))

  const key = `/api/proxy/transactions?${qs}`

  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(key, fetcher)
  return { transactions: data ?? [], error, isLoading, mutate }
}
