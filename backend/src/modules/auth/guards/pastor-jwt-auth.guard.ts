import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from '../services/token-blacklist.service'

@Injectable()
export class PastorJwtAuthGuard extends AuthGuard('pastor-jwt') {
  constructor(private tokenBlacklist: TokenBlacklistService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero ejecutar la validación estándar de JWT
    const canActivate = (await super.canActivate(context)) as boolean

    if (!canActivate) {
      return false
    }

    // Luego verificar blacklist
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revocado')
      }
    }

    return true
  }
}
