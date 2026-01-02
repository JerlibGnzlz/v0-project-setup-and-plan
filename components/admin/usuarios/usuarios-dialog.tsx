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
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
      )
      .optional(),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    rol: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  })
  .refine(data => !data.password || data.password.length >= 8, {
    message: 'La contraseña es requerida al crear un usuario',
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
    },
  })

  const rol = watch('rol')

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
      })
    }
  }, [usuario, isCreating, reset])

  const handleFormSubmit = (data: UsuarioFormData) => {
    onSubmit({
      email: data.email,
      password: isCreating ? data.password : undefined,
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

          {isCreating && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Debe contener: mayúscula, minúscula, número y carácter especial (!@#$%^&*)
              </p>
            </div>
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

