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
  GoogleIdTokenDto,
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
   * Refrescar access token
   */
  @ThrottleAuth()
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.invitadoAuthService.refreshAccessToken(dto.refreshToken)
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
      this.logger.log('🔐 Iniciando callback de Google OAuth')
      
      // Validar que req.user existe y tiene los datos necesarios
      if (!req.user) {
        this.logger.error('❌ No se recibió información del usuario de Google')
        throw new Error('No se recibió información del usuario de Google')
      }

      this.logger.debug('✅ Usuario recibido de Google:', { 
        hasUser: !!req.user,
        userKeys: Object.keys(req.user as Record<string, unknown>)
      })

      const user = req.user as {
        googleId: string
        email: string
        nombre: string
        apellido: string
        fotoUrl?: string | null
      }

      // Validar campos requeridos
      if (!user.googleId || !user.email) {
        this.logger.error('❌ Datos incompletos del perfil de Google:', {
          hasGoogleId: !!user.googleId,
          hasEmail: !!user.email,
          userData: { ...user, googleId: user.googleId ? '***' : undefined }
        })
        throw new Error('Datos incompletos del perfil de Google')
      }

      this.logger.log(`📧 Procesando autenticación para: ${user.email}`, {
        googleId: user.googleId,
        nombre: user.nombre,
        apellido: user.apellido,
        tieneFoto: !!user.fotoUrl
      })

      // Llamar al servicio de autenticación
      const result = await this.invitadoAuthService.googleAuth(
        user.googleId,
        user.email,
        user.nombre || '',
        user.apellido || '',
        user.fotoUrl || undefined
      )

      this.logger.debug('✅ Resultado de googleAuth:', {
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        hasInvitado: !!result.invitado
      })

      // Validar que el resultado tenga los tokens necesarios
      if (!result.access_token || !result.refresh_token) {
        this.logger.error('❌ No se generaron los tokens de autenticación:', {
          hasAccessToken: !!result.access_token,
          hasRefreshToken: !!result.refresh_token,
          resultKeys: Object.keys(result)
        })
        throw new Error('No se generaron los tokens de autenticación')
      }

      // Redirigir al frontend con el token
      const redirectUrl = `${frontendUrl}/convencion/inscripcion?token=${result.access_token}&google=true&refresh_token=${result.refresh_token}`
      
      this.logger.log(`✅ Redirigiendo a frontend: ${redirectUrl.replace(/token=[^&]+/, 'token=***')}`)

      return res.redirect(redirectUrl)
    } catch (error: unknown) {
      // Log detallado del error para debugging
      const errorLogMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      this.logger.error(`❌ Error en callback de Google OAuth: ${errorLogMessage}`, {
        error: errorLogMessage,
        stack: errorStack,
        errorType: error?.constructor?.name,
        hasUser: !!req.user,
        userData: req.user ? Object.keys(req.user as Record<string, unknown>) : []
      })

      // Si es un error de Prisma, loguear más detalles
      if (error && typeof error === 'object' && 'code' in error) {
        this.logger.error('❌ Error de Prisma:', {
          code: (error as { code?: string }).code,
          meta: (error as { meta?: unknown }).meta
        })
      }

      // Determinar el tipo de error para un mensaje más específico
      let errorCode = 'google_auth_failed'
      if (error instanceof Error) {
        if (error.message.includes('email') || error.message.includes('Email')) {
          errorCode = 'google_auth_email_error'
        } else if (error.message.includes('token') || error.message.includes('Token')) {
          errorCode = 'google_auth_token_error'
        } else if (error.message.includes('Prisma') || error.message.includes('database')) {
          errorCode = 'google_auth_database_error'
        }
      }

      const errorUrl = `${frontendUrl}/convencion/inscripcion?error=${errorCode}`

      this.logger.log(`🔴 Redirigiendo a error: ${errorUrl}`)

      return res.redirect(errorUrl)
    }
  }

  /**
   * Autenticación con Google usando token de ID (para móvil)
   */
  @ThrottleAuth()
  @Post('google/mobile')
  @UseInterceptors(ClassSerializerInterceptor)
  async googleAuthMobile(@Body() dto: GoogleIdTokenDto) {
    try {
      this.logger.log('🔐 Iniciando autenticación Google OAuth Mobile...')
      const result = await this.invitadoAuthService.googleAuthMobile(dto.idToken)

      this.logger.log('✅ Autenticación Google OAuth Mobile exitosa', {
        email: result.invitado.email,
      })

      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error en googleAuthMobile: ${errorMessage}`)
      throw error
    }
  }
}
