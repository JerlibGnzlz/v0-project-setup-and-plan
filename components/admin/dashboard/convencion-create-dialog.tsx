'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { convencionSchema, type ConvencionFormData } from '@/lib/validations/convencion'

interface ConvencionCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ConvencionFormData) => Promise<void>
  isPending: boolean
}

export function ConvencionCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: ConvencionCreateDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConvencionFormData>({
    resolver: zodResolver(convencionSchema),
  })

  const handleFormSubmit = async (data: ConvencionFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Convención</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva convención
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-nombre">Nombre de la Convención</Label>
            <Input
              id="create-nombre"
              {...register('nombre')}
              placeholder="Ej: Convención Nacional 2025"
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-fecha">Fecha de Inicio</Label>
            <Input id="create-fecha" type="date" {...register('fecha')} />
            {errors.fecha && <p className="text-sm text-red-500">{errors.fecha.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-lugar">Ubicación</Label>
            <Input
              id="create-lugar"
              {...register('lugar')}
              placeholder="Ej: Centro de Convenciones"
            />
            {errors.lugar && <p className="text-sm text-red-500">{errors.lugar.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-monto">Costo de Inscripción (ARS)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="create-monto"
                  type="text"
                  {...register('monto', {
                    setValueAs: value => {
                      if (!value) return 0
                      // Remover caracteres no numéricos excepto punto decimal
                      const cleaned = value.toString().replace(/[^\d.]/g, '')
                      // Permitir solo un punto decimal
                      const parts = cleaned.split('.')
                      const formatted =
                        parts.length > 1
                          ? `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`
                          : parts[0]
                      const numValue = parseFloat(formatted) || 0
                      // Validar rango
                      if (numValue < 0) return 0
                      if (numValue > 999999.99) return 999999.99
                      return numValue
                    },
                    validate: value => {
                      if (value === undefined || value === null)
                        return 'El monto es requerido'
                      if (value <= 0) return 'El monto debe ser mayor a 0'
                      if (value > 999999.99) return 'El monto no puede exceder $999,999.99'
                      return true
                    },
                  })}
                  placeholder="0.00"
                  className="pl-7"
                  onBlur={e => {
                    const value = e.target.value
                    if (value && !isNaN(parseFloat(value))) {
                      const numValue = parseFloat(value)
                      e.target.value = numValue.toFixed(2)
                    }
                  }}
                />
              </div>
              {errors.monto && (
                <p className="text-sm text-red-500">{errors.monto.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ingresa el monto con hasta 2 decimales (ej: 15000.50)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-cuotas">Número de Cuotas</Label>
              <Input
                id="create-cuotas"
                type="number"
                {...register('cuotas', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.cuotas && (
                <p className="text-sm text-red-500">{errors.cuotas.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Convención'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


