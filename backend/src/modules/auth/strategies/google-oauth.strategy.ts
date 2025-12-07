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

    if (!clientID || !clientSecret) {
      throw new Error(
        'Google OAuth no está configurado. Por favor, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.'
      )
    }

    // Construir callback URL completo con el backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const callbackPath = process.env.GOOGLE_CALLBACK_URL || '/api/auth/invitado/google/callback'
    const callbackURL = callbackPath.startsWith('http')
      ? callbackPath
      : `${backendUrl}${callbackPath}`

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    })

    this.logger.log(`✅ Google OAuth Strategy inicializada`)
    this.logger.debug(`Callback URL: ${callbackURL}`)
  }

  /**
   * Valida y procesa el perfil de Google OAuth
   *
   * @param accessToken - Token de acceso de Google
   * @param refreshToken - Token de refresco de Google (no usado actualmente)
   * @param profile - Perfil del usuario de Google
   * @param done - Callback de Passport
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    try {
      // Validar que el perfil tenga los datos necesarios
      if (!profile || !profile.id) {
        this.logger.error('❌ Perfil de Google inválido: falta ID')
        return done(new UnauthorizedException('Perfil de Google inválido'), undefined)
      }

      // Validar email
      if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        this.logger.error('❌ Perfil de Google inválido: falta email')
        return done(new UnauthorizedException('Email no disponible en el perfil de Google'), undefined)
      }

      const email = profile.emails[0].value

      // Validar que el email esté verificado por Google
      if (profile.emails[0].verified === false) {
        this.logger.warn(`⚠️ Email de Google no verificado: ${email}`)
        // En producción, podrías querer rechazar emails no verificados
        // return done(new UnauthorizedException('Email de Google no verificado'), null)
      }

      // Extraer nombre y apellido
      const nombre = profile.name?.givenName || profile.displayName?.split(' ')[0] || ''
      const apellido =
        profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || ''

      // Validar que al menos tengamos un nombre
      if (!nombre && !apellido) {
        this.logger.warn(`⚠️ Nombre completo no disponible en perfil de Google para: ${email}`)
      }

      // Obtener foto del perfil de Google (si existe)
      const fotoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null

      this.logger.log(`📸 Foto de Google obtenida: ${fotoUrl || 'NO DISPONIBLE'}`, {
        email,
        tieneFotos: !!profile.photos,
        cantidadFotos: profile.photos?.length || 0,
        fotoUrlOriginal: fotoUrl,
      })

      const user: GoogleOAuthUserData = {
        googleId: profile.id,
        email,
        nombre,
        apellido,
        fotoUrl,
        accessToken,
      }

      this.logger.log(`✅ Usuario de Google validado: ${email}`, {
        googleId: profile.id,
        nombre: `${nombre} ${apellido}`,
        tieneFoto: !!fotoUrl,
      })

      done(null, user)
    } catch (error) {
      this.logger.error('❌ Error al validar perfil de Google:', error)
      done(error instanceof Error ? error : new Error('Error al procesar perfil de Google'), undefined)
    }
  }
}
