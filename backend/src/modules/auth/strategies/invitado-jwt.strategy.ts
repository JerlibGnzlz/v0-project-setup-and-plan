import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InvitadoAuthService } from '../invitado-auth.service'
import { InvitadoJwtPayload } from '../types/jwt-payload.types'

@Injectable()
export class InvitadoJwtStrategy extends PassportStrategy(Strategy, 'invitado-jwt') {
  constructor(private invitadoAuthService: InvitadoAuthService) {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está configurado. Por favor, configura la variable de entorno JWT_SECRET.'
      )
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    })
  }

  async validate(payload: InvitadoJwtPayload) {
    if (payload.role !== 'INVITADO') {
      throw new UnauthorizedException('Token inválido para invitado')
    }

    const invitado = await this.invitadoAuthService.validateInvitado(payload.sub)
    if (!invitado) {
      throw new UnauthorizedException()
    }
    return invitado
  }
}
