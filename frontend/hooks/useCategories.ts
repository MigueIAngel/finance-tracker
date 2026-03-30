import useSWR from 'swr'
import { getCategories } from '@/lib/api'
import type { Category } from '@/types'

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    '/api/proxy/categories',
    () => getCategories()
  )
  return { categories: data ?? [], error, isLoading, mutate }
}
