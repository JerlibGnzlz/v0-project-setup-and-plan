import { z } from 'zod'

// Tipos de pastor
export const TipoPastorEnum = z.enum(['DIRECTIVA', 'SUPERVISOR', 'PRESIDENTE', 'PRESIDENTE_GLOBAL', 'PASTOR'])
export type TipoPastor = z.infer<typeof TipoPastorEnum>

export const pastorSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),

  // Clasificación
  tipo: TipoPastorEnum.optional().default('DIRECTIVA'),
  cargo: z.string().max(100).optional().or(z.literal('')),
  ministerio: z.string().max(200).optional().or(z.literal('')),

  // Ubicación
  sede: z.string().max(100).optional().or(z.literal('')),
  region: z.string().max(100).optional().or(z.literal('')),
  pais: z.string().max(100).optional().or(z.literal('')),

  // Contenido
  fotoUrl: z.string().optional().or(z.literal('')),
  biografia: z.string().max(500).optional().or(z.literal('')),
  trayectoria: z.string().max(2000).optional().or(z.literal('')),

  // Control - orden puede ser string o number (viene del input)
  orden: z.coerce.number().int().min(0).optional().default(0),
  activo: z.boolean().optional().default(true),
  mostrarEnLanding: z.boolean().optional().default(false),
})

export type PastorFormData = z.infer<typeof pastorSchema>

// Labels para los tipos de pastor (para mostrar en UI)
export const tipoPastorLabels: Record<TipoPastor, string> = {
  DIRECTIVA: 'Directiva Pastoral',
  SUPERVISOR: 'Supervisor Regional',
  PRESIDENTE: 'Presidente de País',
  PRESIDENTE_GLOBAL: 'Presidente Global',
  PASTOR: 'Pastor',
}
