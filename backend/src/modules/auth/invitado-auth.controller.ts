import {
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  Logger,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response, Request as ExpressRequest } from 'express'
import { InvitadoAuthService } from './invitado-auth.service'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import { RefreshTokenDto } from './dto/auth.dto'
import { InvitadoJwtAuthGuard } from './guards/invitado-jwt-auth.guard'
import { ThrottleAuth, ThrottleRegister } from '../../common/decorators/throttle-auth.decorator'
import { AuthenticatedInvitadoRequest } from './types/request.types'

@Controller('auth/invitado')
export class InvitadoAuthController {
  private readonly logger = new Logger(InvitadoAuthController.name)

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
  async getProfile(@Request() req: AuthenticatedInvitadoRequest) {
    // Obtener invitado completo con fotoUrl
    const invitado = await this.invitadoAuthService.validateInvitado(req.user.id)

    if (!invitado) {
      throw new Error('Invitado no encontrado')
    }

    this.logger.debug(`Perfil solicitado para invitado: ${invitado.id} (${invitado.email})`)

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
  async logout(@Request() req: AuthenticatedInvitadoRequest, @Body() body?: { refreshToken?: string }) {
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.replace('Bearer ', '') || ''

    await this.invitadoAuthService.logout(accessToken, body?.refreshToken)

    return {
      message: 'Logout exitoso',
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
  async googleAuthCallback(@Request() req: ExpressRequest & { user?: unknown }, @Res() res: Response) {
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
    } catch (error: unknown) {
      // Log del error para debugging
      const errorLogMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en callback de Google OAuth: ${errorLogMessage}`)

      // Determinar el tipo de error para un mensaje más específico
      let errorCode = 'google_auth_failed'
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          errorCode = 'google_auth_email_error'
        } else if (error.message.includes('token')) {
          errorCode = 'google_auth_token_error'
        }
      }

      const errorUrl = `${frontendUrl}/convencion/inscripcion?error=${errorCode}`

      return res.redirect(errorUrl)
    }
  }
}
