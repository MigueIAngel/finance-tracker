'use client'
import { useState } from 'react'
import type { TransactionType, NewCategory } from '@/types'

interface CategoryFormProps {
  onSubmit: (data: NewCategory) => Promise<void>
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)

  const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
  const selectStyle = { background: 'rgba(20,17,60,0.97)', border: '1px solid rgba(255,255,255,0.15)' }
  const inputClass = "w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-purple-400"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), type, color })
      setName('')
      setColor('#6366f1')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nombre</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej. Gym" className={inputClass} style={inputStyle} />
      </div>

      <div className="w-36">
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tipo</label>
        <select value={type} onChange={e => setType(e.target.value as TransactionType)}
          className={`${inputClass} cursor-pointer`} style={selectStyle}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="savings">Ahorro</option>
        </select>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Color</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="h-10 w-12 rounded-xl cursor-pointer" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '2px' }} />
      </div>

      <button type="submit" disabled={loading}
        className="h-10 px-5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
        style={{ background: 'var(--accent)' }}>
        {loading ? '...' : 'Agregar'}
      </button>
    </form>
  )
}
