'use client'

import { useRouter } from 'next/navigation'

export function LoginFooter() {
  const router = useRouter()

  const handleForgotPassword = () => {
    router.push('/admin/forgot-password')
  }

  return (
    <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
      <div className="text-center">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-xs text-white/60 hover:text-white/90 transition-colors underline-offset-4 hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <p className="text-center text-[10px] text-white/30">
        Acceso restringido para administradores autorizados
      </p>
    </div>
  )
}





























