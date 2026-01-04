'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAdminResetPassword } from '@/lib/hooks/use-usuarios'
import type { Usuario } from '@/lib/api/usuarios'
import { toast } from 'sonner'

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario | null
}

const DEFAULT_PASSWORD = 'Cambiar123!'

export function ResetPasswordDialog({ open, onOpenChange, usuario }: ResetPasswordDialogProps) {
  const resetPasswordMutation = useAdminResetPassword()

  useEffect(() => {
    if (!open) {
      // Resetear estado cuando se cierra el dialog
    }
  }, [open])

  const handleReset = async () => {
    if (!usuario) return

    try {
      await resetPasswordMutation.mutateAsync({
        id: usuario.id,
        data: { newPassword: DEFAULT_PASSWORD },
      })
      
      // Mostrar mensaje informativo
      toast.success('Contraseña reseteada', {
        description: `La contraseña temporal ${DEFAULT_PASSWORD} ha sido establecida. El usuario deberá cambiarla al iniciar sesión.`,
        duration: 6000,
      })
      
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
            <Lock className="size-5" />
            Resetear Contraseña
          </DialogTitle>
          <DialogDescription>
            Se establecerá una contraseña temporal para <strong>{usuario?.nombre}</strong>. El usuario deberá cambiarla al iniciar sesión.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Contraseña Temporal
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Se establecerá la contraseña por defecto: <strong className="font-mono">{DEFAULT_PASSWORD}</strong>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  El usuario recibirá esta contraseña y deberá cambiarla por una personalizada al iniciar sesión por primera vez.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  ¿Qué pasará después?
                </p>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                  <li>El usuario iniciará sesión con: <strong className="font-mono">{DEFAULT_PASSWORD}</strong></li>
                  <li>Será redirigido automáticamente a configurar sus credenciales</li>
                  <li>Deberá cambiar tanto el email como la contraseña por valores personalizados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={resetPasswordMutation.isPending}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleReset} disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? 'Reseteando...' : 'Resetear a Contraseña Temporal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

