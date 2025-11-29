'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2, User } from 'lucide-react'
import { usePastorAuth } from '@/lib/hooks/use-pastor-auth'
import { pastorAuthApi } from '@/lib/api/pastor-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Step1AuthProps {
  onComplete: (userData?: any) => void
  onBack: () => void
}

export function Step1Auth({ onComplete, onBack }: Step1AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login: loginPastor, checkAuth } = usePastorAuth()

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
      await loginPastor({ email: data.email, password: data.password })
      // Verificar el estado actualizado
      checkAuth()
      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })
      // Esperar un momento para que el estado se actualice completamente
      setTimeout(() => {
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
      await pastorAuthApi.registerComplete({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        sede: data.sede,
        telefono: data.telefono,
      })
      
      toast.success('Cuenta creada exitosamente', {
        description: 'Por favor, inicia sesión con tus credenciales',
      })
      
      // Cambiar a la pestaña de login después del registro
      setActiveTab('login')
      
      // Pre-llenar el email en el formulario de login
      setLoginValue('email', data.email)
    } catch (error: any) {
      console.error('Error en registro:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la cuenta'
      toast.error('Error de registro', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
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

