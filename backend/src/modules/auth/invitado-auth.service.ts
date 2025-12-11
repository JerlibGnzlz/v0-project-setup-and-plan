import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { TokenBlacklistService } from './services/token-blacklist.service'

@Injectable()
export class InvitadoAuthService {
  private readonly logger = new Logger(InvitadoAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private tokenBlacklist: TokenBlacklistService
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
      const isPasswordValid = await bcrypt.compare(dto.password, invitadoAuth.password)

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
   *
   * @param googleId - ID único de Google del usuario
   * @param email - Email del usuario (debe estar verificado por Google)
   * @param nombre - Nombre del usuario
   * @param apellido - Apellido del usuario
   * @param fotoUrl - URL de la foto de perfil de Google (opcional)
   * @returns Tokens de acceso y datos del invitado
   * @throws BadRequestException si los datos son inválidos
   */
  async googleAuth(
    googleId: string,
    email: string,
    nombre: string,
    apellido: string,
    fotoUrl?: string
  ) {
    try {
      // Validar parámetros requeridos
      if (!googleId || !email) {
        this.logger.error('❌ Google Auth: googleId o email faltantes', {
          hasGoogleId: !!googleId,
          hasEmail: !!email
        })
        throw new BadRequestException('Datos de Google OAuth incompletos')
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        this.logger.error(`❌ Google Auth: Email inválido: ${email}`)
        throw new BadRequestException('Email inválido')
      }

      this.logger.log(`🔐 Iniciando autenticación Google OAuth para: ${email}`, {
        googleId,
        email,
        nombre,
        apellido,
        tieneFoto: !!fotoUrl,
      })
    } catch (error) {
      // Re-lanzar errores de validación
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.error('❌ Error en validación inicial de Google Auth:', error)
      throw new BadRequestException('Error al validar datos de Google OAuth')
    }

    try {
      // 1. Buscar si ya existe un invitado con este googleId
      this.logger.debug(`🔍 Buscando invitado por googleId: ${googleId}`)
      let invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { googleId },
        include: {
          invitado: true,
        },
      })

      // 2. Si no existe, buscar por email
      if (!invitadoAuth) {
        this.logger.debug(`🔍 Invitado no encontrado por googleId, buscando por email: ${email}`)
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
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(),
        10
      )

      // Crear invitado
      this.logger.log(`📸 Guardando fotoUrl de Google: ${fotoUrl || 'NO HAY FOTO'}`)

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
      if (!invitado.auth) {
        throw new Error('Error al crear autenticación para invitado')
      }
      invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { id: invitado.auth.id },
        include: {
          invitado: true,
        },
      })

      if (!invitadoAuth) {
        throw new Error('Error al obtener autenticación del invitado')
      }

      this.logger.log(`✅ Invitado creado con Google OAuth: ${email}`, {
        invitadoId: invitadoAuth.invitado.id,
        email,
        googleId,
        fotoUrlGuardada: invitadoAuth.invitado.fotoUrl,
      })
    } else {
      if (!invitadoAuth) {
        throw new Error('InvitadoAuth no encontrado')
      }

      // Actualizar último login
      await this.prisma.invitadoAuth.update({
        where: { id: invitadoAuth.id },
        data: { ultimoLogin: new Date() },
      })

      // Actualizar foto si Google proporciona una nueva o si no hay foto actual
      if (
        fotoUrl &&
        invitadoAuth.invitado &&
        (!invitadoAuth.invitado.fotoUrl || invitadoAuth.invitado.fotoUrl !== fotoUrl)
      ) {
        await this.prisma.invitado.update({
          where: { id: invitadoAuth.invitado.id },
          data: { fotoUrl },
        })
        this.logger.log(`✅ Foto de perfil actualizada para invitado: ${email}`)

        // Obtener datos actualizados
        invitadoAuth = await this.prisma.invitadoAuth.findUnique({
          where: { id: invitadoAuth.id },
          include: {
            invitado: true,
          },
        })
      }

      if (!invitadoAuth || !invitadoAuth.invitado) {
        throw new Error('Error al obtener datos del invitado')
      }

      this.logger.log(`✅ Invitado logueado con Google OAuth: ${email}`, {
        invitadoId: invitadoAuth.invitado.id,
        email,
        googleId,
        tieneFoto: !!invitadoAuth.invitado.fotoUrl,
        ultimoLogin: new Date().toISOString(),
      })
    }

      // 4. Generar tokens
      if (!invitadoAuth || !invitadoAuth.invitado) {
        this.logger.error('❌ Error al generar tokens: datos del invitado no disponibles', {
          hasInvitadoAuth: !!invitadoAuth,
          hasInvitado: !!invitadoAuth?.invitado
        })
        throw new Error('Error al generar tokens: datos del invitado no disponibles')
      }

      this.logger.debug('🔑 Generando tokens para invitado:', {
        invitadoId: invitadoAuth.invitado.id,
        email: invitadoAuth.email
      })

      const { accessToken, refreshToken } = this.generateTokenPair(
        invitadoAuth.invitado.id,
        invitadoAuth.email,
        'INVITADO'
      )

      this.logger.log(`✅ Tokens generados exitosamente para: ${email}`)

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
    } catch (error) {
      // Log detallado del error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      this.logger.error(`❌ Error en googleAuth: ${errorMessage}`, {
        error: errorMessage,
        stack: errorStack,
        errorType: error?.constructor?.name,
        googleId,
        email
      })

      // Si es un error de Prisma, loguear más detalles
      if (error && typeof error === 'object' && 'code' in error) {
        this.logger.error('❌ Error de Prisma en googleAuth:', {
          code: (error as { code?: string }).code,
          meta: (error as { meta?: unknown }).meta
        })
      }

      // Re-lanzar errores de BadRequestException
      if (error instanceof BadRequestException) {
        throw error
      }

      // Re-lanzar otros errores
      throw error
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

      this.logger.log(`✅ Logout exitoso de invitado`, {
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`❌ Error en logout de invitado:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      // No lanzar error, logout debe siempre tener éxito
    }
  }
}
