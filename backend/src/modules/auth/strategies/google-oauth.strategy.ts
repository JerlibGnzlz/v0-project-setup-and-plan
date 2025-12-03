import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { InvitadoAuthService } from '../invitado-auth.service'

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private invitadoAuthService: InvitadoAuthService) {
    // Construir callback URL completo con el backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const callbackPath = process.env.GOOGLE_CALLBACK_URL || '/api/auth/invitado/google/callback'
    const callbackURL = callbackPath.startsWith('http') 
      ? callbackPath 
      : `${backendUrl}${callbackPath}`
    
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile
    const email = emails[0].value
    const nombre = name.givenName || ''
    const apellido = name.familyName || ''
    // Obtener foto del perfil de Google (si existe)
    const fotoUrl = photos && photos[0] ? photos[0].value : null

    const user = {
      googleId: id,
      email,
      nombre,
      apellido,
      fotoUrl,
      accessToken,
    }

    done(null, user)
  }
}

