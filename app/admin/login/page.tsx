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
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

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

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Recordarme
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
