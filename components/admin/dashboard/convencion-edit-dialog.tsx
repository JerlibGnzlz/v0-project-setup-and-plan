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
import { DatePicker } from '@/components/ui/date-picker'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { convencionSchema, type ConvencionFormData } from '@/lib/validations/convencion'
import { useEffect } from 'react'
import { format } from 'date-fns'

// Función helper para convertir fecha ISO a formato local yyyy-MM-dd sin problemas de zona horaria
function formatDateToLocal(dateString: string | Date): string {
  if (!dateString) return ''
  
  let date: Date
  if (typeof dateString === 'string') {
    // Si es string ISO, crear Date y usar métodos locales para evitar problemas de zona horaria
    date = new Date(dateString)
  } else {
    date = dateString
  }
  
  // Usar métodos locales para obtener año, mes y día sin problemas de zona horaria
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

interface ConvencionEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  convencion: {
    id: string
    titulo?: string
    fechaInicio?: string | Date
    ubicacion?: string
    costo?: number | string
  } | null
  onSubmit: (data: ConvencionFormData) => Promise<void>
  isPending: boolean
}

export function ConvencionEditDialog({
  open,
  onOpenChange,
  convencion,
  onSubmit,
  isPending,
}: ConvencionEditDialogProps) {
  const convencionFormData: ConvencionFormData = convencion
    ? {
        nombre: convencion.titulo || '',
        fecha: convencion.fechaInicio ? formatDateToLocal(convencion.fechaInicio) : '',
        lugar: convencion.ubicacion || '',
        monto: convencion.costo ? Number(convencion.costo) : 0,
        cuotas: 3, // Por defecto
      }
    : {
        nombre: '',
        fecha: '',
        lugar: '',
        monto: 0,
        cuotas: 3,
      }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ConvencionFormData>({
    resolver: zodResolver(convencionSchema),
    defaultValues: convencionFormData,
  })

  const fechaValue = watch('fecha')

  // Resetear formulario cuando cambia la convención
  useEffect(() => {
    if (convencion) {
      reset({
        nombre: convencion.titulo || '',
        fecha: convencion.fechaInicio ? formatDateToLocal(convencion.fechaInicio) : '',
        lugar: convencion.ubicacion || '',
        monto: convencion.costo ? Number(convencion.costo) : 0,
        cuotas: 3,
      })
    }
  }, [convencion, reset])

  const handleFormSubmit = async (data: ConvencionFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Convención</DialogTitle>
          <DialogDescription>
            Modifica el nombre, fecha, lugar y detalles de pago de la convención
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Convención</Label>
            <Input
              id="nombre"
              placeholder="Ej: Convención Nacional Argentina 2025"
              {...register('nombre')}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <DatePicker
                id="fecha"
                value={
                  fechaValue
                    ? (() => {
                        // Convertir string yyyy-MM-dd a Date usando zona horaria local
                        const [year, month, day] = fechaValue.split('-').map(Number)
                        return new Date(year, month - 1, day)
                      })()
                    : undefined
                }
                onChange={(date) => {
                  if (date) {
                    // Formatear fecha usando métodos locales para evitar problemas de zona horaria
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setValue('fecha', `${year}-${month}-${day}`, { shouldValidate: true })
                  } else {
                    setValue('fecha', '', { shouldValidate: true })
                  }
                }}
                placeholder="Selecciona la fecha de inicio"
              />
              {errors.fecha && (
                <p className="text-sm text-destructive">{errors.fecha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                placeholder="Ej: Buenos Aires, Argentina"
                {...register('lugar')}
              />
              {errors.lugar && (
                <p className="text-sm text-destructive">{errors.lugar.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Total (ARS)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="monto"
                  type="text"
                  placeholder="15000.00"
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
                      if (value > 999999.99)
                        return 'El monto no puede exceder $999,999.99'
                      return true
                    },
                  })}
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
                <p className="text-sm text-destructive">{errors.monto.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ingresa el monto con hasta 2 decimales (ej: 15000.50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuotas">Número de Cuotas</Label>
              <Input
                id="cuotas"
                type="number"
                min="1"
                max="12"
                placeholder="3"
                {...register('cuotas', { valueAsNumber: true })}
              />
              {errors.cuotas && (
                <p className="text-sm text-destructive">{errors.cuotas.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

















