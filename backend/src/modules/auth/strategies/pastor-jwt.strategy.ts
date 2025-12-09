import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PastorAuthService } from '../pastor-auth.service'
import { PastorJwtPayload } from '../types/jwt-payload.types'

@Injectable()
export class PastorJwtStrategy extends PassportStrategy(Strategy, 'pastor-jwt') {
  constructor(private pastorAuthService: PastorAuthService) {
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

  async validate(payload: PastorJwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido')
    }

    const pastor = await this.pastorAuthService.validatePastor(payload.sub)
    if (!pastor) {
      throw new UnauthorizedException()
    }
    return pastor
  }
}
