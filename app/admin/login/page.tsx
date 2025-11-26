'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-emerald-50/50 to-amber-50/30 dark:from-sky-950/20 dark:via-emerald-950/10 dark:to-amber-950/5 p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-400/20 to-emerald-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-amber-400/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative border-sky-200/50 dark:border-sky-500/20 bg-white/80 dark:bg-background/80 backdrop-blur-xl shadow-2xl shadow-sky-500/10">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader className="space-y-1 text-center">
          <div className="relative mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-xl" />
            <Image
              src="/mundo.png"
              alt="Logo AMVA"
              width={160}
              height={160}
              className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 object-contain mb-4"
            />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
            Asociación Misionera Vida Abundante
          </CardTitle>
          <CardDescription>
            Panel Administrativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive" className="border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30">
              <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" />
              <AlertDescription className="text-rose-700 dark:text-rose-300">{loginError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sky-700 dark:text-sky-300">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sky-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@vidaabundante.org"
                  className="pl-9 border-sky-200 dark:border-sky-500/30 focus:border-sky-400 focus:ring-sky-400/20"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-700 dark:text-emerald-300">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 border-emerald-200 dark:border-emerald-500/30 focus:border-emerald-400 focus:ring-emerald-400/20"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{errors.password.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-amber-300 dark:border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer text-amber-700 dark:text-amber-300">
                  Recordarme
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Acceso restringido solo para administradores autorizados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
