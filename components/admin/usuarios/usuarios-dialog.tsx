'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shield, UserCheck, Eye } from 'lucide-react'
import type { Usuario, UserRole } from '@/lib/api/usuarios'

const usuarioSchema = z
  .object({
    email: z.string().email('El email debe ser válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .optional(),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    rol: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
    usarCredencialesPorDefecto: z.boolean().optional(),
  })
  .refine(data => !data.usarCredencialesPorDefecto || (data.email && data.password), {
    message: 'El email y contraseña son requeridos cuando se usan credenciales por defecto',
    path: ['password'],
  })

type UsuarioFormData = z.infer<typeof usuarioSchema>

interface UsuariosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario | null
  isCreating: boolean
  onSubmit: (data: {
    email: string
    password?: string
    nombre: string
    rol: UserRole
  }) => void
  isLoading: boolean
}

export function UsuariosDialog({
  open,
  onOpenChange,
  usuario,
  isCreating,
  onSubmit,
  isLoading,
}: UsuariosDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      rol: 'EDITOR',
      usarCredencialesPorDefecto: false,
    },
  })

  const rol = watch('rol')
  const usarCredencialesPorDefecto = watch('usarCredencialesPorDefecto')

  useEffect(() => {
    if (usuario && !isCreating) {
      reset({
        email: usuario.email,
        password: undefined, // No mostrar contraseña al editar
        nombre: usuario.nombre,
        rol: usuario.rol,
      })
    } else {
      reset({
        email: '',
        password: '',
        nombre: '',
        rol: 'EDITOR',
        usarCredencialesPorDefecto: false,
      })
    }
  }, [usuario, isCreating, reset])

  const handleFormSubmit = (data: UsuarioFormData) => {
    // Si se usan credenciales por defecto, generar email y password automáticos
    let emailFinal = data.email
    let passwordFinal = data.password

    if (isCreating && data.usarCredencialesPorDefecto) {
      // Generar email por defecto basado en el nombre
      const nombreLimpio = data.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)
      emailFinal = `${nombreLimpio}@ministerio-amva.org`
      passwordFinal = 'Cambiar123!' // Contraseña por defecto simple pero segura
      
      // Actualizar el campo email en el formulario para mostrarlo
      setValue('email', emailFinal)
    }

    onSubmit({
      email: emailFinal || data.email,
      password: isCreating ? (passwordFinal || data.password) : undefined,
      nombre: data.nombre,
      rol: data.rol,
    })
  }

  const rolOptions: { value: UserRole; label: string; icon: any; description: string }[] = [
    {
      value: 'ADMIN',
      label: 'Administrador',
      icon: Shield,
      description: 'Acceso completo a todos los módulos',
    },
    {
      value: 'EDITOR',
      label: 'Editor',
      icon: UserCheck,
      description: 'Acceso a Noticias y Galería Multimedia',
    },
    {
      value: 'VIEWER',
      label: 'Visualizador',
      icon: Eye,
      description: 'Solo lectura (próximamente)',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Crear Usuario' : 'Editar Usuario'}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Crea un nuevo usuario para acceder al panel administrativo'
              : 'Modifica la información del usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Nombre completo"
              disabled={isLoading}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="usuario@ejemplo.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={usarCredencialesPorDefecto ? "Se generará automáticamente" : "usuario@ejemplo.com"}
              disabled={isLoading || usarCredencialesPorDefecto}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {isCreating && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usarCredencialesPorDefecto"
                  {...register('usarCredencialesPorDefecto')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="usarCredencialesPorDefecto" className="text-sm font-normal cursor-pointer">
                  Usar credenciales por defecto (email y contraseña temporales)
                </Label>
              </div>
              {usarCredencialesPorDefecto && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Credenciales por defecto:</strong>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Se generará automáticamente un email basado en el nombre (ej: nombre@ministerio-amva.org) y una contraseña temporal (Cambiar123!).
                    El usuario deberá cambiar ambas credenciales al iniciar sesión por primera vez.
                  </p>
                </div>
              )}
              {!usarCredencialesPorDefecto && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    La contraseña puede ser simple. El usuario deberá cambiarla al iniciar sesión.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select
              value={rol}
              onValueChange={(value: UserRole) => setValue('rol', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {rolOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-sm text-destructive">{errors.rol.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isCreating ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

