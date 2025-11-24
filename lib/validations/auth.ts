import { z } from 'zod'

// Validación robusta de contraseña (para registro y cambio)
const strongPasswordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')

// Schema para login (contraseña simple, sin validación estricta)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().default(false),
})

// Schema para registro (contraseña más robusta)
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: strongPasswordSchema,
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
