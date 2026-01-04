'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isHydrated, user } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const credentialsUpdated = searchParams?.get('credentialsUpdated') === 'true'

  // Mostrar mensaje de éxito si las credenciales fueron actualizadas
  useEffect(() => {
    if (credentialsUpdated) {
      toast.success('Credenciales actualizadas', {
        description: 'Tus credenciales han sido actualizadas exitosamente. Por favor, inicia sesión con tu nuevo email y contraseña.',
        duration: 5000,
      })
      // Limpiar el parámetro de la URL sin recargar la página
      router.replace('/admin/login', { scroll: false })
    }
  }, [credentialsUpdated, router])

  // Si ya está autenticado, redirigir al dashboard o setup-credentials
  useEffect(() => {
    // Solo redirigir si no estamos en proceso de login y no estamos ya redirigiendo
    if (isHydrated && isAuthenticated && !isSubmitting && !isRedirecting && user) {
      setIsRedirecting(true)
      
      // Si el usuario tiene email que termina en @ministerio-amva.org,
      // redirigir a setup-credentials para cambiar la contraseña
      // De lo contrario, redirigir al dashboard
      if (user.email?.endsWith('@ministerio-amva.org')) {
        window.location.href = '/admin/setup-credentials'
      } else {
        window.location.href = '/admin'
      }
    }
  }, [isAuthenticated, isHydrated, isSubmitting, isRedirecting, user])

  const handleSubmit = async (data: LoginFormData & { rememberMe: boolean }) => {
    setIsSubmitting(true)
    setLoginError(null)
    setIsRedirecting(false)
    
    try {
      await login(data)

      // Limpiar error solo cuando el login es exitoso
      setLoginError(null)

      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })

      // Pequeño delay para asegurar que el toast se muestre y que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // El useEffect se encargará de la redirección automáticamente
      // No necesitamos redirigir manualmente aquí para evitar loops
      setIsSubmitting(false)
    } catch (error: unknown) {
      console.error('[AdminLogin] Error en login:', error)
      
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

      // Mensaje para errores de red
      if (errorMessage.includes('Network') || errorMessage.includes('conexión') || errorMessage.includes('conectar')) {
        errorMessage =
          'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      }

      setLoginError(errorMessage)
      toast.error('Error de autenticación', {
        description: errorMessage,
        duration: 5000,
      })
      setIsSubmitting(false)
      setIsRedirecting(false)
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

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <LoginLayout>
        <LoginCard>
          <LoginLogo />
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
          </div>
        </LoginCard>
      </LoginLayout>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
