import { Module, forwardRef } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { PastorAuthService } from "./pastor-auth.service"
import { PastorAuthController } from "./pastor-auth.controller"
import { PastorJwtStrategy } from "./strategies/pastor-jwt.strategy"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || "7d" },
    }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AuthController, PastorAuthController],
  providers: [AuthService, JwtStrategy, PastorAuthService, PastorJwtStrategy],
  exports: [AuthService, PastorAuthService],
})
export class AuthModule { }
