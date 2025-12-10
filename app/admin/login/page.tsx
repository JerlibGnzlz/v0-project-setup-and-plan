'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import { type LoginFormData } from '@/lib/validations/auth'
import {
  LoginLayout,
  LoginCard,
  LoginLogo,
  LoginErrorAlert,
  LoginForm,
  LoginFooter,
} from '@/components/admin/login'

export default function AdminLogin() {
  const router = useRouter()
  const { login, isAuthenticated, isHydrated } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, isHydrated, router])

  const handleSubmit = async (data: LoginFormData & { rememberMe: boolean }) => {
    setIsSubmitting(true)
    setLoginError(null)
    
    try {
      await login(data)

      // Limpiar error solo cuando el login es exitoso
      setLoginError(null)

      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })

      // Resetear isSubmitting antes de redirigir
      setIsSubmitting(false)

      // Usar window.location.href para forzar una navegación completa
      // Esto asegura que el layout del admin detecte correctamente la autenticación
      window.location.href = '/admin'
    } catch (error: unknown) {
      const errorData = (error as { response?: { data?: { message?: string }; message?: string } })?.response?.data
      let errorMessage = errorData?.message || (error as { message?: string })?.message || 'Credenciales inválidas'

      // Mensaje más claro para credenciales incorrectas
      if (
        errorMessage.includes('Credenciales inválidas') ||
        errorMessage.includes('inválidas') ||
        errorMessage.includes('401')
      ) {
        errorMessage =
          'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.'
      }

      setLoginError(errorMessage)
      toast.error('Error de autenticación', {
        description: errorMessage,
        duration: 5000,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <LoginLayout>
      <LoginCard>
        <LoginLogo />

        {loginError && <LoginErrorAlert error={loginError} onClose={() => setLoginError(null)} />}

        <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <LoginFooter />
      </LoginCard>
    </LoginLayout>
  )
}
