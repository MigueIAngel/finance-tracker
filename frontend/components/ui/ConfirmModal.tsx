'use client'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Eliminar',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(252,165,165,0.12)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'rgba(239,68,68,0.75)' }}
          >
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
