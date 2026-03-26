import useSWR from 'swr'
import type { Category } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    '/api/proxy/categories',
    fetcher
  )
  return { categories: data ?? [], error, isLoading, mutate }
}
