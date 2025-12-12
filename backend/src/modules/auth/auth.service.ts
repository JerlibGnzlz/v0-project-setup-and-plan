import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginDto, RegisterDto, RegisterDeviceDto } from './dto/auth.dto'
import { TokenBlacklistService } from './services/token-blacklist.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenBlacklist: TokenBlacklistService
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
        this.logger.warn(`❌ Login fallido: usuario no encontrado`, {
          email: dto.email,
          ip: clientIp || 'unknown',
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Credenciales inválidas')
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

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    // Access token con expiración corta (15 minutos) para mayor seguridad
    return this.jwtService.sign(payload, { expiresIn: '15m' })
  }

  // Generar refresh token (preparado para mobile)
  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, type: 'refresh' }
    return this.jwtService.sign(payload, { expiresIn: '30d' })
  }

  // Generar ambos tokens (access + refresh) para mobile
  generateTokenPair(userId: string, email: string, role: string) {
    return {
      accessToken: this.generateToken(userId, email, role),
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
}
