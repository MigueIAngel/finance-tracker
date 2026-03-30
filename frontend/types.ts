export type TransactionType = 'income' | 'expense' | 'savings'
export type SavingsPlanType = 'monthly' | 'goal'

export interface Category {
  id: number
  name: string
  type: TransactionType
  color: string
  createdAt: string
}

export interface Transaction {
  id: number
  amount: string
  type: TransactionType
  note: string | null
  date: string
  savingsPlanId: number | null
  category: {
    id: number
    name: string
    color: string
  } | null
}

export interface MonthlySummary {
  month: number
  year: number
  income: number
  expense: number
  savings: number
  balance: number
}

export interface SavingsPlan {
  id: number
  name: string
  type: SavingsPlanType
  targetAmount: string
  deadline: string | null
  isActive: boolean
  createdAt: string
  savedAmount: number
  progressPercent: number
}

export interface NewTransaction {
  amount: number
  type: TransactionType
  categoryId?: number
  savingsPlanId?: number
  note?: string
  date?: string
}

export interface NewCategory {
  name: string
  type: TransactionType
  color: string
}

export interface NewSavingsPlan {
  name: string
  type: SavingsPlanType
  targetAmount: number
  deadline?: string
}
