import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../../prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { LoginDto, RegisterDto, RegisterDeviceDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

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
        rol: "ADMIN",
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

  async login(dto: LoginDto) {
    try {
      console.log(`[AuthService] Intentando login para: ${dto.email}`)

      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      if (!user) {
        console.log(`[AuthService] Usuario no encontrado: ${dto.email}`)
        throw new UnauthorizedException("Credenciales inválidas")
      }

      console.log(`[AuthService] Usuario encontrado: ${user.email}, rol: ${user.rol}`)

      // Verificar que bcrypt esté funcionando
      let isPasswordValid = false
      try {
        isPasswordValid = await bcrypt.compare(dto.password, user.password)
        console.log(`[AuthService] Comparación de contraseña: ${isPasswordValid ? 'válida' : 'inválida'}`)
      } catch (bcryptError) {
        console.error(`[AuthService] Error al comparar contraseña:`, bcryptError)
        throw new UnauthorizedException("Error al procesar la autenticación")
      }

      if (!isPasswordValid) {
        console.log(`[AuthService] Contraseña inválida para: ${dto.email}`)
        throw new UnauthorizedException("Credenciales inválidas")
      }

      const token = this.generateToken(user.id, user.email, user.rol)
      console.log(`[AuthService] Login exitoso para: ${dto.email}`)

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
    } catch (error) {
      // Si ya es una excepción de NestJS, la relanzamos
      if (error instanceof UnauthorizedException) {
        throw error
      }
      // Para otros errores, los logueamos y lanzamos una excepción genérica
      console.error("[AuthService] Error en login:", error)
      throw new UnauthorizedException("Error al procesar el login")
    }
  }

  // Login para mobile con refresh token
  async loginMobile(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      if (!user) {
        throw new UnauthorizedException("Credenciales inválidas")
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException("Credenciales inválidas")
      }

      const { accessToken, refreshToken } = this.generateTokenPair(
        user.id,
        user.email,
        user.rol
      )

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
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      console.error("Error en login mobile:", error)
      throw new UnauthorizedException("Error al procesar el login")
    }
  }

  // Refrescar access token usando refresh token
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.validateRefreshToken(refreshToken)
      const user = await this.validateUser(payload.sub)

      if (!user) {
        throw new UnauthorizedException("Usuario no encontrado")
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(
        user.id,
        user.email,
        user.rol
      )

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException("Error al refrescar token")
    }
  }

  // Registrar dispositivo para notificaciones push
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    // TODO: Implementar almacenamiento de device tokens en base de datos
    // Por ahora solo retornamos éxito
    return {
      success: true,
      message: "Dispositivo registrado correctamente",
    }
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    return this.jwtService.sign(payload)
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
