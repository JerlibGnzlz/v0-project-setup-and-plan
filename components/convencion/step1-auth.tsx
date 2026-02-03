'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  User,
  LogOut,
} from 'lucide-react'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { useQueryClient } from '@tanstack/react-query'
import { invitadoAuthApi } from '@/lib/api/invitado-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

interface Step1AuthProps {
  onComplete: (userData?: any) => void | Promise<void>
  onBack: () => void
}

export function Step1Auth({ onComplete, onBack }: Step1AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasShownUserInfo, setHasShownUserInfo] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isCheckingInscripcion, setIsCheckingInscripcion] = useState(false) // Estado para verificar inscripción
  const [forceUpdate, setForceUpdate] = useState(0) // Forzar re-renderizado
  const [imageError, setImageError] = useState(false) // Estado para manejar errores de imagen
  const googleAuthProcessed = useRef(false) // Bandera para evitar múltiples toasts de Google
  const { login, registerInvitado, checkAuth, logout, user, isAuthenticated } = useUnifiedAuth()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Verificar autenticación al montar el componente y cuando cambian los searchParams
  useEffect(() => {
    checkAuth()
  }, [checkAuth, searchParams])

  // Manejar callback de Google OAuth
  useEffect(() => {
    const token = searchParams?.get('token')
    const refreshToken = searchParams?.get('refresh_token')
    const isGoogle = searchParams?.get('google')
    const error = searchParams?.get('error')

    if (error) {
      // Mensajes de error más específicos según el tipo de error
      let errorMessage = 'No se pudo completar el inicio de sesión con Google'
      let errorTitle = 'Error en la autenticación'

      switch (error) {
        case 'google_auth_email_error':
          errorTitle = 'Error con el email'
          errorMessage =
            'No se pudo obtener o validar el email de tu cuenta de Google. Por favor, intenta nuevamente.'
          break
        case 'google_auth_token_error':
          errorTitle = 'Error al generar tokens'
          errorMessage =
            'No se pudieron generar los tokens de autenticación. Por favor, intenta nuevamente.'
          break
        case 'google_auth_failed':
        default:
          errorTitle = 'Error en la autenticación'
          errorMessage =
            'No se pudo completar el inicio de sesión con Google. Por favor, intenta nuevamente.'
          break
      }

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      })

      // Limpiar parámetros de error de la URL
      setTimeout(() => {
        router.replace(window.location.pathname)
      }, 100)

      return
    }

    if (token && isGoogle === 'true' && !googleAuthProcessed.current) {
      // Marcar como procesado inmediatamente para evitar múltiples ejecuciones
      googleAuthProcessed.current = true

      // Guardar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('invitado_token', token)
        if (refreshToken) {
          localStorage.setItem('invitado_refresh_token', refreshToken)
        }

        // Obtener el perfil inmediatamente después de guardar el token
        // Esto asegura que el usuario se muestre correctamente en la vista de bienvenida
        const processGoogleAuth = async () => {
          try {
            console.log('[Step1Auth] Obteniendo perfil después del callback de Google...')
            const profile = await invitadoAuthApi.getProfile()

            console.log('[Step1Auth] Perfil obtenido exitosamente:', {
              id: profile.id,
              email: profile.email,
              fotoUrl: profile.fotoUrl,
            })

            // Guardar perfil completo con foto
            const userData = {
              ...profile,
              tipo: 'INVITADO',
            }
            localStorage.setItem('invitado_user', JSON.stringify(userData))

            // Invalidar queries de React Query para que se refetch automáticamente
            queryClient.invalidateQueries({ queryKey: ['invitado', 'profile'] })
            queryClient.invalidateQueries({ queryKey: ['checkInscripcion'] })

            // Actualizar el estado con el perfil completo
            checkAuth()

            // Forzar re-renderizado para asegurar que la vista de bienvenida se muestre
            setForceUpdate(prev => prev + 1)

            // Esperar un momento para que el estado se actualice y las queries se completen
            await new Promise(resolve => setTimeout(resolve, 800))

            // Llamar a onComplete para avanzar al siguiente paso
            console.log('[Step1Auth] Llamando a onComplete para avanzar al siguiente paso...')
            await onComplete(userData)

            // Limpiar parámetros de la URL DESPUÉS de actualizar el estado
            router.replace(window.location.pathname)

            // Mostrar toast solo una vez
            toast.success('¡Bienvenido!', {
              description: 'Has iniciado sesión con Google correctamente',
            })
          } catch (error: unknown) {
            console.error('[Step1Auth] Error obteniendo perfil después del callback:', error)
            const errorDetails = error && typeof error === 'object' && 'response' in error
              ? {
                status: (error as { response?: { status?: number } }).response?.status,
                data: (error as { response?: { data?: unknown } }).response?.data,
              }
              : {}
            console.error('[Step1Auth] Error details:', errorDetails)

            // Aún así, actualizar el estado con el token disponible
            checkAuth()

            // Intentar avanzar aunque falle el perfil
            try {
              await onComplete()
            } catch (onCompleteError) {
              console.error('[Step1Auth] Error llamando a onComplete:', onCompleteError)
            }

            // Limpiar URL incluso si falla el perfil
            router.replace(window.location.pathname)

            // Mostrar toast solo una vez (incluso en caso de error)
            toast.success('¡Bienvenido!', {
              description: 'Has iniciado sesión con Google correctamente',
            })
          }
        }

        // Ejecutar inmediatamente sin delay para procesar más rápido
        processGoogleAuth()
      }
    }

    // Resetear el flag si no hay token de Google en la URL (para permitir nuevo login)
    if (!token || isGoogle !== 'true') {
      googleAuthProcessed.current = false
    }
  }, [searchParams, checkAuth, onComplete])

  const handleGoogleAuth = () => {
    setIsLoadingGoogle(true)
    // API URL: env > derivar de SITE_URL > derivar de origin > localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const backendUrl =
      apiUrl ||
      (siteUrl ? `${siteUrl.replace(/\/$/, '')}/api` : '') ||
      (origin && !origin.includes('localhost') ? `${origin}/api` : '') ||
      'http://localhost:4000/api'
    // Pequeño delay para mostrar el estado de carga antes de redirigir
    setTimeout(() => {
      window.location.href = `${backendUrl}/auth/invitado/google`
    }, 100)
  }

  const handleLogout = async () => {
    try {
      // Cerrar sesión en el hook de autenticación (invalida token en backend y limpia storage)
      await logout()

      // Limpiar también cualquier parámetro de URL que pueda tener tokens
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('refresh_token')
        url.searchParams.delete('google')
        window.history.replaceState({}, '', url.pathname)
      }

      // Mostrar toast de éxito
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente',
      })

      // Redirigir a la landing page (página principal)
      // Usar window.location.href para forzar una navegación completa y limpiar todo el estado
      window.location.href = '/'
    } catch (error) {
      // Aún así continuar aunque haya error
      console.warn('[Step1Auth] Error en logout:', error)
      // Redirigir a la landing page incluso si hay error
      window.location.href = '/'
    }
  }

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
    watch: watchLogin,
    setValue: setLoginValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: errorsRegister, isSubmitting: isSubmittingRegister },
    watch: watchRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const emailLogin = watchLogin('email')
  const passwordLogin = watchLogin('password')
  const emailRegister = watchRegister('email')
  const passwordRegister = watchRegister('password')
  const nombreRegister = watchRegister('nombre')
  const apellidoRegister = watchRegister('apellido')

  const onLogin = async (data: LoginFormData) => {
    try {
      // Usar login unificado que busca en admins, pastores e invitados
      await login(data.email, data.password)

      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })

      // Invalidar queries de React Query para que se refetch automáticamente
      queryClient.invalidateQueries({ queryKey: ['invitado', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['checkInscripcion'] })

      // Avanzar al siguiente paso
      onComplete()
    } catch (error: any) {
      // Extraer mensaje de error de forma robusta
      // El backend usa el formato: { success: false, error: { message: "...", statusCode: 401, error: "Unauthorized" } }
      let errorMessage = 'No pudimos iniciar sesión. Por favor, verifica tus credenciales.'

      // Prioridad 1: Si el error ya tiene un mensaje claro (del unified-auth.ts que ya procesó el error), usarlo
      // El mensaje ya viene procesado desde unified-auth.ts, así que tiene prioridad
      if (
        error.message &&
        error.message !== 'Request failed with status code 401' &&
        error.message !== 'Network Error' &&
        !error.message.includes('status code')
      ) {
        errorMessage = error.message
      }
      // Prioridad 2: Extraer del response del backend (fallback)
      else if (error.response?.data) {
        const responseData = error.response.data

        // Formato del GlobalExceptionFilter: { success: false, error: { message: "...", ... } }
        if (responseData.error?.message) {
          errorMessage = responseData.error.message
        }
        // Formato alternativo: { message: "..." }
        else if (responseData.message) {
          errorMessage =
            typeof responseData.message === 'string'
              ? responseData.message
              : Array.isArray(responseData.message)
                ? responseData.message.join(', ')
                : errorMessage
        }
        // Formato string directo
        else if (typeof responseData === 'string') {
          errorMessage = responseData
        }
      }

      // Mostrar el toast con el mensaje
      toast.error('Error de autenticación', {
        description: errorMessage,
        duration: 5000,
      })
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    try {
      // Usar el endpoint de invitados - esto crea en tabla 'invitados', NO en 'pastores'
      await registerInvitado({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        sede: data.sede,
        telefono: data.telefono,
      })

      // Invalidar queries de React Query para que se refetch automáticamente
      queryClient.invalidateQueries({ queryKey: ['invitado', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['checkInscripcion'] })

      // El hook ya muestra el toast de éxito
      // Cambiar a la pestaña de login después del registro
      setActiveTab('login')

      // Pre-llenar el email en el formulario de login
      setLoginValue('email', data.email)
    } catch (error: any) {
      // El hook ya maneja el error y muestra el toast
      console.error('Error en registro:', error)
    }
  }

  // Función helper para normalizar URLs de Google
  const normalizeGoogleImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined

    // Si es una URL de Google, normalizarla para obtener mejor calidad
    if (url.includes('googleusercontent.com')) {
      try {
        const urlObj = new URL(url)

        // Remover todos los parámetros de tamaño existentes
        urlObj.searchParams.delete('sz')
        urlObj.searchParams.delete('s')

        // Agregar parámetro para tamaño más grande (200px) sin recorte
        // s200 = tamaño 200px, sin -c para mantener proporción
        urlObj.searchParams.set('s', '200')

        return urlObj.toString()
      } catch (e) {
        // Si falla el parsing, intentar método simple
        // Remover parámetros existentes después del último =
        const baseUrl = url.split('?')[0] || url.split('=')[0]
        // Agregar parámetro de tamaño
        return `${baseUrl}?sz=200`
      }
    }

    return url
  }

  // Resetear el estado de error de imagen cuando cambia el usuario o la foto
  useEffect(() => {
    if (user?.fotoUrl) {
      setImageError(false)
    }
  }, [user?.fotoUrl])

  // Si el usuario está autenticado con Google, mostrar información y avanzar automáticamente
  useEffect(() => {
    if (isAuthenticated && user && !hasShownUserInfo) {
      console.log('[Step1Auth] Usuario autenticado detectado, mostrando vista de bienvenida')
      // Marcar que ya mostramos la información del usuario
      setHasShownUserInfo(true)

      // Avanzar automáticamente al formulario después de 5 segundos
      // Esto da tiempo suficiente para que el usuario vea su información
      const timer = setTimeout(() => {
        console.log('[Step1Auth] Avanzando automáticamente después de 5 segundos')
        onComplete()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, hasShownUserInfo, onComplete])

  // Si el usuario está autenticado con Google, mostrar información profesional y botón de logout
  // Verificar también si hay token en localStorage para mostrar la vista inmediatamente después del callback
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('invitado_token')
  const shouldShowWelcome = isAuthenticated && user && (user.fotoUrl || hasToken)

  if (shouldShowWelcome) {
    console.log('[Step1Auth] Mostrando vista de bienvenida:', {
      isAuthenticated,
      hasUser: !!user,
      hasFotoUrl: !!user?.fotoUrl,
      hasToken: !!hasToken,
    })
    return (
      <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 animate-pulse" />

          {/* Contenido */}
          <div className="relative z-10">
            {/* Información del usuario autenticado */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-5">
                {/* Avatar con animación */}
                <div className="relative group">
                  {/* Anillo de pulso */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />

                  {/* Avatar */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/60 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    {user.fotoUrl && !imageError ? (
                      <img
                        src={normalizeGoogleImageUrl(user.fotoUrl) || user.fotoUrl}
                        alt={`${user.nombre} ${user.apellido}`}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={e => {
                          console.error('[Step1Auth] ❌ Error cargando foto:', {
                            originalUrl: user.fotoUrl,
                            normalizedUrl: normalizeGoogleImageUrl(user.fotoUrl),
                            error: e,
                          })
                          setImageError(true)
                        }}
                        onLoad={() => {
                          console.log('[Step1Auth] ✅ Foto cargada exitosamente:', {
                            originalUrl: user.fotoUrl,
                            normalizedUrl: normalizeGoogleImageUrl(user.fotoUrl),
                          })
                          setImageError(false)
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.nombre?.[0]?.toUpperCase() || 'U'}
                        {user.apellido?.[0]?.toUpperCase() || ''}
                      </div>
                    )}
                  </div>

                  {/* Badge de verificación */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full p-2 shadow-lg ring-2 ring-white/20">
                    <CheckCircle2 className="size-5 text-white" />
                  </div>
                </div>

                {/* Información del usuario */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    ¡Bienvenido, {user.nombre}!
                  </h3>
                  <p className="text-sm text-white/70 font-medium">{user.email}</p>

                  {/* Badge de Google */}
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-white">Autenticado con Google</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de avance automático con barra de progreso mejorada */}
            <div className="mb-6 text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/90">
                  Redirigiendo automáticamente al formulario...
                </p>
                <p className="text-xs text-white/50">Serás redirigido en unos segundos</p>
              </div>

              {/* Barra de progreso animada */}
              <div className="relative w-full bg-white/10 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-[5000ms] ease-linear shadow-lg"
                  style={{
                    width: '100%',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              {/* Botón principal para continuar */}
              <Button
                type="button"
                onClick={async () => {
                  console.log(
                    '[Step1Auth] Botón continuar clickeado, verificando inscripción antes de avanzar...'
                  )
                  setIsCheckingInscripcion(true)
                  try {
                    // Llamar onComplete que ahora verificará la inscripción existente antes de avanzar
                    await onComplete()
                  } finally {
                    setIsCheckingInscripcion(false)
                  }
                }}
                disabled={isCheckingInscripcion}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-6 text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {isCheckingInscripcion ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando inscripción...
                    </>
                  ) : (
                    <>
                      Continuar con la inscripción
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </Button>

              {/* Botón secundario para cerrar sesión */}
              <Button
                type="button"
                onClick={handleLogout}
                variant="outline"
                className="w-full border-white/30 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white font-medium py-5 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Usar otra cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Google OAuth Button - Principal - Diseño Profesional */}
        <div className="mb-6">
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoadingGoogle}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-7 text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-200/50 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {/* Efecto de brillo al hover */}
            {!isLoadingGoogle && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <span className="relative flex items-center justify-center gap-3">
              {isLoadingGoogle ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Conectando con Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/5 text-white/60">o</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              activeTab === 'login'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            )}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              activeTab === 'register'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            )}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
            <div>
              <Label htmlFor="email-login" className="text-white/90 mb-2 block">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email-login"
                  type="email"
                  placeholder="tu@email.com"
                  className={cn(
                    'pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsLogin.email && 'border-red-500'
                  )}
                  {...registerLogin('email')}
                />
                {emailLogin && !errorsLogin.email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errorsLogin.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsLogin.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password-login" className="text-white/90 mb-2 block">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    'pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsLogin.password && 'border-red-500'
                  )}
                  {...registerLogin('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errorsLogin.password && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsLogin.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmittingLogin ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleSubmitRegister(onRegister)} className="space-y-4">
            <p className="text-xs text-white/50 text-center mb-4">
              O continúa con tu email para crear una cuenta
            </p>
            <div>
              <Label htmlFor="nombre-register" className="text-white/90 mb-2 block">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="nombre-register"
                  type="text"
                  placeholder="Tu nombre"
                  className={cn(
                    'pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsRegister.nombre && 'border-red-500'
                  )}
                  {...registerRegister('nombre')}
                />
                {nombreRegister && !errorsRegister.nombre && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errorsRegister.nombre && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.nombre.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="apellido-register" className="text-white/90 mb-2 block">
                Apellido
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="apellido-register"
                  type="text"
                  placeholder="Tu apellido"
                  className={cn(
                    'pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsRegister.apellido && 'border-red-500'
                  )}
                  {...registerRegister('apellido')}
                />
                {apellidoRegister && !errorsRegister.apellido && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errorsRegister.apellido && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.apellido.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email-register" className="text-white/90 mb-2 block">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email-register"
                  type="email"
                  placeholder="tu@email.com"
                  className={cn(
                    'pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsRegister.email && 'border-red-500'
                  )}
                  {...registerRegister('email')}
                />
                {emailRegister && !errorsRegister.email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errorsRegister.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password-register" className="text-white/90 mb-2 block">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password-register"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres (mayúscula, minúscula y número)"
                  className={cn(
                    'pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errorsRegister.password && 'border-red-500'
                  )}
                  {...registerRegister('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errorsRegister.password && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sede-register" className="text-white/90 mb-2 block">
                Iglesia / Sede (Opcional)
              </Label>
              <Input
                id="sede-register"
                type="text"
                placeholder="Nombre de tu iglesia o sede"
                className={cn(
                  'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                  errorsRegister.sede && 'border-red-500'
                )}
                {...registerRegister('sede')}
              />
              {errorsRegister.sede && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.sede.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telefono-register" className="text-white/90 mb-2 block">
                Teléfono (Opcional)
              </Label>
              <Input
                id="telefono-register"
                type="tel"
                placeholder="Tu número de teléfono"
                className={cn(
                  'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                  errorsRegister.telefono && 'border-red-500'
                )}
                {...registerRegister('telefono')}
              />
              {errorsRegister.telefono && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errorsRegister.telefono.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmittingRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmittingRegister ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>
        )}

        {/* Back Button */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full text-white/70 hover:text-white hover:bg-white/5"
          >
            ← Volver
          </Button>
        </div>
      </div>
    </div>
  )
}
