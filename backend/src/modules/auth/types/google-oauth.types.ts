/**
 * Tipos TypeScript para Google OAuth
 */

/**
 * Datos del usuario recibidos de Google OAuth
 */
export interface GoogleOAuthUserData {
  googleId: string
  email: string
  nombre: string
  apellido: string
  fotoUrl?: string | null
  accessToken: string
}

/**
 * Respuesta de autenticación con Google OAuth
 */
export interface GoogleOAuthResponse {
  access_token: string
  refresh_token: string
  invitado: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string | null
    sede?: string | null
    fotoUrl?: string | null
  }
}

/**
 * Errores posibles de Google OAuth
 */
export enum GoogleOAuthErrorType {
  INVALID_PROFILE = 'INVALID_PROFILE',
  MISSING_EMAIL = 'MISSING_EMAIL',
  UNVERIFIED_EMAIL = 'UNVERIFIED_EMAIL',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  AUTH_FAILED = 'AUTH_FAILED',
  TOKEN_GENERATION_FAILED = 'TOKEN_GENERATION_FAILED',
}

























