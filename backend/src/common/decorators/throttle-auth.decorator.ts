import { applyDecorators } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

/**
 * Decorator para endpoints de autenticación con límites más estrictos
 * Protege contra ataques de fuerza bruta
 * 
 * Límites:
 * - 5 intentos por minuto por IP
 * - 20 intentos por hora por IP
 */
export function ThrottleAuth() {
  return applyDecorators(
    Throttle({ default: { limit: 5, ttl: 60000 } }), // 5 por minuto
    Throttle({ default: { limit: 20, ttl: 3600000 } }), // 20 por hora
  )
}

/**
 * Decorator para endpoints de registro con límites estrictos
 * Protege contra creación masiva de cuentas
 * 
 * Límites:
 * - 3 registros por hora por IP
 * - 10 registros por día por IP
 */
export function ThrottleRegister() {
  return applyDecorators(
    Throttle({ default: { limit: 3, ttl: 3600000 } }), // 3 por hora
    Throttle({ default: { limit: 10, ttl: 86400000 } }), // 10 por día
  )
}

/**
 * Decorator para endpoints de recuperación de contraseña
 * Protege contra spam de emails
 * 
 * Límites:
 * - 3 solicitudes por hora por IP
 * - 5 solicitudes por día por IP
 */
export function ThrottlePasswordReset() {
  return applyDecorators(
    Throttle({ default: { limit: 3, ttl: 3600000 } }), // 3 por hora
    Throttle({ default: { limit: 5, ttl: 86400000 } }), // 5 por día
  )
}

/**
 * Decorator para endpoints de upload de archivos
 * Protege contra abuso de almacenamiento
 * 
 * Límites:
 * - 10 uploads por minuto por IP
 * - 100 uploads por hora por IP
 */
export function ThrottleUpload() {
  return applyDecorators(
    Throttle({ default: { limit: 10, ttl: 60000 } }), // 10 por minuto
    Throttle({ default: { limit: 100, ttl: 3600000 } }), // 100 por hora
  )
}

