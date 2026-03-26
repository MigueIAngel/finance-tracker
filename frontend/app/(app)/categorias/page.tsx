'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { useCategories } from '@/hooks/useCategories'
import { createCategory, deleteCategory } from '@/lib/api'
import type { TransactionType, NewCategory } from '@/types'

export default function CategoriasPage() {
  const { categories, mutate } = useCategories()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleCreate = async (data: NewCategory) => {
    await createCategory(data)
    await mutate()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Las transacciones vinculadas quedarán sin categoría.')) return
    setDeletingId(id)
    try {
      await deleteCategory(id)
      await mutate()
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = {
    income:  categories.filter(c => c.type === 'income'),
    expense: categories.filter(c => c.type === 'expense'),
    savings: categories.filter(c => c.type === 'savings'),
  }

  const typeLabels: Record<string, string> = { income: 'Ingresos', expense: 'Gastos', savings: 'Ahorro' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-white text-xl font-bold">Categorías</h1>

      {(['income', 'expense', 'savings'] as TransactionType[]).map(type => (
        grouped[type].length > 0 && (
          <div key={type}>
            <h2 className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {typeLabels[type].toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[type].map(cat => (
                <Card key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-white text-sm font-medium">{cat.name}</span>
                    <Badge variant={cat.type} />
                  </div>
                  <button onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-40"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <Trash2 size={15} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}

      <div>
        <h2 className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          NUEVA CATEGORÍA
        </h2>
        <Card>
          <CategoryForm onSubmit={handleCreate} />
        </Card>
      </div>
    </div>
  )
}
