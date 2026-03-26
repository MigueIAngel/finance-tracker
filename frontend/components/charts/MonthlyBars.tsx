'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MonthlySummary } from '@/types'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

interface MonthlyBarsProps {
  summaries: MonthlySummary[]
  currentMonth: number
  currentYear: number
  onBarClick: (month: number, year: number) => void
}

export function MonthlyBars({ summaries, currentMonth, currentYear, onBarClick }: MonthlyBarsProps) {
  const data = summaries.map(s => ({
    name: MONTHS[s.month - 1],
    ingresos: s.income,
    gastos: s.expense,
    month: s.month,
    year: s.year,
    isCurrent: s.month === currentMonth && s.year === currentYear,
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={data}
        barGap={2}
        onClick={e => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload = (e as any)?.activePayload?.[0]?.payload
          if (payload) onBarClick(payload.month, payload.year)
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={48} />
        <Tooltip
          cursor={false}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const ingresos = payload.find(p => p.dataKey === 'ingresos')
            const gastos = payload.find(p => p.dataKey === 'gastos')
            return (
              <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(20,17,60,0.97)', border: '1px solid var(--card-border)' }}>
                <div className="text-white font-medium mb-1">{label}</div>
                <div style={{ color: '#818cf8' }}>Ingresos: ${Number(ingresos?.value ?? 0).toFixed(2)}</div>
                <div style={{ color: '#f87171' }}>Gastos: ${Number(gastos?.value ?? 0).toFixed(2)}</div>
              </div>
            )
          }}
        />
        <Bar dataKey="ingresos" radius={[3,3,0,0]} cursor="pointer">
          {data.map((entry, i) => (
            <Cell key={i}
              fill={entry.isCurrent ? 'rgba(167,139,250,0.9)' : 'rgba(99,102,241,0.5)'}
              stroke={entry.isCurrent ? '#a78bfa' : 'none'}
              strokeWidth={1}
            />
          ))}
        </Bar>
        <Bar dataKey="gastos" radius={[3,3,0,0]} cursor="pointer">
          {data.map((entry, i) => (
            <Cell key={i}
              fill={entry.isCurrent ? 'rgba(248,113,113,0.85)' : 'rgba(248,113,113,0.45)'}
              stroke={entry.isCurrent ? '#f87171' : 'none'}
              strokeWidth={1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
