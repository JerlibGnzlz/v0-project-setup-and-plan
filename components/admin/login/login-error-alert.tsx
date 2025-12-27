'use client'

import { AlertCircle } from 'lucide-react'

interface LoginErrorAlertProps {
  error: string
  onClose: () => void
}

export function LoginErrorAlert({ error, onClose }: LoginErrorAlertProps) {
  return (
    <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 shadow-lg shadow-rose-500/10">
      <div className="p-2 rounded-full bg-rose-500/20 ring-2 ring-rose-500/30 flex-shrink-0">
        <AlertCircle className="w-4 h-4 text-rose-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-rose-300 mb-1">Error de autenticación</p>
        <p className="text-xs text-rose-400/80 leading-relaxed">{error}</p>
      </div>
      {/* Botón para cerrar el mensaje */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-rose-500/20 transition-colors"
        aria-label="Cerrar mensaje de error"
      >
        <svg
          className="w-4 h-4 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

























