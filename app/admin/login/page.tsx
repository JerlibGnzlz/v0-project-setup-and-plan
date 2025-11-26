'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function AdminLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Watch values to know if inputs have content
  const emailValue = watch('email')
  const passwordValue = watch('password')

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null)
    try {
      await login({ ...data, rememberMe })
      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })
      router.push('/admin')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Credenciales inválidas'
      setLoginError(errorMessage)
      toast.error('Error de autenticación', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a1628]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950/50 via-[#0a1628] to-emerald-950/30" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Card Container */}
      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

        {/* Main Card */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />

          {/* Card content */}
          <div className="p-8 sm:p-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {/* Logo glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/30 via-emerald-500/30 to-amber-500/30 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src="/mundo.png"
                  alt="Logo AMVA"
                  width={140}
                  height={140}
                  className="relative w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-2xl"
                  priority
                />
              </div>

              {/* Title with gradient */}
              <h1 className="mt-6 text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Asociación Misionera
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-white/80">
                Vida Abundante
              </h2>

              {/* Subtitle badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-white/60">Panel Administrativo</span>
              </div>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="p-1.5 rounded-full bg-rose-500/20">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-sm text-rose-300 pt-0.5">{loginError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field with Floating Label */}
              <div className="relative">
                {/* Input glow on focus */}
                <div className={cn(
                  "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 opacity-0 blur transition-opacity duration-300",
                  focusedField === 'email' && "opacity-50"
                )} />

                <div className="relative">
                  {/* Icon */}
                  <div className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 z-10",
                    focusedField === 'email' || emailValue
                      ? "bg-sky-500/20"
                      : "bg-white/5"
                  )}>
                    <Mail className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      focusedField === 'email' || emailValue ? "text-sky-400" : "text-white/40"
                    )} />
                  </div>

                  {/* Input */}
                  <input
                    id="email"
                    type="email"
                    className={cn(
                      "peer w-full h-14 pl-14 pr-4 pt-4 bg-white/5 border border-white/10 rounded-xl text-white",
                      "focus:bg-white/[0.07] focus:border-sky-500/50 focus:outline-none focus:ring-0",
                      "transition-all duration-300",
                      errors.email && "border-rose-500/50"
                    )}
                    placeholder=" "
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />

                  {/* Floating Label */}
                  <label
                    htmlFor="email"
                    className={cn(
                      "absolute left-14 transition-all duration-300 pointer-events-none",
                      "text-white/50",
                      // Floating state: when focused OR has value
                      focusedField === 'email' || emailValue
                        ? "top-2 text-xs text-sky-400 font-medium"
                        : "top-1/2 -translate-y-1/2 text-sm"
                    )}
                  >
                    Correo electrónico
                  </label>
                </div>

                {errors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-2 ml-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field with Floating Label */}
              <div className="relative">
                {/* Input glow on focus */}
                <div className={cn(
                  "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 blur transition-opacity duration-300",
                  focusedField === 'password' && "opacity-50"
                )} />

                <div className="relative">
                  {/* Icon */}
                  <div className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 z-10",
                    focusedField === 'password' || passwordValue
                      ? "bg-emerald-500/20"
                      : "bg-white/5"
                  )}>
                    <Lock className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      focusedField === 'password' || passwordValue ? "text-emerald-400" : "text-white/40"
                    )} />
                  </div>

                  {/* Input */}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={cn(
                      "peer w-full h-14 pl-14 pr-14 pt-4 bg-white/5 border border-white/10 rounded-xl text-white",
                      "focus:bg-white/[0.07] focus:border-emerald-500/50 focus:outline-none focus:ring-0",
                      "transition-all duration-300",
                      errors.password && "border-rose-500/50"
                    )}
                    placeholder=" "
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />

                  {/* Floating Label */}
                  <label
                    htmlFor="password"
                    className={cn(
                      "absolute left-14 transition-all duration-300 pointer-events-none",
                      "text-white/50",
                      // Floating state: when focused OR has value
                      focusedField === 'password' || passwordValue
                        ? "top-2 text-xs text-emerald-400 font-medium"
                        : "top-1/2 -translate-y-1/2 text-sm"
                    )}
                  >
                    Contraseña
                  </label>

                  {/* Eye toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 z-10",
                      "hover:bg-white/10 focus:outline-none focus:bg-white/10",
                      showPassword ? "bg-emerald-500/20" : "bg-transparent"
                    )}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-400 transition-colors duration-200" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/40 hover:text-white/60 transition-colors duration-200" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-2 ml-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className={cn(
                        "h-5 w-5 rounded-md border-2 border-white/20 bg-white/5",
                        "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-500",
                        "data-[state=checked]:border-amber-500",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                    Recordarme
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <div className="relative group">
                  {/* Button glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

                  <Button
                    type="submit"
                    className={cn(
                      "relative w-full h-12 rounded-xl font-semibold text-base",
                      "bg-gradient-to-r from-emerald-500 to-teal-500",
                      "hover:from-emerald-400 hover:to-teal-400",
                      "text-white shadow-lg shadow-emerald-500/25",
                      "transition-all duration-300 transform hover:scale-[1.02]",
                      "disabled:opacity-50 disabled:hover:scale-100"
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Iniciando sesión...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Iniciar Sesión
                        <svg
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-center text-xs text-white/30">
                Acceso restringido para administradores autorizados
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
      </div>
    </div>
  )
}
