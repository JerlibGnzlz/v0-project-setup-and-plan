'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Chrome, Mail, Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  const handleGoogleLogin = () => {
    toast.info('Login con Google próximamente disponible')
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Sesión iniciada correctamente')
      router.push('/admin')
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.response?.data?.message || 'Credenciales inválidas'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto size-16 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary mb-4" />
          <CardTitle className="text-2xl font-bold">Panel Administrativo</CardTitle>
          <CardDescription>
            Convención Nacional Argentina 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 size-5" />
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@vidaabundante.org"
                  className="pl-9"
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
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                Recordar sesión
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/admin/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Acceso restringido solo para administradores autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
