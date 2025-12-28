import { IsString, IsOptional, IsNotEmpty } from 'class-validator'

/**
 * DTO para solicitar URL de autorización de Google OAuth
 */
export class GoogleOAuthAuthorizeDto {
  @IsOptional()
  @IsString()
  redirectUri?: string
}

/**
 * DTO para callback de Google OAuth (código de autorización)
 */
export class GoogleOAuthCallbackDto {
  @IsNotEmpty()
  @IsString()
  code!: string

  @IsOptional()
  @IsString()
  state?: string
}

/**
 * Respuesta con URL de autorización
 */
export interface GoogleOAuthAuthorizeResponse {
  authorizationUrl: string
  state: string
}

/**
 * Respuesta con id_token después del intercambio
 */
export interface GoogleOAuthTokenResponse {
  id_token: string
  access_token?: string
  expires_in?: number
}

