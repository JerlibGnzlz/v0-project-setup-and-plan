import { z } from 'zod'

export const convencionSchema = z.object({
  nombre: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  lugar: z.string().min(3, 'El lugar debe tener al menos 3 caracteres'),
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  cuotas: z.number().min(1).max(12, 'Las cuotas deben estar entre 1 y 12'),
})

export type ConvencionFormData = z.infer<typeof convencionSchema>
