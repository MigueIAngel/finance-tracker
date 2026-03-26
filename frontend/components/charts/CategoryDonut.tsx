'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Transaction } from '@/types'

interface DonutData {
  name: string
  value: number
  color: string
  categoryId: number
}

interface CategoryDonutProps {
  transactions: Transaction[]
  activeCategoryId: number | null
  onCategoryClick: (id: number | null) => void
}

export function CategoryDonut({ transactions, activeCategoryId, onCategoryClick }: CategoryDonutProps) {
  const dataMap = new Map<number, DonutData>()

  for (const t of transactions) {
    if (t.type !== 'expense' || !t.category) continue
    const existing = dataMap.get(t.category.id)
    const amount = parseFloat(t.amount)
    if (existing) {
      existing.value += amount
    } else {
      dataMap.set(t.category.id, {
        name: t.category.name,
        value: amount,
        color: t.category.color,
        categoryId: t.category.id,
      })
    }
  }

  const data = Array.from(dataMap.values())
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Sin gastos este mes
      </div>
    )
  }

  const handleClick = (entry: DonutData) => {
    onCategoryClick(activeCategoryId === entry.categoryId ? null : entry.categoryId)
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={46}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            onClick={(_, index) => handleClick(data[index])}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                opacity={activeCategoryId === null || activeCategoryId === entry.categoryId ? 1 : 0.25}
                stroke={activeCategoryId === entry.categoryId ? '#fff' : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload as DonutData
              return (
                <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(20,17,60,0.97)', border: '1px solid var(--card-border)' }}>
                  <div className="text-white font-medium">{d.name}</div>
                  <div className="text-white/70">${d.value.toFixed(2)}</div>
                  <div style={{ color: 'var(--accent)' }}>{total > 0 ? Math.round((d.value / total) * 100) : 0}%</div>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-2 mt-1">
        {data.map(d => (
          <button
            key={d.categoryId}
            onClick={() => handleClick(d)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all"
            style={{
              background: activeCategoryId === d.categoryId ? `${d.color}33` : 'rgba(255,255,255,0.07)',
              color: activeCategoryId === null || activeCategoryId === d.categoryId ? d.color : 'rgba(255,255,255,0.25)',
              border: `1px solid ${activeCategoryId === d.categoryId ? d.color : 'transparent'}`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name}
          </button>
        ))}
      </div>
    </div>
  )
}
