'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useSetAdminPin } from '@/lib/hooks/use-usuarios'

interface SetupAdminPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SetupAdminPinDialog({
  open,
  onOpenChange,
  onSuccess,
}: SetupAdminPinDialogProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setPinMutation = useSetAdminPin()
  const queryClient = useQueryClient()
  const pinInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPin('')
      setConfirmPin('')
      setError(null)
      // Focus en el input cuando se abre el diálogo
      setTimeout(() => {
        pinInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('El PIN debe ser exactamente 4 dígitos numéricos')
      return
    }

    if (pin !== confirmPin) {
      setError('Los PINs no coinciden')
      return
    }

    try {
      await setPinMutation.mutateAsync(pin)
      // Invalidar query para refrescar el estado
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'has-admin-pin'] })
      onSuccess?.()
      onOpenChange(false)
      setPin('')
      setConfirmPin('')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al establecer PIN'
      setError(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Configurar PIN de Administrador
          </DialogTitle>
          <DialogDescription>
            Establece un PIN de 4 dígitos para proteger acciones críticas (editar, resetear contraseña, eliminar usuarios).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  ¿Qué es el PIN de Administrador?
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Este PIN se solicitará cada vez que intentes realizar acciones críticas como editar usuarios, resetear contraseñas o eliminar usuarios. Es una capa adicional de seguridad.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN de 4 Dígitos</Label>
            <Input
              ref={pinInputRef}
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Solo números
                if (value.length <= 4) {
                  setPin(value)
                  setError(null)
                }
              }}
              placeholder="0000"
              disabled={setPinMutation.isPending}
              className="text-center text-2xl font-mono tracking-widest"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirmar PIN</Label>
            <Input
              id="confirmPin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Solo números
                if (value.length <= 4) {
                  setConfirmPin(value)
                  setError(null)
                }
              }}
              placeholder="0000"
              disabled={setPinMutation.isPending}
              className="text-center text-2xl font-mono tracking-widest"
              autoComplete="off"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Importante
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Guarda este PIN en un lugar seguro. Lo necesitarás cada vez que realices acciones críticas en el sistema.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setPin('')
                setConfirmPin('')
                setError(null)
              }}
              disabled={setPinMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={setPinMutation.isPending || pin.length !== 4 || confirmPin.length !== 4}
            >
              {setPinMutation.isPending ? 'Estableciendo...' : 'Establecer PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

