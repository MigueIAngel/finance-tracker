'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 backdrop-blur-md"
        style={{ background: 'rgba(20,17,60,0.97)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
