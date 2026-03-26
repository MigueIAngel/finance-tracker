import useSWR from 'swr'
import type { SavingsPlan } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSavingsPlans() {
  const { data, error, isLoading, mutate } = useSWR<SavingsPlan[]>(
    '/api/proxy/savings',
    fetcher
  )
  return { plans: data ?? [], error, isLoading, mutate }
}
