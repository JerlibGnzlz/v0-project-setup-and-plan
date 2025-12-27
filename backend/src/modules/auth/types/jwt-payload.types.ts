/**
 * Tipos para payloads JWT
 * Define la estructura de los tokens JWT usados en la aplicación
 */

/**
 * Payload base para tokens JWT
 */
export interface BaseJwtPayload {
  sub: string // Subject (user ID)
  iat?: number // Issued at
  exp?: number // Expiration
}

/**
 * Payload para tokens de administrador
 */
export interface AdminJwtPayload extends BaseJwtPayload {
  email: string
  rol: 'ADMIN' | 'SUPER_ADMIN'
}

/**
 * Payload para tokens de pastor
 */
export interface PastorJwtPayload extends BaseJwtPayload {
  type: 'access' | 'refresh'
  email: string
  rol: 'PASTOR'
}

/**
 * Payload para tokens de invitado
 */
export interface InvitadoJwtPayload extends BaseJwtPayload {
  role: 'INVITADO'
  email: string
}

/**
 * Tipo unión para todos los payloads posibles
 */
export type JwtPayload = AdminJwtPayload | PastorJwtPayload | InvitadoJwtPayload


























