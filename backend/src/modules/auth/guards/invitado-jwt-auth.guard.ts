import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TokenBlacklistService } from '../services/token-blacklist.service'

@Injectable()
export class InvitadoJwtAuthGuard extends AuthGuard('invitado-jwt') {
  private readonly logger = new Logger(InvitadoJwtAuthGuard.name)

  constructor(private tokenBlacklist: TokenBlacklistService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    this.logger.log(`🔐 InvitadoJwtAuthGuard: Verificando autenticación para ${request.url}`)
    this.logger.log(`🔐 Token presente: ${!!token}`)
    this.logger.log(`🔐 Token length: ${token?.length || 0}`)

    try {
      // Primero ejecutar la validación estándar de JWT
      const canActivate = (await super.canActivate(context)) as boolean

      if (!canActivate) {
        this.logger.warn(`❌ InvitadoJwtAuthGuard: canActivate retornó false`)
        return false
      }

      this.logger.log(`✅ InvitadoJwtAuthGuard: JWT validado correctamente`)

      // Luego verificar blacklist
    if (token) {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
      if (isBlacklisted) {
          this.logger.warn(`❌ InvitadoJwtAuthGuard: Token está en blacklist`)
        throw new UnauthorizedException('Token revocado')
      }
        this.logger.log(`✅ InvitadoJwtAuthGuard: Token no está en blacklist`)
      }

      this.logger.log(`✅ InvitadoJwtAuthGuard: Autenticación exitosa`)
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`❌ InvitadoJwtAuthGuard: Error en canActivate: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      throw error
    }
  }
}
