import { z } from 'zod'

export const convencionSchema = z.object({
  nombre: z
    .string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  fecha: z.string().min(1, 'La fecha es requerida'),
  lugar: z
    .string()
    .min(3, 'El lugar debe tener al menos 3 caracteres')
    .max(200, 'El lugar no puede exceder 200 caracteres')
    .trim(),
  monto: z
    .number()
    .min(0, 'El monto no puede ser negativo')
    .max(999999.99, 'El monto no puede exceder $999,999.99')
    .refine(val => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'El monto solo puede tener hasta 2 decimales'),
  cuotas: z
    .number()
    .int('Las cuotas deben ser un número entero')
    .min(0, 'Las cuotas no pueden ser negativas')
    .max(12, 'Las cuotas deben estar entre 0 y 12'),
  invitadoNombre: z.string().max(120, 'Máximo 120 caracteres').optional().or(z.literal('')),
  invitadoFotoUrl: z.string().optional(),
})

export type ConvencionFormData = z.infer<typeof convencionSchema>
