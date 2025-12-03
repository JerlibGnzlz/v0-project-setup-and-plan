import { Controller, Post, UseGuards, Get, Request, Body, UseInterceptors, ClassSerializerInterceptor, Res } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { InvitadoAuthService } from './invitado-auth.service'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import { RefreshTokenDto } from './dto/auth.dto'
import { InvitadoJwtAuthGuard } from './guards/invitado-jwt-auth.guard'
import { ThrottleAuth, ThrottleRegister } from '../../common/decorators/throttle-auth.decorator'

@Controller('auth/invitado')
export class InvitadoAuthController {
  constructor(private invitadoAuthService: InvitadoAuthService) {}

  @ThrottleRegister()
  @Post('register')
  async register(@Body() dto: InvitadoRegisterDto) {
    return this.invitadoAuthService.register(dto)
  }

  @ThrottleRegister()
  @Post('register-complete')
  async registerComplete(@Body() dto: InvitadoCompleteRegisterDto) {
    return this.invitadoAuthService.registerComplete(dto)
  }

  @ThrottleAuth()
  @Post('login')
  async login(@Body() dto: InvitadoLoginDto) {
    return this.invitadoAuthService.login(dto)
  }

  @UseGuards(InvitadoJwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // Obtener invitado completo con fotoUrl
    const invitado = await this.invitadoAuthService.validateInvitado(req.user.id)
    return {
      id: invitado.id,
      nombre: invitado.nombre,
      apellido: invitado.apellido,
      email: invitado.email,
      telefono: invitado.telefono,
      sede: invitado.sede,
      fotoUrl: invitado.fotoUrl,
      tipo: 'INVITADO',
    }
  }

  /**
   * Iniciar autenticación con Google
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // El guard redirige automáticamente a Google
  }

  /**
   * Callback de Google OAuth
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @UseInterceptors(ClassSerializerInterceptor)
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    try {
      const { googleId, email, nombre, apellido, fotoUrl } = req.user
      const result = await this.invitadoAuthService.googleAuth(googleId, email, nombre, apellido, fotoUrl)
      
      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const redirectUrl = `${frontendUrl}/convencion/inscripcion?token=${result.access_token}&google=true&refresh_token=${result.refresh_token}`
      
      return res.redirect(redirectUrl)
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const errorUrl = `${frontendUrl}/convencion/inscripcion?error=google_auth_failed`
      
      return res.redirect(errorUrl)
    }
  }
}

