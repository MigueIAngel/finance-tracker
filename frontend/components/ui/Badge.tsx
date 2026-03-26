import type { TransactionType, SavingsPlanType } from '@/types'

type BadgeVariant = TransactionType | SavingsPlanType

const bgMap: Record<BadgeVariant, string> = {
  income:   'rgba(110,231,183,0.15)',
  expense:  'rgba(252,165,165,0.15)',
  savings:  'rgba(196,181,253,0.15)',
  monthly:  'rgba(167,139,250,0.15)',
  goal:     'rgba(251,191,36,0.15)',
}

const colorMap: Record<BadgeVariant, string> = {
  income:   '#6ee7b7',
  expense:  '#fca5a5',
  savings:  '#c4b5fd',
  monthly:  '#a78bfa',
  goal:     '#fbbf24',
}

const labelMap: Record<BadgeVariant, string> = {
  income:   'Ingreso',
  expense:  'Gasto',
  savings:  'Ahorro',
  monthly:  'Mensual',
  goal:     'Meta',
}

interface BadgeProps {
  variant: BadgeVariant
  customLabel?: string
  customColor?: string
}

export function Badge({ variant, customLabel, customColor }: BadgeProps) {
  const bg = bgMap[variant] ?? 'rgba(255,255,255,0.1)'
  const color = customColor ?? colorMap[variant] ?? '#fff'
  const label = customLabel ?? labelMap[variant] ?? variant

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}
