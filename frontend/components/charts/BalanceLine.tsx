'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { MonthlySummary } from '@/types'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

interface BalanceLineProps {
  summaries: MonthlySummary[]
}

export function BalanceLine({ summaries }: BalanceLineProps) {
  const data = summaries.map(s => ({
    name: MONTHS[s.month - 1],
    balance: s.balance,
  }))

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={48} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const val = Number(payload[0]?.value ?? 0)
            return (
              <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(20,17,60,0.97)', border: '1px solid var(--card-border)' }}>
                <div className="text-white font-medium">{label}</div>
                <div style={{ color: val >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  Balance: ${val.toFixed(2)}
                </div>
              </div>
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#fff', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
