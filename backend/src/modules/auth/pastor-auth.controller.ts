import { Controller, Post, UseGuards, Get, Request, Body } from '@nestjs/common'
import { PastorAuthService } from './pastor-auth.service'
import {
  PastorRegisterDto,
  PastorLoginDto,
  PastorForgotPasswordDto,
  PastorResetPasswordDto,
  PastorCompleteRegisterDto,
} from './dto/pastor-auth.dto'
import { RefreshTokenDto } from './dto/auth.dto'
import { PastorJwtAuthGuard } from './guards/pastor-jwt-auth.guard'

@Controller('auth/pastor')
export class PastorAuthController {
  constructor(private pastorAuthService: PastorAuthService) {}

  @Post('register')
  async register(@Body() dto: PastorRegisterDto) {
    return this.pastorAuthService.register(dto)
  }

  @Post('register-complete')
  async registerComplete(@Body() dto: PastorCompleteRegisterDto) {
    return this.pastorAuthService.registerComplete(dto)
  }

  @Post('login')
  async login(@Body() dto: PastorLoginDto) {
    return this.pastorAuthService.login(dto)
  }

  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.pastorAuthService.refreshAccessToken(dto.refreshToken)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: PastorForgotPasswordDto) {
    return this.pastorAuthService.forgotPassword(dto)
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: PastorResetPasswordDto) {
    return this.pastorAuthService.resetPassword(dto)
  }

  @UseGuards(PastorJwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      email: req.user.email,
      tipo: req.user.tipo,
      cargo: req.user.cargo,
      ministerio: req.user.ministerio,
      sede: req.user.sede,
      region: req.user.region,
      pais: req.user.pais,
      fotoUrl: req.user.fotoUrl,
    }
  }
}

