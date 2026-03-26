interface ProgressBarProps {
  percent: number
  label?: string
  sublabel?: string
}

export function ProgressBar({ percent, label, sublabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1.5">
        {label && <span className="text-xs text-white/50">{label}</span>}
        {sublabel && <span className="text-xs text-white/40 ml-auto mr-2">{sublabel}</span>}
        <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          {clamped}%
        </span>
      </div>
      <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #7c3aed, var(--accent))',
          }}
        />
      </div>
    </div>
  )
}
