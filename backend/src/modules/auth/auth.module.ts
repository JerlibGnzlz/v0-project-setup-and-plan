import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PastorAuthService } from './pastor-auth.service'
import { PastorAuthController } from './pastor-auth.controller'
import { PastorJwtStrategy } from './strategies/pastor-jwt.strategy'
import { InvitadoAuthService } from './invitado-auth.service'
import { InvitadoAuthController } from './invitado-auth.controller'
import { InvitadoJwtStrategy } from './strategies/invitado-jwt.strategy'
// GoogleOAuthStrategy removido - archivo vacío
import { UnifiedAuthService } from './unified-auth.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { TokenBlacklistService } from './services/token-blacklist.service'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '15m' }, // Cambiado de 7d a 15m para seguridad
    }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AuthController, PastorAuthController, InvitadoAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PastorAuthService,
    PastorJwtStrategy,
    InvitadoAuthService,
    InvitadoJwtStrategy,
    // GoogleOAuthStrategy removido
    UnifiedAuthService,
    TokenBlacklistService,
  ],
  exports: [
    AuthService,
    PastorAuthService,
    InvitadoAuthService,
    UnifiedAuthService,
    JwtStrategy,
    PastorJwtStrategy,
    InvitadoJwtStrategy,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
