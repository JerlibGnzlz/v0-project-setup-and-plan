import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InvitadoAuthService } from '../invitado-auth.service'

@Injectable()
export class InvitadoJwtStrategy extends PassportStrategy(Strategy, 'invitado-jwt') {
  constructor(private invitadoAuthService: InvitadoAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    })
  }

  async validate(payload: any) {
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



