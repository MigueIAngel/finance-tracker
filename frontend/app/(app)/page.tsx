'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { MonthlyBars } from '@/components/charts/MonthlyBars'
import { BalanceLine } from '@/components/charts/BalanceLine'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useSummary, useLast6MonthsSummary } from '@/hooks/useSummary'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function ResumenPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  const { summary } = useSummary(month, year)
  const { summaries: last6 } = useLast6MonthsSummary(month, year)
  const { transactions } = useTransactions({ month, year })
  const { categories } = useCategories()

  const filteredTransactions = activeCategoryId
    ? transactions.filter(t => t.category?.id === activeCategoryId)
    : transactions

  const activeCategory = activeCategoryId ? categories.find(c => c.id === activeCategoryId) : null

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const fmt = (n?: number) => n !== undefined ? `$${n.toFixed(2)}` : '—'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-white font-semibold text-lg">{MONTHS[month - 1]} {year}</h1>
        <button onClick={nextMonth} className="p-2 rounded-xl transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'BALANCE',   value: fmt(summary?.balance),  color: '#fff' },
          { label: 'INGRESOS',  value: fmt(summary?.income),   color: 'var(--success)' },
          { label: 'GASTOS',    value: fmt(summary?.expense),  color: 'var(--danger)' },
          { label: 'AHORRO',    value: fmt(summary?.savings),  color: '#c4b5fd' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <div className="text-xs mb-1" style={{ color: color === '#fff' ? 'rgba(255,255,255,0.5)' : color }}>{label}</div>
            <div className="text-white text-xl font-bold">{value}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>GASTOS POR CATEGORÍA</div>
          <CategoryDonut
            transactions={transactions}
            activeCategoryId={activeCategoryId}
            onCategoryClick={setActiveCategoryId}
          />
        </Card>
        <Card>
          <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>ÚLTIMOS 6 MESES</div>
          <MonthlyBars
            summaries={last6}
            currentMonth={month}
            currentYear={year}
            onBarClick={(m, y) => { setMonth(m); setYear(y) }}
          />
          <div className="flex gap-4 mt-2">
            <span className="text-xs" style={{ color: 'rgba(99,102,241,0.8)' }}>■ Ingresos</span>
            <span className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>■ Gastos</span>
          </div>
        </Card>
      </div>

      {/* Balance line */}
      <Card>
        <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>EVOLUCIÓN DEL BALANCE</div>
        <BalanceLine summaries={last6} />
      </Card>

      {/* Transaction list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>TRANSACCIONES</span>
            {activeCategory && (
              <button
                onClick={() => setActiveCategoryId(null)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${activeCategory.color}26`, color: activeCategory.color }}
              >
                {activeCategory.name} <X size={11} className="ml-0.5" />
              </button>
            )}
          </div>
          <Link href={`/transacciones?month=${month}&year=${year}`} className="text-xs" style={{ color: 'var(--accent)' }}>
            ver todas →
          </Link>
        </div>

        <div className="space-y-3">
          {filteredTransactions.slice(0, 10).map(t => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: t.category?.color ?? 'rgba(255,255,255,0.3)' }} />
                <div>
                  <div className="text-white text-sm">{t.note ?? t.category?.name ?? '—'}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(t.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium" style={{
                color: t.type === 'income' ? 'var(--success)' : t.type === 'savings' ? '#c4b5fd' : 'var(--danger)'
              }}>
                {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin transacciones</p>
          )}
        </div>
      </Card>
    </div>
  )
}
