import { Injectable, UnauthorizedException, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { LoginDto, RegisterDto, RegisterDeviceDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto'
import { TokenBlacklistService } from './services/token-blacklist.service'
import { AdminJwtPayload } from './types/jwt-payload.types'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenBlacklist: TokenBlacklistService,
    private notificationsService: NotificationsService
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // Generar avatar por defecto usando UI Avatars
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.name || 'Admin')}&background=10b981&color=fff&size=128&bold=true`

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nombre: dto.name || 'Admin',
        avatar: defaultAvatar,
        rol: 'ADMIN',
      },
    })

    const token = this.generateToken(user.id, user.email, user.rol)

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        avatar: user.avatar,
        rol: user.rol,
      },
    }
  }

  async login(dto: LoginDto, clientIp?: string) {
    try {
      this.logger.log(`🔐 Intentando login para: ${dto.email}`, {
        email: dto.email,
        ip: clientIp || 'unknown',
        timestamp: new Date().toISOString(),
      })

      // Obtener usuario - query simple sin campos de seguridad
      // Intentar obtener con activo, si falla usar query sin activo (compatibilidad con migraciones pendientes)
      let user: {
        id: string
        email: string
        password: string
        nombre: string
        rol: string
        avatar: string | null
        activo?: boolean | null
      } | null = null

      try {
        user = await this.prisma.user.findUnique({
          where: { email: dto.email },
          select: {
            id: true,
            email: true,
            password: true,
            nombre: true,
            rol: true,
            avatar: true,
            activo: true,
          },
        })
      } catch (error: unknown) {
        // Si falla porque el campo activo no existe, intentar sin ese campo
        this.logger.warn('Campo activo no encontrado, usando query sin activo (migración pendiente)')
        user = await this.prisma.user.findUnique({
          where: { email: dto.email },
          select: {
            id: true,
            email: true,
            password: true,
            nombre: true,
            rol: true,
            avatar: true,
          },
        })
        // Si no tiene campo activo, asumir que está activo (comportamiento por defecto)
        if (user) {
          user.activo = true
        }
      }

      if (!user) {
        this.logger.warn(`❌ Login fallido: usuario no encontrado`, {
          email: dto.email,
          ip: clientIp || 'unknown',
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // Verificar si el usuario está activo (solo si el campo existe y es false)
      if (user.activo === false) {
        this.logger.warn(`❌ Login fallido: usuario desactivado`, {
          email: dto.email,
          userId: user.id,
          ip: clientIp || 'unknown',
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta al administrador.')
      }

      this.logger.debug(`✅ Usuario encontrado: ${user.email}`, {
        userId: user.id,
        rol: user.rol,
      })

      // Verificar contraseña
      this.logger.debug(`🔐 Verificando contraseña para: ${dto.email}`)
      const isPasswordValid = await bcrypt.compare(dto.password, user.password)
      this.logger.debug(`🔐 Resultado de verificación de contraseña: ${isPasswordValid}`)

      if (!isPasswordValid) {
        this.logger.warn(`❌ Login fallido: contraseña inválida`, {
          email: dto.email,
          userId: user.id,
          ip: clientIp || 'unknown',
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // Generar tokens JWT (access + refresh) para web también
      this.logger.debug(`🎫 Generando tokens JWT para: ${dto.email}`)
      const { accessToken, refreshToken } = this.generateTokenPair(user.id, user.email, user.rol)
      this.logger.debug(`🎫 Tokens generados exitosamente (access: ${accessToken.length}, refresh: ${refreshToken.length})`)

      // Actualizar tracking de login (si los campos existen)
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            ultimoLogin: new Date(),
            loginCount: { increment: 1 },
            ultimaIp: clientIp || null,
          },
        })
      } catch (error: unknown) {
        // Si los campos no existen aún (migración pendiente), solo loguear
        this.logger.debug('Campos de tracking de login no disponibles aún')
      }

      this.logger.log(`✅ Login exitoso`, {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        ip: clientIp || 'unknown',
        timestamp: new Date().toISOString(),
      })

      const response = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          avatar: user.avatar || null,
          rol: user.rol,
        },
      }

      this.logger.debug(`📤 Preparando respuesta de login para: ${dto.email}`)
      return response
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }

      // Log detallado del error real
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        email: dto.email,
        timestamp: new Date().toISOString(),
      }

      this.logger.error(`❌ Error en login (detalles completos):`, errorDetails)

      // Lanzar error más descriptivo
      throw new UnauthorizedException(
        `Error al procesar el login: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  // Login para mobile con refresh token
  async loginMobile(dto: LoginDto) {
    try {
      // Usar select para evitar cargar columnas que no existen
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          password: true,
          nombre: true,
          rol: true,
          avatar: true,
        },
      })

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      const { accessToken, refreshToken } = this.generateTokenPair(user.id, user.email, user.rol)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          avatar: user.avatar,
          rol: user.rol,
        },
      }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en login mobile: ${errorMessage}`)
      throw new UnauthorizedException('Error al procesar el login')
    }
  }

  // Refrescar access token usando refresh token (con rotación)
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verificar si el refresh token está en blacklist
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(refreshToken)
      if (isBlacklisted) {
        this.logger.warn(`❌ Refresh token revocado intentado usar`, {
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Refresh token revocado')
      }

      const payload = await this.validateRefreshToken(refreshToken)
      const user = await this.validateUser(payload.sub)

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado')
      }

      // Invalidar el refresh token anterior (rotación)
      await this.tokenBlacklist.addToBlacklist(refreshToken, 30 * 24 * 60 * 60) // 30 días

      // Generar nuevos tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(
        user.id,
        user.email,
        user.rol
      )

      this.logger.log(`✅ Tokens refrescados`, {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      })

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      this.logger.error(`❌ Error al refrescar token:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      throw new UnauthorizedException('Error al refrescar token')
    }
  }

  /**
   * Logout: invalidar access token y refresh token
   */
  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // Decodificar token para obtener expiración
      let expiresIn = 900 // 15 minutos por defecto
      try {
        const payload = this.jwtService.decode(accessToken) as
          | { exp?: number; [key: string]: unknown }
          | null
        if (payload && typeof payload.exp === 'number') {
          const now = Math.floor(Date.now() / 1000)
          expiresIn = Math.max(payload.exp - now, 0)
        }
      } catch (e) {
        // Si no se puede decodificar, usar valor por defecto
      }

      // Agregar access token a blacklist
      await this.tokenBlacklist.addToBlacklist(accessToken, expiresIn)

      // Si hay refresh token, también invalidarlo
      if (refreshToken) {
        await this.tokenBlacklist.addToBlacklist(refreshToken, 30 * 24 * 60 * 60) // 30 días
      }

      this.logger.log(`✅ Logout exitoso`, {
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`❌ Error en logout:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      // No lanzar error, logout debe siempre tener éxito
    }
  }

  // Registrar dispositivo para notificaciones push
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    // TODO: Implementar almacenamiento de device tokens en base de datos
    // Por ahora solo retornamos éxito
    return {
      success: true,
      message: 'Dispositivo registrado correctamente',
    }
  }

  private generateToken(userId: string, email: string, rol: string) {
    const payload: AdminJwtPayload = { sub: userId, email, rol: rol as 'ADMIN' | 'EDITOR' | 'VIEWER' }
    // Access token con expiración corta (15 minutos) para mayor seguridad
    return this.jwtService.sign(payload, { expiresIn: '15m' })
  }

  // Generar refresh token (preparado para mobile)
  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, type: 'refresh' }
    return this.jwtService.sign(payload, { expiresIn: '30d' })
  }

  // Generar ambos tokens (access + refresh) para mobile
  generateTokenPair(userId: string, email: string, rol: string) {
    return {
      accessToken: this.generateToken(userId, email, rol),
      refreshToken: this.generateRefreshToken(userId),
    }
  }

  // Validar refresh token
  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken)
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido')
      }
      return payload
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nombre: true, rol: true, avatar: true },
    })
  }

  /**
   * Solicitar reset de contraseña (Forgot Password)
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      // Por seguridad, siempre retornamos el mismo mensaje
      // No revelamos si el email existe o no
      if (!user) {
        this.logger.warn(`⚠️ Intento de reset de contraseña para email no registrado: ${dto.email}`)
        return {
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
        }
      }

      // Generar token seguro
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Expira en 1 hora

      // Invalidar tokens anteriores del usuario
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
        },
        data: {
          used: true,
        },
      })

      // Crear nuevo token de reset
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      // Construir URL de reset (frontend)
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${token}`

      // Enviar email con link de reset
      const emailBody = `
        <div style="text-align: center; padding: 20px;">
          <h2 style="color: #0a1628; margin-bottom: 20px;">Recuperación de Contraseña</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Hola <strong>${user.nombre}</strong>,
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Recibimos una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este email.
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            Este link expirará en 1 hora. Si no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="color: #9ca3af; font-size: 11px; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
      `

      await this.notificationsService.sendEmailToUser(
        user.email,
        'Recuperación de Contraseña - AMVA Digital',
        emailBody,
        { type: 'password_reset', userId: user.id }
      )

      this.logger.log(`✅ Email de reset de contraseña enviado a: ${user.email}`)

      return {
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error en forgotPassword: ${errorMessage}`)
      // Por seguridad, siempre retornamos el mismo mensaje
      return {
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      }
    }
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      // Buscar token válido
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token: dto.token },
        include: { user: true },
      })

      if (!resetToken) {
        throw new BadRequestException('Token inválido o expirado')
      }

      if (resetToken.used) {
        throw new BadRequestException('Este token ya fue utilizado')
      }

      if (resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Token expirado. Por favor, solicita uno nuevo.')
      }

      // Hash de nueva contraseña
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

      // Actualizar contraseña y marcar token como usado
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword },
        }),
        this.prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ])

      // Enviar email de confirmación
      const emailBody = `
        <div style="text-align: center; padding: 20px;">
          <h2 style="color: #0a1628; margin-bottom: 20px;">Contraseña Restablecida</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Hola <strong>${resetToken.user.nombre}</strong>,
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Tu contraseña ha sido restablecida exitosamente. Si no realizaste este cambio, contacta inmediatamente al administrador.
          </p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/login" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Iniciar Sesión
            </a>
          </div>
        </div>
      `

      await this.notificationsService.sendEmailToUser(
        resetToken.user.email,
        'Contraseña Restablecida - AMVA Digital',
        emailBody,
        { type: 'password_reset_confirmation', userId: resetToken.userId }
      )

      this.logger.log(`✅ Contraseña restablecida para usuario: ${resetToken.user.email}`)

      return {
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error en resetPassword: ${errorMessage}`)
      throw new BadRequestException('Error al restablecer la contraseña')
    }
  }

  /**
   * Cambiar contraseña (cuando estás logueado)
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password: true, nombre: true },
      })

      if (!user) {
        throw new NotFoundException('Usuario no encontrado')
      }

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password)

      if (!isPasswordValid) {
        throw new BadRequestException('La contraseña actual es incorrecta')
      }

      // Hash de nueva contraseña
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

      // Actualizar contraseña
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      // Enviar email de confirmación
      const emailBody = `
        <div style="text-align: center; padding: 20px;">
          <h2 style="color: #0a1628; margin-bottom: 20px;">Contraseña Cambiada</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Hola <strong>${user.nombre}</strong>,
          </p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta inmediatamente al administrador.
          </p>
        </div>
      `

      await this.notificationsService.sendEmailToUser(
        user.email,
        'Contraseña Cambiada - AMVA Digital',
        emailBody,
        { type: 'password_changed', userId: user.id }
      )

      this.logger.log(`✅ Contraseña cambiada para usuario: ${user.email}`)

      return {
        message: 'Contraseña cambiada exitosamente',
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error en changePassword: ${errorMessage}`)
      throw new BadRequestException('Error al cambiar la contraseña')
    }
  }
}
