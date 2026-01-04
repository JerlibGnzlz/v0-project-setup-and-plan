'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useChangeEmail, useChangePassword } from '@/lib/hooks/use-usuarios'
import Image from 'next/image'

const setupCredentialsSchema = z
  .object({
    email: z.string().email('El email debe ser válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
      ),
    confirmPassword: z.string(),
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type SetupCredentialsFormData = z.infer<typeof setupCredentialsSchema>

export default function SetupCredentialsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated, logout } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  const changeEmailMutation = useChangeEmail()
  const changePasswordMutation = useChangePassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SetupCredentialsFormData>({
    resolver: zodResolver(setupCredentialsSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      currentPassword: '',
    },
  })

  // Verificar si el usuario tiene credenciales por defecto
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      // Verificar si el email termina en @ministerio-amva.org
      const tieneCredencialesPorDefecto = user.email?.endsWith('@ministerio-amva.org')
      
      if (tieneCredencialesPorDefecto) {
        setNeedsSetup(true)
        // NO pre-llenar el email - el usuario debe ingresar uno nuevo
        // setValue('email', '') // Dejar vacío para que el usuario ingrese uno nuevo
      } else {
        // Si no necesita setup, redirigir al dashboard
        router.push('/admin')
      }
      setIsChecking(false)
    } else if (isHydrated && !isAuthenticated) {
      // Si no está autenticado, redirigir al login
      router.push('/admin/login')
    }
  }, [isHydrated, isAuthenticated, user, router])

  const onSubmit = async (data: SetupCredentialsFormData) => {
    try {
      // Cambiar email primero
      if (data.email !== user?.email) {
        await changeEmailMutation.mutateAsync({
          newEmail: data.email,
          password: data.currentPassword,
        })
      }

      // Cambiar contraseña usando el endpoint de usuarios (consistente con changeEmail)
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.password,
      })

      // Cerrar sesión para limpiar tokens antiguos y estado del usuario
      logout()

      // Limpiar también el storage manualmente para asegurar que no quede nada
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_refresh_token')
        sessionStorage.removeItem('auth_user')
      }

      // Mostrar mensaje de éxito y redirigir al login
      // Usar window.location.href para forzar recarga completa y limpiar todo el estado
      setTimeout(() => {
        window.location.href = '/admin/login?credentialsUpdated=true'
      }, 500)
    } catch (error) {
      // Error ya manejado en los hooks
    }
  }

  if (isChecking || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-sky-500 border-r-emerald-500 border-b-amber-500"></div>
        </div>
      </div>
    )
  }

  if (!needsSetup) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/amvadigital.png" alt="AMVA Digital" width={120} height={120} className="object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <AlertCircle className="size-6 text-amber-500" />
              Configuración de Credenciales Requerida
            </CardTitle>
            <CardDescription className="mt-2">
              Has iniciado sesión con credenciales temporales. Por favor, configura tu email y contraseña personalizados para continuar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4" />
                Nuevo Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@ejemplo.com"
                {...register('email')}
                disabled={changeEmailMutation.isPending || changePasswordMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Este será tu nuevo email para iniciar sesión. Debe ser diferente al email temporal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2">
                <Lock className="size-4" />
                Contraseña Actual (Temporal)
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Cambiar123!"
                  {...register('currentPassword')}
                  disabled={changeEmailMutation.isPending || changePasswordMutation.isPending}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ingresa la contraseña temporal que recibiste: <strong>Cambiar123!</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password')}
                  disabled={changeEmailMutation.isPending || changePasswordMutation.isPending}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Debe contener: mayúscula, minúscula, número y carácter especial (!@#$%^&*)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  {...register('confirmPassword')}
                  disabled={changeEmailMutation.isPending || changePasswordMutation.isPending}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>⚠️ Importante:</strong> No podrás acceder al panel hasta que cambies tus credenciales.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={changeEmailMutation.isPending || changePasswordMutation.isPending}
            >
              {changeEmailMutation.isPending || changePasswordMutation.isPending
                ? 'Guardando...'
                : 'Guardar Credenciales y Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

