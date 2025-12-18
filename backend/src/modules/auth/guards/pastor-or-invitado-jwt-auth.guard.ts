import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from '../services/token-blacklist.service'

/**
 * Guard que acepta autenticación de pastor O invitado
 * Útil para endpoints que deben ser accesibles para ambos tipos de usuarios
 * Intenta primero con pastor, luego con invitado
 */
@Injectable()
export class PastorOrInvitadoJwtAuthGuard extends AuthGuard(['pastor-jwt', 'invitado-jwt']) {
  constructor(private tokenBlacklist: TokenBlacklistService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado')
    }

    // Verificar blacklist primero
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revocado')
    }

    // Intentar autenticar con pastor-jwt primero
    try {
      const pastorGuard = new (await import('./pastor-jwt-auth.guard')).PastorJwtAuthGuard(
        this.tokenBlacklist
      )
      const canActivatePastor = await pastorGuard.canActivate(context)
      if (canActivatePastor) {
        return true
      }
    } catch {
      // Si falla con pastor, continuar con invitado
    }

    // Intentar autenticar con invitado-jwt
    try {
      const invitadoGuard = new (await import('./invitado-jwt-auth.guard')).InvitadoJwtAuthGuard(
        this.tokenBlacklist
      )
      return await invitadoGuard.canActivate(context)
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}

