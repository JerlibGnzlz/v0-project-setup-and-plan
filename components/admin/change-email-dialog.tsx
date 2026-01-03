'use client'

import { useState, useEffect } from 'react'
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
import { Mail, Eye, EyeOff } from 'lucide-react'
import { useChangeEmail } from '@/lib/hooks/use-usuarios'

const changeEmailSchema = z.object({
  newEmail: z.string().email('El email debe ser válido'),
  password: z.string().min(1, 'La contraseña es requerida para confirmar el cambio'),
})

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

interface ChangeEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const changeEmailMutation = useChangeEmail()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      password: '',
    },
  })

  // Limpiar el formulario cuando el diálogo se cierra
  useEffect(() => {
    if (!open) {
      reset()
      setShowPassword(false)
    }
  }, [open, reset])

  const handleCancel = () => {
    onOpenChange(false)
  }

  const onSubmit = async (data: ChangeEmailFormData) => {
    try {
      await changeEmailMutation.mutateAsync({
        newEmail: data.newEmail,
        password: data.password,
      })
      
      reset()
      setShowPassword(false)
      onOpenChange(false)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Cambiar Email
          </DialogTitle>
          <DialogDescription>
            Ingresa tu nuevo email y tu contraseña actual para confirmar el cambio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail">Email Actual</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">Nuevo Email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="nuevo@ejemplo.com"
              {...register('newEmail')}
              disabled={changeEmailMutation.isPending}
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive">{errors.newEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña actual"
                {...register('password')}
                disabled={changeEmailMutation.isPending}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
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
              Necesitamos tu contraseña para confirmar el cambio de email.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={changeEmailMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={changeEmailMutation.isPending}>
              {changeEmailMutation.isPending ? 'Cambiando...' : 'Cambiar Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

