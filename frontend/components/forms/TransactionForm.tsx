'use client'
import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import type { TransactionType, NewTransaction } from '@/types'

interface TransactionFormProps {
  onSubmit: (data: NewTransaction) => Promise<void>
  onCancel: () => void
  defaultSavingsPlanId?: number
}

const inputClass = "w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-purple-400"
const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
const selectStyle = { background: 'rgba(20,17,60,0.97)', border: '1px solid rgba(255,255,255,0.15)' }

export function TransactionForm({ onSubmit, onCancel, defaultSavingsPlanId }: TransactionFormProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>(defaultSavingsPlanId ? 'savings' : 'expense')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const { categories } = useCategories()

  const filtered = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        amount: parseFloat(amount),
        type,
        categoryId: categoryId ? Number(categoryId) : undefined,
        savingsPlanId: defaultSavingsPlanId,
        note: note.trim() || undefined,
        date: new Date(date + 'T12:00:00').toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Monto</label>
        <input type="number" step="0.01" min="0.01" required value={amount}
          onChange={e => setAmount(e.target.value)} placeholder="0.00"
          className={inputClass} style={inputStyle} />
      </div>

      {!defaultSavingsPlanId && (
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tipo</label>
          <select value={type} onChange={e => { setType(e.target.value as TransactionType); setCategoryId('') }}
            className={`${inputClass} cursor-pointer`} style={selectStyle}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="savings">Ahorro</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Categoría</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className={`${inputClass} cursor-pointer`} style={selectStyle}>
          <option value="">Sin categoría</option>
          {filtered.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nota (opcional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Descripción..." className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Fecha</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className={inputClass} style={inputStyle} />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'var(--accent)' }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
