import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PastorAuthService } from '../pastor-auth.service'

@Injectable()
export class PastorJwtStrategy extends PassportStrategy(Strategy, 'pastor-jwt') {
  constructor(private pastorAuthService: PastorAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    })
  }

  async validate(payload: any) {
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




