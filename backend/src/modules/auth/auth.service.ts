import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../../prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { randomBytes } from "crypto"
import { LoginDto, RegisterDto } from "./dto/auth.dto"
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nombre: dto.name,
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
      select: { id: true, email: true, nombre: true, rol: true },
    })
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      // Por seguridad, no revelamos si el email existe o no
      if (!user) {
        // Simulamos el mismo tiempo de respuesta
        await new Promise((resolve) => setTimeout(resolve, 100))
        return {
          message: "Si el email existe, se enviará un enlace de recuperación",
        }
      }

      // Generar token único
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Expira en 1 hora

      // Eliminar tokens anteriores no usados
      await (this.prisma as any).passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      })

      // Crear nuevo token
      await (this.prisma as any).passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      // En producción, aquí enviarías un email
      // Por ahora, logueamos el token para desarrollo
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/reset-password?token=${token}`
      console.log(`🔐 Password Reset Link for ${user.email}: ${resetUrl}`)

      // TODO: Implementar envío de email real
      // await this.emailService.sendPasswordResetEmail(user.email, resetUrl)

      return {
        message: "Si el email existe, se enviará un enlace de recuperación",
        // En desarrollo, retornamos el token (eliminar en producción)
        ...(process.env.NODE_ENV === "development" && { token, resetUrl }),
      }
    } catch (error) {
      console.error("Error en requestPasswordReset:", error)
      // Por seguridad, no revelamos el error específico
      return {
        message: "Si el email existe, se enviará un enlace de recuperación",
      }
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await (this.prisma as any).passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    })

    if (!resetToken) {
      throw new BadRequestException("Token inválido o expirado")
    }

    if (resetToken.used) {
      throw new BadRequestException("Este token ya fue utilizado")
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException("Token expirado")
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // Actualizar contraseña y marcar token como usado
    await this.prisma.$transaction([
      (this.prisma as any).user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      (this.prisma as any).passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return {
      message: "Contraseña actualizada exitosamente",
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException("Usuario no encontrado")
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Contraseña actual incorrecta")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await (this.prisma as any).user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return {
      message: "Contraseña actualizada exitosamente",
    }
  }
}
