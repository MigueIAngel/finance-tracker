import useSWR from 'swr'
import { getSavingsPlans } from '@/lib/api'
import type { SavingsPlan } from '@/types'

export function useSavingsPlans() {
  const { data, error, isLoading, mutate } = useSWR<SavingsPlan[]>(
    '/api/proxy/savings',
    () => getSavingsPlans()
  )
  return { plans: data ?? [], error, isLoading, mutate }
}
