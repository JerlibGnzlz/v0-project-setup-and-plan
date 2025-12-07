import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common'
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
import { NotificationsService } from '../notifications/notifications.service'
import { TokenBlacklistService } from './services/token-blacklist.service'

@Injectable()
export class PastorAuthService {
  private readonly logger = new Logger(PastorAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private tokenBlacklist: TokenBlacklistService
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
   * Registro completo de pastor/invitado
   *
   * Este endpoint permite:
   * 1. Pastores organizacionales: Crear cuenta de autenticación si ya existen en estructura organizacional
   * 2. Invitados: Crear pastor con activo=false (NO aparece en estructura organizacional) + cuenta de autenticación
   *
   * Separación:
   * - Pastores organizacionales: activo=true, aparecen en /admin/pastores
   * - Invitados: activo=false, NO aparecen en estructura organizacional, solo para autenticación
   */
  async registerComplete(dto: PastorCompleteRegisterDto) {
    // 1. Verificar si el pastor ya existe
    let pastor = await this.prisma.pastor.findUnique({
      where: { email: dto.email },
    })

    const esInvitado = !pastor // Si no existe, es un invitado

    if (!pastor) {
      // 2. Si no existe, crear pastor como INVITADO (activo=false)
      // Esto permite que puedan autenticarse pero NO aparecen en estructura organizacional
      this.logger.log(`📝 Creando pastor invitado: ${dto.email}`)

      pastor = await this.prisma.pastor.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          sede: dto.sede,
          tipo: 'PASTOR',
          activo: false, // CRÍTICO: Invitados NO aparecen en estructura organizacional
          mostrarEnLanding: false, // Invitados NO se muestran en landing
        },
      })

      this.logger.log(
        `✅ Pastor invitado creado: ${pastor.id} (activo=false, NO aparece en estructura organizacional)`
      )
    } else {
      // 3. Si existe, verificar que esté activo (solo para pastores organizacionales)
      if (!pastor.activo) {
        // Si está inactivo, activarlo (puede ser un invitado que ahora se vuelve organizacional)
        await this.prisma.pastor.update({
          where: { id: pastor.id },
          data: { activo: true },
        })
        pastor.activo = true
        this.logger.log(`✅ Pastor reactivado: ${pastor.email}`)
      }
    }

    // 4. Verificar que no existe ya una cuenta de autenticación
    const existingAuth = await this.prisma.pastorAuth.findUnique({
      where: { email: dto.email },
    })

    if (existingAuth) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      )
    }

    // 5. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 6. Crear registro de autenticación
    await this.prisma.pastorAuth.create({
      data: {
        pastorId: pastor.id,
        email: dto.email,
        password: hashedPassword,
        emailVerificado: false,
      },
    })

    if (esInvitado) {
      this.logger.log(
        `✅ Cuenta de invitado creada: ${pastor.email} (NO aparece en estructura organizacional)`
      )
    } else {
      this.logger.log(`✅ Autenticación creada para pastor organizacional: ${pastor.email}`)
    }

    // 6. Enviar notificación a todos los admins sobre el nuevo registro de autenticación
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          rol: {
            in: ['ADMIN', 'EDITOR'],
          },
        },
      })

      const titulo = esInvitado
        ? '👤 Nuevo Invitado Registrado'
        : '🔐 Nuevo Registro de Autenticación'
      const mensaje = esInvitado
        ? `${pastor.nombre} ${pastor.apellido} (${pastor.email}) se ha registrado como invitado. Puede autenticarse pero NO aparece en estructura organizacional.`
        : `${pastor.nombre} ${pastor.apellido} (${pastor.email}) ha creado su cuenta de autenticación para la app móvil.`

      // Enviar notificación a cada admin
      for (const admin of admins) {
        await this.notificationsService.sendNotificationToAdmin(admin.email, titulo, mensaje, {
          type: esInvitado ? 'nuevo_invitado' : 'nuevo_pastor_auth',
          pastorId: pastor.id,
          nombre: pastor.nombre,
          apellido: pastor.apellido,
          email: pastor.email,
          esInvitado,
        })
      }

      this.logger.log(`📬 Notificaciones enviadas a ${admins.length} admin(s)`)
    } catch (error) {
      this.logger.error(`Error enviando notificaciones:`, error)
      // No fallar si la notificación falla
    }

    return {
      message: esInvitado
        ? 'Cuenta creada exitosamente. Puedes iniciar sesión y usar la app móvil.'
        : 'Cuenta de autenticación creada exitosamente. Por favor, inicia sesión.',
      pastor: {
        id: pastor.id,
        nombre: pastor.nombre,
        apellido: pastor.apellido,
        email: pastor.email,
        activo: pastor.activo,
        esInvitado,
      },
    }
  }

  /**
   * Login de pastor
   */
  async login(dto: PastorLoginDto) {
    try {
      this.logger.log(`🔐 Intentando login de pastor: ${dto.email}`, {
        email: dto.email,
        timestamp: new Date().toISOString(),
      })

      // 1. Buscar autenticación
      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { email: dto.email },
        include: {
          pastor: true,
        },
      })

      if (!pastorAuth) {
        this.logger.warn(`❌ Login fallido: pastor no encontrado`, {
          email: dto.email,
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException('Credenciales inválidas')
      }

      // 2. Verificar que el pastor está activo
      if (!pastorAuth.pastor.activo) {
        this.logger.warn(`❌ Login fallido: cuenta inactiva`, {
          email: dto.email,
          pastorId: pastorAuth.pastor.id,
          timestamp: new Date().toISOString(),
        })
        throw new UnauthorizedException(
          'Tu cuenta de pastor está inactiva. Por favor, contacta a la administración.'
        )
      }

      // 3. Verificar contraseña
      const isPasswordValid = await bcrypt.compare(dto.password, pastorAuth.password)

      if (!isPasswordValid) {
        this.logger.warn(`❌ Login fallido: contraseña inválida`, {
          email: dto.email,
          pastorId: pastorAuth.pastor.id,
          timestamp: new Date().toISOString(),
        })
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

      this.logger.log(`✅ Pastor logueado exitosamente`, {
        pastorId: pastorAuth.pastor.id,
        email: pastorAuth.email,
        timestamp: new Date().toISOString(),
      })

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
   * Refrescar access token (con rotación)
   */
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

      // Invalidar el refresh token anterior (rotación)
      await this.tokenBlacklist.addToBlacklist(refreshToken, 30 * 24 * 60 * 60) // 30 días

      // Generar nuevos tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(
        pastor.id,
        pastor.email || '',
        'PASTOR'
      )

      this.logger.log(`✅ Tokens refrescados para pastor`, {
        pastorId: pastor.id,
        email: pastor.email,
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
      throw new UnauthorizedException('Refresh token inválido o expirado')
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

      this.logger.log(`✅ Logout exitoso de pastor`, {
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.logger.error(`❌ Error en logout de pastor:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      // No lanzar error, logout debe siempre tener éxito
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
