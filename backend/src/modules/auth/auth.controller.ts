import { Controller, Post, UseGuards, Get, Request, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UnifiedAuthService } from './unified-auth.service'
import { LoginDto, RegisterDto, RefreshTokenDto, RegisterDeviceDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import {
  ThrottleAuth,
  ThrottleRegister,
  ThrottlePasswordReset,
} from '../../common/decorators/throttle-auth.decorator'
import { AuthenticatedRequest } from './types/request.types'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private unifiedAuthService: UnifiedAuthService
  ) {}

  @ThrottleRegister()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @ThrottleAuth()
  @Post('login')
  async login(@Body() dto: LoginDto, @Request() req: { ip?: string; headers: Record<string, string | string[] | undefined> }) {
    // Obtener IP del cliente para logs de seguridad
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'][0] 
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || ''
    return this.authService.login(dto, clientIp)
  }

  /**
   * Login unificado: busca tanto en admins, pastores como invitados
   * Útil para la app móvil que necesita autenticar cualquier tipo de usuario
   */
  @ThrottleAuth()
  @Post('login/unified')
  async loginUnified(@Body() dto: LoginDto) {
    // Primero intentar como admin
    try {
      return await this.authService.login(dto)
    } catch (error) {
      // Si no es admin, intentar como pastor o invitado
      return this.unifiedAuthService.loginUnified(dto.email, dto.password)
    }
  }

  // Endpoint para mobile: login con refresh token
  @Post('login/mobile')
  async loginMobile(@Body() dto: LoginDto) {
    return this.authService.loginMobile(dto)
  }

  // Endpoint para refresh token (mobile)
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken)
  }

  // Endpoint para registrar dispositivo (notificaciones push)
  @UseGuards(JwtAuthGuard)
  @Post('device/register')
  async registerDevice(@Request() req: AuthenticatedRequest, @Body() dto: RegisterDeviceDto) {
    return this.authService.registerDevice(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    // Obtener usuario completo con hasChangedPassword desde la base de datos
    const user = await this.authService.validateUser(req.user.id)
    return {
      id: req.user.id,
      email: req.user.email,
      nombre: req.user.nombre,
      rol: req.user.rol,
      avatar: req.user.avatar,
      hasChangedPassword: user?.hasChangedPassword ?? false,
    }
  }

  /**
   * Logout: invalidar tokens actuales
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: AuthenticatedRequest, @Body() body?: { refreshToken?: string }) {
    // Extraer token del header
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.replace('Bearer ', '') || ''

    await this.authService.logout(accessToken, body?.refreshToken)

    return {
      message: 'Logout exitoso',
      success: true,
    }
  }

  /**
   * Solicitar reset de contraseña (Forgot Password)
   */
  @ThrottlePasswordReset()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  /**
   * Resetear contraseña con token
   */
  @ThrottlePasswordReset()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  /**
   * Cambiar contraseña (cuando estás logueado)
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto)
  }
}
