'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2, User } from 'lucide-react'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { invitadoAuthApi } from '@/lib/api/invitado-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface Step1AuthProps {
  onComplete: (userData?: any) => void
  onBack: () => void
}

export function Step1Auth({ onComplete, onBack }: Step1AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login, registerInvitado, checkAuth } = useUnifiedAuth()
  const searchParams = useSearchParams()

  // Manejar callback de Google OAuth
  useEffect(() => {
    const token = searchParams?.get('token')
    const refreshToken = searchParams?.get('refresh_token')
    const isGoogle = searchParams?.get('google')
    const error = searchParams?.get('error')
    
    if (error) {
      toast.error('Error en la autenticación', {
        description: 'No se pudo completar el inicio de sesión con Google',
      })
      return
    }
    
    if (token && isGoogle === 'true') {
      // Guardar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('invitado_token', token)
        if (refreshToken) {
          localStorage.setItem('invitado_refresh_token', refreshToken)
        }
        
        // Obtener información completa del usuario desde el backend (incluyendo foto)
        const fetchProfile = async () => {
          try {
            const profile = await invitadoAuthApi.getProfile()
            
            // Guardar perfil completo con foto
            localStorage.setItem('invitado_user', JSON.stringify({
              ...profile,
              tipo: 'INVITADO',
            }))
            
            checkAuth()
          } catch (error) {
            console.error('Error obteniendo perfil:', error)
            // Si falla, usar checkAuth que lee del token
            checkAuth()
          }
        }
        
        fetchProfile()
        
        toast.success('¡Bienvenido!', {
          description: 'Has iniciado sesión con Google correctamente',
        })
        
        setTimeout(() => {
          onComplete()
        }, 800) // Dar más tiempo para obtener el perfil
      }
    }
  }, [searchParams, checkAuth, onComplete])

  const handleGoogleAuth = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    window.location.href = `${backendUrl}/auth/invitado/google`
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
      
      // Esperar un momento para que el estado se actualice completamente
      setTimeout(() => {
        checkAuth() // Refrescar el estado
        onComplete()
      }, 300)
    } catch (error: any) {
      console.error('Error en login:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Credenciales inválidas'
      toast.error('Error de autenticación', {
        description: errorMessage,
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

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Google OAuth Button - Principal */}
        <div className="mb-6">
          <Button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-white/90 text-gray-900 font-semibold py-6 text-base shadow-lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
            Continuar con Google
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

