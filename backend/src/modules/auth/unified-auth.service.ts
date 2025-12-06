import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

/**
 * Servicio unificado de autenticación
 * Busca tanto en pastores como en invitados
 */
@Injectable()
export class UnifiedAuthService {
  private readonly logger = new Logger(UnifiedAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  /**
   * Login unificado: busca en pastores e invitados
   */
  async loginUnified(email: string, password: string) {
    // 1. Intentar buscar en pastores primero
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email },
      include: {
        pastor: true,
      },
    })

    if (pastorAuth) {
      // Verificar que el pastor está activo
      if (!pastorAuth.pastor.activo) {
        throw new UnauthorizedException(
          'Tu cuenta está inactiva. Por favor, contacta a la administración.'
        )
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, pastorAuth.password)
      if (!isPasswordValid) {
        this.logger.warn(`❌ Login fallido: contraseña inválida para pastor`, {
          email,
          pastorId: pastorAuth.pastor.id,
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException(
          'La contraseña es incorrecta. Por favor, verifica tus credenciales.'
        )
      }

      // Actualizar último login
      await this.prisma.pastorAuth.update({
        where: { id: pastorAuth.id },
        data: { ultimoLogin: new Date() },
      })

      // Generar tokens
      const { accessToken, refreshToken } = this.generateTokenPair(
        pastorAuth.pastor.id,
        pastorAuth.email,
        'PASTOR'
      )

      this.logger.log(`✅ Pastor logueado: ${pastorAuth.email}`)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: pastorAuth.pastor.id,
          nombre: pastorAuth.pastor.nombre,
          apellido: pastorAuth.pastor.apellido,
          email: pastorAuth.pastor.email,
          telefono: pastorAuth.pastor.telefono,
          sede: pastorAuth.pastor.sede,
          tipo: 'PASTOR',
          role: 'PASTOR',
        },
      }
    }

    // 2. Si no es pastor, buscar en invitados
    const invitadoAuth = await this.prisma.invitadoAuth.findUnique({
      where: { email },
      include: {
        invitado: true,
      },
    })

    if (invitadoAuth) {
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, invitadoAuth.password)
      if (!isPasswordValid) {
        this.logger.warn(`❌ Login fallido: contraseña inválida para invitado`, {
          email,
          invitadoId: invitadoAuth.invitado.id,
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException(
          'La contraseña es incorrecta. Por favor, verifica tus credenciales.'
        )
      }

      // Actualizar último login
      await this.prisma.invitadoAuth.update({
        where: { id: invitadoAuth.id },
        data: { ultimoLogin: new Date() },
      })

      // Generar tokens
      const { accessToken, refreshToken } = this.generateTokenPair(
        invitadoAuth.invitado.id,
        invitadoAuth.email,
        'INVITADO'
      )

      this.logger.log(`✅ Invitado logueado: ${invitadoAuth.email}`)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: invitadoAuth.invitado.id,
          nombre: invitadoAuth.invitado.nombre,
          apellido: invitadoAuth.invitado.apellido,
          email: invitadoAuth.invitado.email,
          telefono: invitadoAuth.invitado.telefono,
          sede: invitadoAuth.invitado.sede,
          tipo: 'INVITADO',
          role: 'INVITADO',
        },
      }
    }

    // 3. Si no se encuentra en ninguna tabla
    this.logger.warn(`❌ Login fallido: usuario no encontrado`, {
      email,
      timestamp: new Date().toISOString(),
    })
    throw new UnauthorizedException(
      'No encontramos una cuenta con este correo electrónico. Por favor, regístrate primero.'
    )
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  private generateTokenPair(userId: string, email: string, role: string) {
    const accessPayload = { sub: userId, email, role, type: 'access' }
    const refreshPayload = { sub: userId, email, role, type: 'refresh' }

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: '30d' }),
    }
  }
}
