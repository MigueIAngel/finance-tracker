'use client'
import { useState } from 'react'
import type { SavingsPlanType, NewSavingsPlan } from '@/types'

interface SavingsPlanFormProps {
  onSubmit: (data: NewSavingsPlan) => Promise<void>
  onCancel: () => void
}

const inputClass = "w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-purple-400"
const inputStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
const selectStyle = { background: 'rgba(20,17,60,0.97)', border: '1px solid rgba(255,255,255,0.15)' }

export function SavingsPlanForm({ onSubmit, onCancel }: SavingsPlanFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<SavingsPlanType>('goal')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline + 'T12:00:00').toISOString() : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nombre del plan</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej. Fondo de emergencia" className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tipo</label>
        <select value={type} onChange={e => setType(e.target.value as SavingsPlanType)}
          className={`${inputClass} cursor-pointer`} style={selectStyle}>
          <option value="goal">Meta (monto total a alcanzar)</option>
          <option value="monthly">Mensual (monto a ahorrar cada mes)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {type === 'monthly' ? 'Objetivo mensual ($)' : 'Monto objetivo ($)'}
        </label>
        <input type="number" step="0.01" min="1" required value={targetAmount}
          onChange={e => setTargetAmount(e.target.value)} placeholder="0.00"
          className={inputClass} style={inputStyle} />
      </div>

      {type === 'goal' && (
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Fecha límite (opcional)</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className={inputClass} style={inputStyle} />
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'var(--accent)' }}>
          {loading ? 'Guardando...' : 'Crear plan'}
        </button>
      </div>
    </form>
  )
}
