
import { z } from "zod"

export const pastorSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede exceder 100 caracteres"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, "Formato de teléfono inválido")
    .optional()
    .or(z.literal("")),
  sede: z.string().max(100, "La sede no puede exceder 100 caracteres").optional().or(z.literal("")),
  cargo: z.string().max(100, "El cargo no puede exceder 100 caracteres").optional().or(z.literal("")),
  fotoUrl: z.string().url("URL de foto inválida").optional().or(z.literal("")),
  biografia: z.string().max(1000, "La biografía no puede exceder 1000 caracteres").optional().or(z.literal("")),
  activo: z.boolean().default(true),
})

export type PastorFormData = z.infer<typeof pastorSchema>
