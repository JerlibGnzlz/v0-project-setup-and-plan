import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import {
  PastorRegisterDto,
  PastorLoginDto,
  PastorForgotPasswordDto,
  PastorResetPasswordDto,
  PastorCompleteRegisterDto,
} from './dto/pastor-auth.dto'

@Injectable()
export class PastorAuthService {
  private readonly logger = new Logger(PastorAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registro de pastor - Verifica que el email existe en la tabla Pastores
   */
  async register(dto: PastorRegisterDto) {
    // 1. Verificar que el email existe en la tabla Pastores
    const pastor = await this.prisma.pastor.findUnique({
      where: { email: dto.email },
    })

    if (!pastor) {
      throw new BadRequestException(
        'Tu email no está registrado en nuestro sistema. Por favor, contacta a la administración para registrarte.'
      )
    }

    // 2. Verificar que el pastor está activo
    if (!pastor.activo) {
      throw new BadRequestException(
        'Tu cuenta de pastor está inactiva. Por favor, contacta a la administración.'
      )
    }

    // 3. Verificar que no existe ya una cuenta de autenticación
    const existingAuth = await this.prisma.pastorAuth.findUnique({
      where: { email: dto.email },
    })

    if (existingAuth) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      )
    }

    // 4. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 5. Crear registro de autenticación
    const pastorAuth = await this.prisma.pastorAuth.create({
      data: {
        pastorId: pastor.id,
        email: dto.email,
        password: hashedPassword,
        emailVerificado: false, // Se puede implementar verificación por email después
      },
      include: {
        pastor: true,
      },
    })

    // 6. Generar tokens
    const { accessToken, refreshToken } = this.generateTokenPair(
      pastor.id,
      pastor.email || '',
      'PASTOR'
    )

    this.logger.log(`✅ Pastor registrado: ${pastor.email}`)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      pastor: {
        id: pastor.id,
        nombre: pastor.nombre,
        apellido: pastor.apellido,
        email: pastor.email,
        tipo: pastor.tipo,
        cargo: pastor.cargo,
        ministerio: pastor.ministerio,
        sede: pastor.sede,
        region: pastor.region,
        pais: pastor.pais,
        fotoUrl: pastor.fotoUrl,
      },
    }
  }

  /**
   * Registro completo de pastor desde cero (para convenciones)
   * Crea el pastor en la base de datos y su autenticación
   */
  async registerComplete(dto: PastorCompleteRegisterDto) {
    // 1. Verificar que el email no existe ya
    const existingPastor = await this.prisma.pastor.findUnique({
      where: { email: dto.email },
    })

    if (existingPastor) {
      throw new BadRequestException(
        'Ya existe un pastor registrado con este email. Por favor, inicia sesión.'
      )
    }

    // 2. Verificar que no existe ya una cuenta de autenticación
    const existingAuth = await this.prisma.pastorAuth.findUnique({
      where: { email: dto.email },
    })

    if (existingAuth) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      )
    }

    // 3. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 4. Crear el pastor en la base de datos
    const pastor = await this.prisma.pastor.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        telefono: dto.telefono,
        sede: dto.sede,
        tipo: 'PASTOR', // Por defecto es PASTOR
        activo: true, // Activo por defecto
        mostrarEnLanding: false, // No se muestra en landing por defecto
      },
    })

    // 5. Crear registro de autenticación
    await this.prisma.pastorAuth.create({
      data: {
        pastorId: pastor.id,
        email: dto.email,
        password: hashedPassword,
        emailVerificado: false,
      },
    })

    this.logger.log(`✅ Pastor creado desde cero: ${pastor.email}`)

    return {
      message: 'Pastor registrado exitosamente. Por favor, inicia sesión.',
      pastor: {
        id: pastor.id,
        nombre: pastor.nombre,
        apellido: pastor.apellido,
        email: pastor.email,
      },
    }
  }

  /**
   * Login de pastor
   */
  async login(dto: PastorLoginDto) {
    try {
      // 1. Buscar autenticación
      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { email: dto.email },
        include: {
          pastor: true,
        },
      })

      if (!pastorAuth) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // 2. Verificar que el pastor está activo
      if (!pastorAuth.pastor.activo) {
        throw new UnauthorizedException(
          'Tu cuenta de pastor está inactiva. Por favor, contacta a la administración.'
        )
      }

      // 3. Verificar contraseña
      const isPasswordValid = await bcrypt.compare(
        dto.password,
        pastorAuth.password
      )

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // 4. Actualizar último login
      await this.prisma.pastorAuth.update({
        where: { id: pastorAuth.id },
        data: { ultimoLogin: new Date() },
      })

      // 5. Generar tokens
      const { accessToken, refreshToken } = this.generateTokenPair(
        pastorAuth.pastor.id,
        pastorAuth.email,
        'PASTOR'
      )

      this.logger.log(`✅ Pastor logueado: ${pastorAuth.email}`)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        pastor: {
          id: pastorAuth.pastor.id,
          nombre: pastorAuth.pastor.nombre,
          apellido: pastorAuth.pastor.apellido,
          email: pastorAuth.pastor.email,
          tipo: pastorAuth.pastor.tipo,
          cargo: pastorAuth.pastor.cargo,
          ministerio: pastorAuth.pastor.ministerio,
          sede: pastorAuth.pastor.sede,
          region: pastorAuth.pastor.region,
          pais: pastorAuth.pastor.pais,
          fotoUrl: pastorAuth.pastor.fotoUrl,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }
      this.logger.error('Error en login de pastor:', error)
      throw new UnauthorizedException('Error al procesar el login')
    }
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  private generateTokenPair(pastorId: string, email: string, role: string) {
    const accessPayload = { sub: pastorId, email, role, type: 'access' }
    const refreshPayload = { sub: pastorId, email, role, type: 'refresh' }

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: '30d' }),
    }
  }

  /**
   * Refrescar access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken)
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido')
      }

      // Verificar que el pastor existe y está activo
      const pastor = await this.prisma.pastor.findUnique({
        where: { id: payload.sub },
      })

      if (!pastor || !pastor.activo) {
        throw new UnauthorizedException('Pastor no encontrado o inactivo')
      }

      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { pastorId: pastor.id },
      })

      if (!pastorAuth) {
        throw new UnauthorizedException('Autenticación no encontrada')
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(
        pastor.id,
        pastor.email || '',
        'PASTOR'
      )

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }
  }

  /**
   * Validar usuario desde JWT payload
   */
  async validatePastor(pastorId: string) {
    const pastor = await this.prisma.pastor.findUnique({
      where: { id: pastorId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipo: true,
        cargo: true,
        ministerio: true,
        sede: true,
        region: true,
        pais: true,
        fotoUrl: true,
        activo: true,
      },
    })

    if (!pastor || !pastor.activo) {
      return null
    }

    return pastor
  }

  /**
   * Solicitar recuperación de contraseña (futuro)
   */
  async forgotPassword(dto: PastorForgotPasswordDto) {
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email: dto.email },
    })

    if (!pastorAuth) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      }
    }

    // TODO: Implementar envío de email con token de recuperación
    // Por ahora solo retornamos éxito
    return {
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
    }
  }

  /**
   * Resetear contraseña (futuro)
   */
  async resetPassword(dto: PastorResetPasswordDto) {
    // TODO: Implementar validación de token y reset de contraseña
    throw new BadRequestException('Funcionalidad en desarrollo')
  }
}

