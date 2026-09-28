'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { isDemoMode } from '@/lib/demo'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async (body: { password: string } | { guest: true }) => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    void login({ password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8 backdrop-blur-md"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-full mb-4" style={{ background: 'rgba(167,139,250,0.2)' }}>
            <LockKeyhole size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-white text-xl font-bold">Finance Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isDemoMode ? 'Demo pública con datos ficticios' : 'Ingresa tu contraseña para continuar'}
          </p>
        </div>

        {isDemoMode ? (
          <div className="space-y-4">
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Explora la app con seis meses de movimientos de ejemplo. Puedes crear, editar y borrar
              lo que quieras: los datos se reinician cuando el servidor se reinicia.
            </p>
            {error && (
              <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>{error}</p>
            )}
            <button
              type="button"
              onClick={() => void login({ guest: true })}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Entrando...' : 'Entrar como invitado'}
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full rounded-xl px-4 py-3 pr-12 text-white text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
