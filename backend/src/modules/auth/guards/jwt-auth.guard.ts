import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from '../services/token-blacklist.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private tokenBlacklist: TokenBlacklistService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero ejecutar la validación estándar de JWT
    const canActivate = (await super.canActivate(context)) as boolean

    if (!canActivate) {
      return false
    }

    // Luego verificar blacklist (solo si el servicio está disponible)
    if (this.tokenBlacklist) {
      const request = context.switchToHttp().getRequest()
      const authHeader = request.headers.authorization
      const token = authHeader?.replace('Bearer ', '')

      if (token) {
        try {
          const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
          if (isBlacklisted) {
            throw new UnauthorizedException('Token revocado')
          }
        } catch (error) {
          // Si hay un error al verificar blacklist (ej: Redis no disponible), permitir el acceso
          // pero loguear el error para debugging
          console.warn('[JwtAuthGuard] Error al verificar blacklist:', error)
        }
      }
    }

    return true
  }
}
