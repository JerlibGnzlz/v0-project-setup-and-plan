import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InvitadoAuthService } from '../invitado-auth.service'
import { TokenBlacklistService } from '../services/token-blacklist.service'

/**
 * Guard que valida el token de invitado SIN usar la estrategia Passport.
 * Solo verifica: JWT válido (firma + no expirado) + payload.sub existe + invitado en BD.
 * Usar en rutas de solicitudes-credenciales para evitar 401 por validación de role.
 */
@Injectable()
export class InvitadoTokenGuard {
  private readonly logger = new Logger(InvitadoTokenGuard.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly invitadoAuthService: InvitadoAuthService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    const token = authHeader?.replace(/^Bearer\s+/i, '')

    if (!token) {
      this.logger.warn('Token no proporcionado')
      throw new UnauthorizedException('Token inválido para invitado')
    }

    try {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revocado')
      }

      const payload = this.jwtService.verify<Record<string, unknown>>(token)
      const sub =
        typeof payload.sub === 'string'
          ? payload.sub
          : typeof payload.userId === 'string'
            ? payload.userId
            : typeof payload.id === 'string'
              ? payload.id
              : undefined

      if (!sub) {
        this.logger.warn('Payload sin sub/userId/id')
        throw new UnauthorizedException('Token inválido para invitado')
      }

      const invitado = await this.invitadoAuthService.validateInvitado(sub)
      if (!invitado) {
        this.logger.warn(`Invitado no encontrado: ${sub}`)
        throw new UnauthorizedException('Invitado no encontrado')
      }

      request.user = invitado
      this.logger.log(`✅ InvitadoTokenGuard: invitado ${invitado.id} autorizado`)
      return true
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.error(
        `Error validando token: ${err instanceof Error ? err.message : 'desconocido'}`,
      )
      throw new UnauthorizedException('Token inválido para invitado')
    }
  }
}
