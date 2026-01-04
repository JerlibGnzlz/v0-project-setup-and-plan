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
import { useChangePassword } from '@/lib/hooks/use-usuarios'
import Image from 'next/image'

const setupCredentialsSchema = z
  .object({
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

  const changePasswordMutation = useChangePassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupCredentialsFormData>({
    resolver: zodResolver(setupCredentialsSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      currentPassword: '',
    },
  })

  // Verificar si el usuario tiene credenciales por defecto
  // IMPORTANTE: Solo verificar una vez al cargar la página
  // No volver a verificar después de cambiar la contraseña
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      // Verificar si el email termina en @ministerio-amva.org Y si ya cambió su contraseña
      const tieneCredencialesPorDefecto = user.email?.endsWith('@ministerio-amva.org')
      const yaCambioPassword = (user as { hasChangedPassword?: boolean })?.hasChangedPassword === true

      // Solo mostrar setup-credentials si tiene email por defecto Y aún no ha cambiado su contraseña
      if (tieneCredencialesPorDefecto && !yaCambioPassword) {
        setNeedsSetup(true)
      } else {
        // Si ya cambió su contraseña o no tiene credenciales por defecto, redirigir según el rol
        const targetPath = user.rol === 'EDITOR' ? '/admin/noticias' : '/admin'
        router.push(targetPath)
      }
      setIsChecking(false)
    } else if (isHydrated && !isAuthenticated) {
      // Si no está autenticado, redirigir al login
      router.push('/admin/login')
    }
    // Solo ejecutar cuando cambian isHydrated o isAuthenticated
    // No incluir user ni router para evitar re-ejecuciones innecesarias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated])

  const onSubmit = async (data: SetupCredentialsFormData) => {
    try {
      // Solo cambiar la contraseña (el email se mantiene como está)
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.password,
      })

      // Después de cambiar la contraseña exitosamente, hacer logout y redirigir al login
      // Esto permite que el usuario inicie sesión con su nueva contraseña
      console.log('[SetupCredentials] Contraseña cambiada exitosamente, haciendo logout y redirigiendo al login')
      
      // Hacer logout para limpiar la sesión actual
      logout()
      
      // Esperar un momento para que el logout se complete
      setTimeout(() => {
        // Redirigir al login con un mensaje de éxito
        window.location.href = '/admin/login?passwordChanged=true'
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
              Configuración de Contraseña Requerida
            </CardTitle>
            <CardDescription className="mt-2">
              Has iniciado sesión con una contraseña temporal. Por favor, configura tu contraseña personalizada para continuar.
            </CardDescription>
            {user?.rol === 'EDITOR' && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Rol Editor:</strong> Tendrás acceso a Noticias y Galería Multimedia después de configurar tu contraseña.
                </p>
              </div>
            )}
            {user?.rol === 'ADMIN' && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                <p className="text-sm text-emerald-900 dark:text-emerald-100">
                  <strong>Rol Administrador:</strong> Tendrás acceso completo a todos los módulos después de configurar tu contraseña.
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Email de Acceso
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Tu email de acceso es: <strong className="font-mono">{user?.email}</strong>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Este email no se puede modificar. Solo puedes cambiar tu contraseña.
                  </p>
                </div>
              </div>
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
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
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
                <strong>⚠️ Importante:</strong> No podrás acceder al panel hasta que cambies tu contraseña temporal.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? 'Guardando...'
                : 'Guardar Contraseña y Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

