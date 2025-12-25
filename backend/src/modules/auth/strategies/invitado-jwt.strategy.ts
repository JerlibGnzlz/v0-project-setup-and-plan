import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InvitadoAuthService } from '../invitado-auth.service'
import { InvitadoJwtPayload } from '../types/jwt-payload.types'

@Injectable()
export class InvitadoJwtStrategy extends PassportStrategy(Strategy, 'invitado-jwt') {
  private readonly logger = new Logger(InvitadoJwtStrategy.name)

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
    try {
      this.logger.log(`🔐 InvitadoJwtStrategy.validate: Validando payload`)
      this.logger.log(`🔐 Payload sub: ${payload.sub}`)
      this.logger.log(`🔐 Payload role: ${payload.role}`)

      if (payload.role !== 'INVITADO') {
        this.logger.error(`❌ Role inválido: ${payload.role}`)
        throw new UnauthorizedException('Token inválido para invitado')
      }

      this.logger.log(`🔐 Llamando a validateInvitado con sub: ${payload.sub}`)
      const invitado = await this.invitadoAuthService.validateInvitado(payload.sub)
      
      if (!invitado) {
        this.logger.error(`❌ Invitado no encontrado para sub: ${payload.sub}`)
        throw new UnauthorizedException('Invitado no encontrado')
      }

      this.logger.log(`✅ Invitado validado: ${invitado.id} (${invitado.email})`)
      return invitado
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`❌ Error en InvitadoJwtStrategy.validate: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      throw error
    }
  }
}
