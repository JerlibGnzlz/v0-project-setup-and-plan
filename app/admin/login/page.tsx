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

  // Si ya está autenticado al cargar la página (no después de un login), redirigir
  // Este useEffect solo maneja casos donde el usuario ya estaba autenticado antes de llegar a esta página
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }
    
    // Solo redirigir si:
    // 1. Está hidratado
    // 2. Está autenticado
    // 3. NO estamos en proceso de login (isSubmitting = false)
    // 4. NO estamos ya redirigiendo (isRedirecting = false)
    // 5. NO acabamos de hacer login exitoso (loginSuccess = false) - esto evita conflicto con handleSubmit
    // 6. Estamos en la página de login
    if (
      isHydrated &&
      isAuthenticated &&
      !isSubmitting &&
      !isRedirecting &&
      !loginSuccess &&
      window.location.pathname === '/admin/login'
    ) {
      // Detectar credenciales por defecto: @ministerio-amva.org o @*-ministerio-amva.org
      const tieneCredencialesPorDefecto = 
        user?.email?.endsWith('@ministerio-amva.org') || 
        user?.email?.match(/@[a-z]+-ministerio-amva\.org$/) !== null
      
      const yaCambioPassword = (user as { hasChangedPassword?: boolean })?.hasChangedPassword === true
      const userRol = user?.rol
      
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
      
      setIsRedirecting(true)
      window.location.href = targetPath
    }
  }, [isAuthenticated, isHydrated, isSubmitting, isRedirecting, loginSuccess, user])

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

      // Marcar que el login fue exitoso
      setLoginSuccess(true)
      
      // Esperar un momento para que el estado se actualice y el toast se muestre
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Verificar que estamos en el cliente antes de acceder a window/storage
      if (typeof window === 'undefined') {
        console.warn('[AdminLogin] window no disponible, no se puede redirigir')
        setIsSubmitting(false)
        return
      }
      
      // Marcar que estamos redirigiendo para evitar múltiples redirecciones
      setIsRedirecting(true)
      
      try {
        // Obtener el usuario directamente del storage para determinar la ruta de destino
        // Esto es más confiable que esperar a que Zustand se actualice
        const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        
        if (!userData || !token) {
          console.error('[AdminLogin] ❌ No se encontró usuario o token en storage')
          setIsSubmitting(false)
          setIsRedirecting(false)
          toast.error('Error', {
            description: 'No se pudo guardar la sesión. Por favor, intenta nuevamente.',
          })
          return
        }
        
        // Parsear el usuario para verificar si tiene credenciales por defecto
        let parsedUser: { email?: string; hasChangedPassword?: boolean; rol?: string } | null = null
        try {
          parsedUser = JSON.parse(userData)
        } catch (e) {
          console.error('[AdminLogin] ❌ Error al parsear userData:', e)
          setIsSubmitting(false)
          setIsRedirecting(false)
          toast.error('Error', {
            description: 'Error al procesar los datos del usuario. Por favor, intenta nuevamente.',
          })
          return
        }
        
        // Determinar la ruta de destino basada en si tiene credenciales por defecto y su rol
        // Detectar credenciales por defecto: @ministerio-amva.org o @*-ministerio-amva.org
        const tieneCredencialesPorDefecto = 
          parsedUser?.email?.endsWith('@ministerio-amva.org') || 
          parsedUser?.email?.match(/@[a-z]+-ministerio-amva\.org$/) !== null
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
        
        // Forzar redirección a la ruta apropiada usando href para mejor compatibilidad
        window.location.href = targetPath
      } catch (error) {
        console.error('[AdminLogin] ❌ Error al leer storage o redirigir:', error)
        setIsSubmitting(false)
        setIsRedirecting(false)
        toast.error('Error', {
          description: 'Error al redirigir. Por favor, intenta nuevamente.',
        })
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
