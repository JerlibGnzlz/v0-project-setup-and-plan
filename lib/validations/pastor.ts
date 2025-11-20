import { z } from 'zod'

export const pastorSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  iglesia: z
    .string()
    .min(3, 'El nombre de la iglesia debe tener al menos 3 caracteres')
    .max(100, 'El nombre de la iglesia no puede exceder 100 caracteres'),
  provincia: z
    .string()
    .min(1, 'La provincia es requerida'),
  ciudad: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  telefono: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .regex(/^\+?[0-9\s\-()]+$/, 'Formato de teléfono inválido'),
  observaciones: z
    .string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional(),
})

export type PastorFormData = z.infer<typeof pastorSchema>
