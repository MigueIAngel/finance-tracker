import type {
  Transaction,
  Category,
  MonthlySummary,
  SavingsPlan,
  NewTransaction,
  NewCategory,
  NewSavingsPlan,
} from '@/types'

export function buildParams(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ''
  return entries.map(([k, v]) => `${k}=${v}`).join('&')
}

export function formatAmount(amount: string): number {
  return parseFloat(amount)
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error ?? 'Request failed')
  }
  return res.json()
}

export const getTransactions = (params: Record<string, string | number | undefined>) => {
  const qs = buildParams(params)
  return apiFetch<Transaction[]>(`/api/proxy/transactions${qs ? `?${qs}` : ''}`)
}

export const getSummary = (month: number, year: number) =>
  apiFetch<MonthlySummary>(`/api/proxy/transactions/summary?month=${month}&year=${year}`)

export const createTransaction = (data: NewTransaction) =>
  apiFetch<Transaction>('/api/proxy/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateTransaction = (id: number, data: { categoryId?: number; amount?: number }) =>
  apiFetch<Transaction>(`/api/proxy/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteTransaction = (id: number) =>
  fetch(`/api/proxy/transactions/${id}`, { method: 'DELETE' })

export const getCategories = () => apiFetch<Category[]>('/api/proxy/categories')

export const createCategory = (data: NewCategory) =>
  apiFetch<Category>('/api/proxy/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteCategory = (id: number) =>
  fetch(`/api/proxy/categories/${id}`, { method: 'DELETE' })

export const getSavingsPlans = () => apiFetch<SavingsPlan[]>('/api/proxy/savings')

export const createSavingsPlan = (data: NewSavingsPlan) =>
  apiFetch<SavingsPlan>('/api/proxy/savings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateSavingsPlan = (id: number, data: Partial<NewSavingsPlan & { isActive: boolean }>) =>
  apiFetch<SavingsPlan>(`/api/proxy/savings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteSavingsPlan = (id: number) =>
  fetch(`/api/proxy/savings/${id}`, { method: 'DELETE' })
