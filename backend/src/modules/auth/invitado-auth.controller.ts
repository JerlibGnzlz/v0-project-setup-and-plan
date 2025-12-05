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
    
    console.log('[InvitadoAuthController] Perfil solicitado:', {
      invitadoId: invitado.id,
      email: invitado.email,
      fotoUrl: invitado.fotoUrl,
      tieneFotoUrl: !!invitado.fotoUrl,
    })
    
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
   * Logout: invalidar tokens actuales
   */
  @UseGuards(InvitadoJwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Body() body?: { refreshToken?: string }) {
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.replace('Bearer ', '') || ''

    await this.invitadoAuthService.logout(accessToken, body?.refreshToken)

    return {
      message: "Logout exitoso",
      success: true,
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    try {
      // Validar que req.user existe y tiene los datos necesarios
      if (!req.user) {
        throw new Error('No se recibió información del usuario de Google')
      }

      const user = req.user as {
        googleId: string
        email: string
        nombre: string
        apellido: string
        fotoUrl?: string | null
      }

      // Validar campos requeridos
      if (!user.googleId || !user.email) {
        throw new Error('Datos incompletos del perfil de Google')
      }

      // Llamar al servicio de autenticación
      const result = await this.invitadoAuthService.googleAuth(
        user.googleId,
        user.email,
        user.nombre || '',
        user.apellido || '',
        user.fotoUrl || undefined
      )

      // Validar que el resultado tenga los tokens necesarios
      if (!result.access_token || !result.refresh_token) {
        throw new Error('No se generaron los tokens de autenticación')
      }

      // Redirigir al frontend con el token
      const redirectUrl = `${frontendUrl}/convencion/inscripcion?token=${result.access_token}&google=true&refresh_token=${result.refresh_token}`
      
      return res.redirect(redirectUrl)
    } catch (error) {
      // Log del error para debugging
      console.error('[InvitadoAuthController] Error en callback de Google OAuth:', error)
      
      // Determinar el tipo de error para un mensaje más específico
      let errorMessage = 'google_auth_failed'
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          errorMessage = 'google_auth_email_error'
        } else if (error.message.includes('token')) {
          errorMessage = 'google_auth_token_error'
        }
      }

      const errorUrl = `${frontendUrl}/convencion/inscripcion?error=${errorMessage}`
      
      return res.redirect(errorUrl)
    }
  }
}

