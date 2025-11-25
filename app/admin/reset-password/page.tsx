'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (!token) {
      toast.error('Token inválido', {
        description: 'El enlace de recuperación no es válido',
      })
      router.push('/admin/forgot-password')
    }
  }, [token, router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token inválido')
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, data.password)
      setIsSuccess(true)
      toast.success('Contraseña restablecida', {
        description: 'Tu contraseña ha sido actualizada exitosamente',
      })
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'No se pudo restablecer la contraseña. El token puede haber expirado.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">¡Contraseña Restablecida!</CardTitle>
            <CardDescription>
              Tu contraseña ha sido actualizada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="size-4" />
              <AlertDescription>
                Serás redirigido al login en unos segundos...
              </AlertDescription>
            </Alert>
            <Link href="/admin/login">
              <Button className="w-full" size="lg">
                Ir al login ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto size-16 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary mb-4" />
          <CardTitle className="text-2xl font-bold">Nueva Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">{errors.confirmPassword.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="showPassword" className="text-sm font-normal cursor-pointer">
                Mostrar contraseña
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>

          <Link href="/admin/login">
            <Button variant="ghost" className="w-full" size="lg">
              <ArrowLeft className="mr-2 size-4" />
              Volver al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}





