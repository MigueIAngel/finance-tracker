'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { createTransaction, deleteTransaction } from '@/lib/api'
import type { TransactionType, NewTransaction } from '@/types'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function TransaccionesContent() {
  const searchParams = useSearchParams()
  const now = new Date()
  const [month, setMonth] = useState(Number(searchParams.get('month')) || now.getMonth() + 1)
  const [year, setYear] = useState(Number(searchParams.get('year')) || now.getFullYear())
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [classifyProgress, setClassifyProgress] = useState<{ done: number; total: number } | null>(null)

  const { transactions, mutate } = useTransactions({ month, year, type: (typeFilter || undefined) as TransactionType | undefined })
  const { categories } = useCategories()

  const displayed = categoryFilter
    ? transactions.filter(t => t.category?.id === Number(categoryFilter))
    : transactions

  const pendingCategory = categories.find(c => c.name.toLowerCase().includes('pendiente'))
  const pendingTransactions = transactions.filter(t => t.category?.id === pendingCategory?.id)

  const handleCreate = async (data: NewTransaction) => {
    await createTransaction(data)
    await mutate()
    setModalOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta transacción?')) return
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      await mutate()
    } finally {
      setDeletingId(null)
    }
  }

  const handleClassify = async () => {
    if (!pendingCategory || pendingTransactions.length === 0) return
    const otherCategories = categories.filter(c => c.id !== pendingCategory.id)
    if (otherCategories.length === 0) return

    setClassifying(true)
    setClassifyProgress({ done: 0, total: pendingTransactions.length })

    let done = 0
    for (const t of pendingTransactions) {
      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note: t.note ?? t.category?.name ?? '',
            categories: otherCategories,
          }),
        })
        if (res.ok) {
          const { categoryId } = await res.json()
          await fetch(`/api/proxy/transactions/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId }),
          })
        }
      } catch {
        // continue with next transaction on error
      }
      done++
      setClassifyProgress({ done, total: pendingTransactions.length })
    }

    await mutate()
    setClassifying(false)
    setClassifyProgress(null)
  }

  const selectStyle = { background: 'rgba(20,17,60,0.97)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Transacciones</h1>
        <div className="flex items-center gap-2">
          {pendingCategory && pendingTransactions.length > 0 && (
            <button
              onClick={handleClassify}
              disabled={classifying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 transition-opacity"
              style={{ background: 'rgba(167,139,250,0.2)', color: 'var(--accent)', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              <Sparkles size={15} />
              {classifying && classifyProgress
                ? `Clasificando ${classifyProgress.done}/${classifyProgress.total}...`
                : `Clasificar ${pendingTransactions.length} pendiente${pendingTransactions.length !== 1 ? 's' : ''}`}
            </button>
          )}
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3">
        <select value={`${year}-${month}`}
          onChange={e => { const [y, m] = e.target.value.split('-'); setYear(Number(y)); setMonth(Number(m)) }}
          className="rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]" style={selectStyle}>
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i)
            const m = d.getMonth() + 1; const y = d.getFullYear()
            return <option key={i} value={`${y}-${m}`}>{MONTHS[m - 1]} {y}</option>
          })}
        </select>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm flex-1 min-w-[120px]" style={selectStyle}>
          <option value="">Todos</option>
          <option value="income">Ingreso</option>
          <option value="expense">Gasto</option>
          <option value="savings">Ahorro</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]" style={selectStyle}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Card>

      {/* List */}
      <Card>
        {displayed.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin transacciones</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {displayed.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: t.category?.color ?? 'rgba(255,255,255,0.3)' }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{t.note ?? '—'}</span>
                      {t.category && (
                        <Badge variant={t.type as TransactionType} customLabel={t.category.name} customColor={t.category.color} />
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(t.date).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{
                    color: t.type === 'income' ? 'var(--success)' : t.type === 'savings' ? '#c4b5fd' : 'var(--danger)'
                  }}>
                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </span>
                  <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-40"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva transacción">
        <TransactionForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default function TransaccionesPage() {
  return (
    <Suspense>
      <TransaccionesContent />
    </Suspense>
  )
}
