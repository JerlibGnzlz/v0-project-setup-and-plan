import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20'
import { InvitadoAuthService } from '../invitado-auth.service'
import { GoogleOAuthUserData } from '../types/google-oauth.types'

// Re-exportar tipos para compatibilidad
export type { GoogleOAuthUserData as GoogleOAuthUser }

/**
 * Estrategia de autenticación con Google OAuth
 *
 * @class GoogleOAuthStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleOAuthStrategy.name)

  constructor(private invitadoAuthService: InvitadoAuthService) {
    // Validar variables de entorno requeridas
    const clientID = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    // Construir callback URL completo con el backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const callbackPath = process.env.GOOGLE_CALLBACK_URL || '/api/auth/invitado/google/callback'
    const callbackURL = callbackPath.startsWith('http')
      ? callbackPath
      : `${backendUrl}${callbackPath}`

    // Siempre llamar super() primero, con valores reales o dummy
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL,
      scope: ['email', 'profile'],
    })

    // Después de super(), validar y registrar warnings si es necesario
    if (!clientID || !clientSecret) {
      // No lanzar error, solo registrar warning
      // La estrategia se inicializará con valores dummy para evitar errores
      this.logger.warn(
        '⚠️  Google OAuth no está configurado. La autenticación con Google no estará disponible.'
      )
      this.logger.warn(
        '   Para habilitar Google OAuth, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.'
      )
    } else {
      this.logger.log('✅ Google OAuth Strategy configurada correctamente')
      this.logger.log(`   Callback URL: ${callbackURL}`)
    }
  }

  /**
   * Valida el perfil de Google y retorna los datos del usuario
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { id, name, emails, photos } = profile

      // Validar que el perfil tenga email
      if (!emails || emails.length === 0 || !emails[0].value) {
        this.logger.error('❌ Google OAuth: Perfil sin email')
        return done(new UnauthorizedException('No se pudo obtener el email de Google'), null)
      }

      const email = emails[0].value
      const nombre = name?.givenName || ''
      const apellido = name?.familyName || ''
      // Obtener foto del perfil de Google (si existe)
      const fotoUrl = photos && photos[0] ? photos[0].value : null

      this.logger.log(`🔐 Validando perfil de Google para: ${email}`)

      const user: GoogleOAuthUserData = {
        googleId: id,
        email,
        nombre,
        apellido,
        fotoUrl,
        accessToken,
      }

      // Llamar al callback con los datos del usuario
      done(null, user)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error validando perfil de Google: ${errorMessage}`)
      done(new UnauthorizedException('Error al validar perfil de Google'), null)
    }
  }
}
