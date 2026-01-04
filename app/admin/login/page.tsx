'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isHydrated, user } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const credentialsUpdated = searchParams?.get('credentialsUpdated') === 'true'
  const passwordChanged = searchParams?.get('passwordChanged') === 'true'

  // Mostrar mensaje de éxito si las credenciales fueron actualizadas
  useEffect(() => {
    if (credentialsUpdated) {
      toast.success('Credenciales actualizadas', {
        description: 'Tus credenciales han sido actualizadas exitosamente. Por favor, inicia sesión con tu nuevo email y contraseña.',
        duration: 5000,
      })
      // Limpiar el parámetro de la URL sin recargar la página
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/admin/login')
      }
    }
  }, [credentialsUpdated])

  // Mostrar mensaje de éxito si la contraseña fue cambiada
  useEffect(() => {
    if (passwordChanged) {
      toast.success('Contraseña cambiada exitosamente', {
        description: 'Tu contraseña ha sido cambiada. Por favor, inicia sesión con tu nueva contraseña.',
        duration: 5000,
      })
      // Limpiar el parámetro de la URL sin recargar la página
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/admin/login')
      }
    }
  }, [passwordChanged])

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }
    
    // Solo redirigir si no estamos en proceso de login y no estamos ya redirigiendo
    // Y solo si realmente estamos en la página de login (no en otra ruta)
    if (
      isHydrated &&
      isAuthenticated &&
      !isSubmitting &&
      !isRedirecting &&
      window.location.pathname === '/admin/login'
    ) {
      console.log('[AdminLogin] Usuario autenticado detectado en useEffect, redirigiendo', {
        userEmail: user?.email,
        tieneCredencialesPorDefecto: user?.email?.endsWith('@ministerio-amva.org'),
      })
      
      // Verificar si tiene credenciales por defecto
      const tieneCredencialesPorDefecto = user?.email?.endsWith('@ministerio-amva.org')
      const targetPath = tieneCredencialesPorDefecto ? '/admin/setup-credentials' : '/admin'
      
      setIsRedirecting(true)
      window.location.replace(targetPath)
    }
  }, [isAuthenticated, isHydrated, isSubmitting, isRedirecting, user])

  const handleSubmit = async (data: LoginFormData & { rememberMe: boolean }) => {
    console.log('[AdminLogin] handleSubmit llamado con:', { email: data.email, rememberMe: data.rememberMe })
    setIsSubmitting(true)
    setLoginError(null)
    setIsRedirecting(false)
    
    try {
      console.log('[AdminLogin] Llamando a login()...')
      await login(data)
      console.log('[AdminLogin] login() completado exitosamente')

      // Limpiar error solo cuando el login es exitoso
      setLoginError(null)

      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })

      // Marcar que el login fue exitoso
      setLoginSuccess(true)
      
      // Esperar un momento para que el estado se actualice y el toast se muestre
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verificar que estamos en el cliente antes de acceder a window/storage
      if (typeof window === 'undefined') {
        console.warn('[AdminLogin] window no disponible, no se puede redirigir')
        setIsSubmitting(false)
        return
      }
      
      try {
        // Obtener el usuario directamente del storage para determinar la ruta de destino
        // Esto es más confiable que esperar a que Zustand se actualice
        const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        
        if (!userData || !token) {
          console.warn('[AdminLogin] No se encontró usuario o token en storage, esperando useEffect...', {
            hasUserData: !!userData,
            hasToken: !!token,
          })
          setIsSubmitting(false)
          return
        }
        
        // Parsear el usuario para verificar si tiene credenciales por defecto
        let parsedUser: { email?: string } | null = null
        try {
          parsedUser = JSON.parse(userData)
        } catch (e) {
          console.error('[AdminLogin] Error al parsear userData:', e)
        }
        
        // Determinar la ruta de destino basada en si tiene credenciales por defecto y su rol
        const tieneCredencialesPorDefecto = parsedUser?.email?.endsWith('@ministerio-amva.org')
        const yaCambioPassword = parsedUser?.hasChangedPassword === true
        const userRol = parsedUser?.rol
        
        let targetPath = '/admin'
        
        // Solo redirigir a setup-credentials si tiene email por defecto Y aún no ha cambiado su contraseña
        if (tieneCredencialesPorDefecto && !yaCambioPassword) {
          targetPath = '/admin/setup-credentials'
        } else if (userRol === 'EDITOR') {
          // EDITOR solo puede ver Noticias y Galería, redirigir a Noticias por defecto
          targetPath = '/admin/noticias'
        } else {
          // ADMIN y otros roles van al dashboard
          targetPath = '/admin'
        }
        
        console.log('[AdminLogin] Redirigiendo después de login exitoso', {
          hasToken: !!token,
          userEmail: parsedUser?.email,
          tieneCredencialesPorDefecto,
          targetPath,
          pathname: window.location.pathname,
        })
        
        // Forzar redirección a la ruta apropiada
        window.location.replace(targetPath)
      } catch (error) {
        console.error('[AdminLogin] Error al leer storage o redirigir:', error)
        setIsSubmitting(false)
      }
    } catch (error: unknown) {
      console.error('[AdminLogin] ❌ Error capturado en handleSubmit:', error)
      
      const errorObj = error as { response?: { status?: number; data?: { message?: string } }; message?: string; code?: string }
      const errorData = errorObj?.response?.data
      const errorStatus = errorObj?.response?.status
      const errorCode = errorObj?.code
      
      console.error('[AdminLogin] Detalles del error:', {
        message: errorObj?.message,
        status: errorStatus,
        code: errorCode,
        data: errorData,
      })
      
      let errorMessage = errorData?.message || errorObj?.message || 'Credenciales inválidas'

      // Mensaje más claro para credenciales incorrectas
      if (
        errorMessage.includes('Credenciales inválidas') ||
        errorMessage.includes('inválidas') ||
        errorMessage.includes('401') ||
        errorStatus === 401
      ) {
        errorMessage =
          'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.'
      }

      // Mensaje para errores de red
      if (
        errorMessage.includes('Network') ||
        errorMessage.includes('conexión') ||
        errorMessage.includes('conectar') ||
        errorMessage.includes('Timeout') ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'NETWORK_ERROR' ||
        !errorObj?.response
      ) {
        errorMessage =
          'No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo y accesible.'
      }

      console.error('[AdminLogin] Mensaje de error final:', errorMessage)
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
