import { Injectable, UnauthorizedException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class InvitadoAuthService {
  private readonly logger = new Logger(InvitadoAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Registro de invitado - Crea invitado y cuenta de autenticación
   */
  async register(dto: InvitadoRegisterDto) {
    // 1. Verificar que el email no existe ya
    const existingInvitado = await this.prisma.invitado.findUnique({
      where: { email: dto.email },
    })

    if (existingInvitado) {
      throw new BadRequestException(
        'Ya existe un invitado registrado con este email. Por favor, inicia sesión.'
      )
    }

    // 2. Verificar que no existe ya una cuenta de autenticación
    const existingAuth = await this.prisma.invitadoAuth.findUnique({
      where: { email: dto.email },
    })

    if (existingAuth) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      )
    }

    // 3. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 4. Crear invitado y autenticación
    const invitado = await this.prisma.invitado.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        telefono: dto.telefono,
        sede: dto.sede,
        auth: {
          create: {
            email: dto.email,
            password: hashedPassword,
            emailVerificado: false,
          },
        },
      },
      include: {
        auth: true,
      },
    })

    this.logger.log(`✅ Invitado registrado: ${invitado.email}`)

    // 5. Generar tokens
    const { accessToken, refreshToken } = this.generateTokenPair(
      invitado.id,
      invitado.email,
      'INVITADO'
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      invitado: {
        id: invitado.id,
        nombre: invitado.nombre,
        apellido: invitado.apellido,
        email: invitado.email,
        telefono: invitado.telefono,
        sede: invitado.sede,
      },
    }
  }

  /**
   * Registro completo de invitado (desde inscripción)
   */
  async registerComplete(dto: InvitadoCompleteRegisterDto) {
    // 1. Verificar si el invitado ya existe (por email de inscripción)
    let invitado = await this.prisma.invitado.findUnique({
      where: { email: dto.email },
    })

    if (!invitado) {
      // Crear invitado si no existe
      invitado = await this.prisma.invitado.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          sede: dto.sede,
        },
      })
      this.logger.log(`✅ Invitado creado desde registro completo: ${invitado.email}`)
    }

    // 2. Verificar que no existe ya una cuenta de autenticación
    const existingAuth = await this.prisma.invitadoAuth.findUnique({
      where: { email: dto.email },
    })

    if (existingAuth) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      )
    }

    // 3. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 4. Crear registro de autenticación
    await this.prisma.invitadoAuth.create({
      data: {
        invitadoId: invitado.id,
        email: dto.email,
        password: hashedPassword,
        emailVerificado: false,
      },
    })

    this.logger.log(`✅ Autenticación creada para invitado: ${invitado.email}`)

    // 5. Generar tokens
    const { accessToken, refreshToken } = this.generateTokenPair(
      invitado.id,
      invitado.email,
      'INVITADO'
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      invitado: {
        id: invitado.id,
        nombre: invitado.nombre,
        apellido: invitado.apellido,
        email: invitado.email,
      },
    }
  }

  /**
   * Login de invitado
   */
  async login(dto: InvitadoLoginDto) {
    try {
      // 1. Buscar autenticación
      const invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { email: dto.email },
        include: {
          invitado: true,
        },
      })

      if (!invitadoAuth) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // 2. Verificar contraseña
      const isPasswordValid = await bcrypt.compare(
        dto.password,
        invitadoAuth.password
      )

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // 3. Actualizar último login
      await this.prisma.invitadoAuth.update({
        where: { id: invitadoAuth.id },
        data: { ultimoLogin: new Date() },
      })

      // 4. Generar tokens
      const { accessToken, refreshToken } = this.generateTokenPair(
        invitadoAuth.invitado.id,
        invitadoAuth.email,
        'INVITADO'
      )

      this.logger.log(`✅ Invitado logueado: ${invitadoAuth.email}`)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        invitado: {
          id: invitadoAuth.invitado.id,
          nombre: invitadoAuth.invitado.nombre,
          apellido: invitadoAuth.invitado.apellido,
          email: invitadoAuth.invitado.email,
          telefono: invitadoAuth.invitado.telefono,
          sede: invitadoAuth.invitado.sede,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      this.logger.error('Error en login de invitado:', error)
      throw new UnauthorizedException('Error al procesar el login')
    }
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  private generateTokenPair(invitadoId: string, email: string, role: string) {
    const accessPayload = { sub: invitadoId, email, role, type: 'access' }
    const refreshPayload = { sub: invitadoId, email, role, type: 'refresh' }

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: '30d' }),
    }
  }

  /**
   * Validar invitado desde JWT payload
   */
  async validateInvitado(invitadoId: string) {
    const invitado = await this.prisma.invitado.findUnique({
      where: { id: invitadoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        sede: true,
        fotoUrl: true,
      },
    })

    if (!invitado) {
      return null
    }

    return invitado
  }

  /**
   * Autenticación con Google OAuth
   */
  async googleAuth(googleId: string, email: string, nombre: string, apellido: string, fotoUrl?: string) {
    // 1. Buscar si ya existe un invitado con este googleId
    let invitadoAuth = await this.prisma.invitadoAuth.findUnique({
      where: { googleId },
      include: {
        invitado: true,
      },
    })

    // 2. Si no existe, buscar por email
    if (!invitadoAuth) {
      invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { email },
        include: {
          invitado: true,
        },
      })

      // Si existe por email pero no tiene googleId, actualizarlo
      if (invitadoAuth && !invitadoAuth.googleId) {
        // Actualizar auth con googleId
        await this.prisma.invitadoAuth.update({
          where: { id: invitadoAuth.id },
          data: { googleId },
        })
        
        // Actualizar invitado con foto si no tiene y Google proporciona una
        if (fotoUrl && !invitadoAuth.invitado.fotoUrl) {
          await this.prisma.invitado.update({
            where: { id: invitadoAuth.invitado.id },
            data: { fotoUrl },
          })
        }
        
        // Obtener datos actualizados
        invitadoAuth = await this.prisma.invitadoAuth.findUnique({
          where: { id: invitadoAuth.id },
          include: {
            invitado: true,
          },
        })
      }
    }

    // 3. Si no existe, crear nuevo invitado y auth
    if (!invitadoAuth) {
      // Generar una contraseña aleatoria (no se usará, pero es requerida por el schema)
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10)
      
      // Crear invitado
      const invitado = await this.prisma.invitado.create({
        data: {
          nombre,
          apellido,
          email,
          fotoUrl: fotoUrl || null, // Guardar foto de Google si existe
          auth: {
            create: {
              email,
              password: randomPassword, // Contraseña aleatoria (no se usará para OAuth)
              googleId,
              emailVerificado: true, // Google ya verificó el email
            },
          },
        },
        include: {
          auth: true,
        },
      })

      // Obtener el auth con la relación invitado incluida
      invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { id: invitado.auth.id },
        include: {
          invitado: true,
        },
      })

      this.logger.log(`✅ Invitado creado con Google OAuth: ${email}`)
    } else {
      // Actualizar último login
      await this.prisma.invitadoAuth.update({
        where: { id: invitadoAuth.id },
        data: { ultimoLogin: new Date() },
      })

      this.logger.log(`✅ Invitado logueado con Google OAuth: ${email}`)
    }

    // 4. Generar tokens
    const { accessToken, refreshToken } = this.generateTokenPair(
      invitadoAuth.invitado.id,
      invitadoAuth.email,
      'INVITADO'
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      invitado: {
        id: invitadoAuth.invitado.id,
        nombre: invitadoAuth.invitado.nombre,
        apellido: invitadoAuth.invitado.apellido,
        email: invitadoAuth.invitado.email,
        telefono: invitadoAuth.invitado.telefono,
        sede: invitadoAuth.invitado.sede,
        fotoUrl: invitadoAuth.invitado.fotoUrl,
      },
    }
  }
}



