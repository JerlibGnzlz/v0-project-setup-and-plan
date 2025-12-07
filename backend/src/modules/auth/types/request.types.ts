/**
 * Tipos para requests de NestJS con autenticación
 * Define tipos seguros para requests que incluyen información de usuario autenticado
 */

import { Request } from 'express'

/**
 * Usuario autenticado (admin)
 * Retornado por JwtStrategy.validate() -> AuthService.validateUser()
 */
export interface AuthenticatedUser {
  id: string
  email: string
  nombre: string
  rol: 'ADMIN' | 'SUPER_ADMIN'
  avatar: string
}

/**
 * Request con usuario autenticado (admin)
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}

/**
 * Usuario autenticado (pastor)
 * Retornado por PastorJwtStrategy.validate() -> PastorAuthService.validatePastor()
 */
export interface AuthenticatedPastor {
  id: string
  nombre: string
  apellido: string | null
  email: string | null
  tipo: string | null
  cargo: string | null
  ministerio: string | null
  sede: string | null
  region: string | null
  pais: string | null
  fotoUrl: string | null
  activo: boolean
}

/**
 * Request con usuario autenticado (pastor)
 */
export interface AuthenticatedPastorRequest extends Request {
  user: AuthenticatedPastor
}

/**
 * Usuario autenticado (invitado)
 * Retornado por InvitadoJwtStrategy.validate() -> InvitadoAuthService.validateInvitado()
 */
export interface AuthenticatedInvitado {
  id: string
  email: string
}

/**
 * Request con usuario autenticado (invitado)
 */
export interface AuthenticatedInvitadoRequest extends Request {
  user: AuthenticatedInvitado
}

