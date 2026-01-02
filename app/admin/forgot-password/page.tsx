'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { useForgotPassword } from '@/lib/hooks/use-password'
import Image from 'next/image'

const forgotPasswordSchema = z.object({
  email: z.string().email('El email debe ser válido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const forgotPasswordMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email)
      setIsSubmitted(true)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/amvadigital.png" alt="AMVA Digital" width={120} height={120} className="object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className="mt-2">
              {isSubmitted
                ? 'Revisa tu correo electrónico para continuar'
                : 'Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-emerald-500/10">
                  <Mail className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Email enviado</h3>
                <p className="text-sm text-muted-foreground">
                  Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
                  Revisa tu bandeja de entrada y spam.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={() => router.push('/admin/login')} className="w-full">
                  Volver al Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Enviar otro email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  disabled={forgotPasswordMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="size-4 mr-2" />
                    Enviar Instrucciones
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" />
                  Volver al login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

