import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../../prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { LoginDto, RegisterDto } from "./dto/auth.dto"

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
    } catch (error) {
      // Si ya es una excepción de NestJS, la relanzamos
      if (error instanceof UnauthorizedException) {
        throw error
      }
      // Para otros errores, los logueamos y lanzamos una excepción genérica
      console.error("Error en login:", error)
      throw new UnauthorizedException("Error al procesar el login")
    }
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    return this.jwtService.sign(payload)
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nombre: true, rol: true, avatar: true },
    })
  }
}
