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
import { Lock, AlertCircle } from 'lucide-react'
import { useValidateAdminPin } from '@/lib/hooks/use-usuarios'

interface AdminPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  action: 'edit' | 'reset-password' | 'delete'
  usuarioNombre?: string
}

export function AdminPinDialog({
  open,
  onOpenChange,
  onSuccess,
  action,
  usuarioNombre,
}: AdminPinDialogProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const validatePinMutation = useValidateAdminPin()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPin('')
      setError(null)
      // Focus en el input cuando se abre el diálogo
      setTimeout(() => {
        inputRef.current?.focus()
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

    try {
      const result = await validatePinMutation.mutateAsync(pin)
      if (result.valid) {
        onSuccess()
        onOpenChange(false)
        setPin('')
      } else {
        setError('PIN incorrecto. Intenta nuevamente.')
        setPin('')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'PIN incorrecto'
      setError(errorMessage)
      setPin('')
    }
  }

  const getActionText = () => {
    switch (action) {
      case 'edit':
        return 'editar'
      case 'reset-password':
        return 'resetear la contraseña'
      case 'delete':
        return 'eliminar'
      default:
        return 'realizar esta acción'
    }
  }

  const getActionDescription = () => {
    const actionText = getActionText()
    if (usuarioNombre) {
      return `Para ${actionText} al usuario ${usuarioNombre}, ingresa tu PIN de administrador de 4 dígitos.`
    }
    return `Para ${actionText}, ingresa tu PIN de administrador de 4 dígitos.`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Verificación de PIN Requerida
          </DialogTitle>
          <DialogDescription>{getActionDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN de Administrador</Label>
            <Input
              ref={inputRef}
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
              disabled={validatePinMutation.isPending}
              className="text-center text-2xl font-mono tracking-widest"
              autoComplete="off"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <p>{error}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Ingresa tu PIN de 4 dígitos para confirmar esta acción crítica.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setPin('')
                setError(null)
              }}
              disabled={validatePinMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={validatePinMutation.isPending || pin.length !== 4}>
              {validatePinMutation.isPending ? 'Verificando...' : 'Verificar y Continuar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

