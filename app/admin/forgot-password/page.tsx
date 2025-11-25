'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useState } from 'react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.requestPasswordReset(data.email)
      setIsSubmitted(true)
      toast.success('Email enviado', {
        description: response.message,
      })

      // En desarrollo, mostrar el link si está disponible
      if (response.resetUrl) {
        console.log('🔐 Reset URL:', response.resetUrl)
        toast.info('Link de recuperación (solo en desarrollo)', {
          description: response.resetUrl,
          duration: 10000,
        })
      }
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'No se pudo enviar el email de recuperación',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto size-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Enviado</CardTitle>
            <CardDescription>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
                El enlace expirará en 1 hora.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Link href="/admin/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 size-4" />
                  Volver al login
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Enviar otro email
              </Button>
            </div>
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
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <AlertDescription className="text-xs">{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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

          <p className="text-center text-xs text-muted-foreground">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/admin/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}





