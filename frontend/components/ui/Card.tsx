interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 backdrop-blur-md ${className}`}
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      {children}
    </div>
  )
}
