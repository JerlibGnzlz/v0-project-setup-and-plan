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
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: user.rol,
      },
      token,
    }
  }

  async login(dto: LoginDto) {
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
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: user.rol,
      },
      token,
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
}
