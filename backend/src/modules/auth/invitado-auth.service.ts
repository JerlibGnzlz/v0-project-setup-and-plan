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
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import {
  GoogleOAuthAuthorizeResponse,
  GoogleOAuthTokenResponse,
} from './dto/google-oauth-proxy.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { TokenBlacklistService } from './services/token-blacklist.service'

@Injectable()
export class InvitadoAuthService {
  private readonly logger = new Logger(InvitadoAuthService.name)
  private readonly googleClient: OAuth2Client | null

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private tokenBlacklist: TokenBlacklistService
  ) {
    // Inicializar cliente de Google si está configurado
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId)
      this.logger.log('✅ Google OAuth2Client inicializado para verificación de tokens')
    } else {
      this.googleClient = null
      this.logger.warn('⚠️ GOOGLE_CLIENT_ID no configurado, verificación de tokens de Google deshabilitada')
    }
  }

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

      // 4. Registrar token de dispositivo si se proporciona (para push notifications)
      if (dto.deviceToken && dto.platform) {
        try {
          await this.notificationsService.registerInvitadoDeviceToken(
            invitadoAuth.invitado.id,
            dto.deviceToken,
            dto.platform,
            dto.deviceId
          )
          this.logger.log(`📱 Token de dispositivo registrado para invitado: ${invitadoAuth.email}`)
        } catch (tokenError) {
          // No fallar el login si el registro del token falla
          this.logger.warn(`⚠️ Error registrando token de dispositivo:`, tokenError)
        }
      }

      // 5. Generar tokens
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

      // Verificar que el invitado existe
      const invitado = await this.prisma.invitado.findUnique({
        where: { id: payload.sub },
      })

      if (!invitado) {
        throw new UnauthorizedException('Invitado no encontrado')
      }

      const invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { invitadoId: invitado.id },
      })

      if (!invitadoAuth) {
        throw new UnauthorizedException('Autenticación de invitado no encontrada')
      }

      // Generar nuevos tokens (rotación)
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(
        invitado.id,
        invitado.email,
        'invitado'
      )

      // Invalidar el refresh token anterior (rotación de seguridad)
      await this.tokenBlacklist.addToBlacklist(refreshToken, 30 * 24 * 60 * 60) // 30 días

      this.logger.log(`✅ Token refrescado para invitado: ${invitado.email}`)

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        invitado: {
          id: invitado.id,
          nombre: invitado.nombre,
          apellido: invitado.apellido,
          email: invitado.email,
          telefono: invitado.telefono,
          sede: invitado.sede,
          fotoUrl: invitado.fotoUrl,
          tipo: 'INVITADO',
        },
      }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error refrescando token de invitado: ${errorMessage}`)
      throw new UnauthorizedException('Error al refrescar token')
    }
  }

  /**
   * Validar invitado desde JWT payload
   */
  async validateInvitado(invitadoId: string) {
    try {
      this.logger.log(`🔐 validateInvitado: Buscando invitado con ID: ${invitadoId}`)
      
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
        this.logger.warn(`⚠️ Invitado no encontrado con ID: ${invitadoId}`)
        return null
      }

      this.logger.log(`✅ Invitado encontrado: ${invitado.id} (${invitado.email})`)
      return invitado
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`❌ Error en validateInvitado: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      throw error
    }
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

    // Declarar invitadoAuth fuera del try para que esté disponible en todo el método
    type InvitadoAuthWithInvitado = Prisma.InvitadoAuthGetPayload<{
      include: { invitado: true }
    }>
    let invitadoAuth: InvitadoAuthWithInvitado | null = null

    try {
      // 1. Buscar si ya existe un invitado con este googleId
      this.logger.debug(`🔍 Buscando invitado por googleId: ${googleId}`)
      invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { googleId },
        include: {
          invitado: true,
        },
      })

      // 2. Si no existe, buscar por email en InvitadoAuth
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
          this.logger.log(`🔄 Actualizando invitado existente con googleId: ${email}`)
          // Actualizar auth con googleId
          await this.prisma.invitadoAuth.update({
            where: { id: invitadoAuth.id },
            data: { googleId },
          })

          // Actualizar invitado con foto si no tiene y Google proporciona una
          if (fotoUrl && invitadoAuth.invitado && !invitadoAuth.invitado.fotoUrl) {
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
      } else {
        this.logger.log(`✅ Invitado encontrado por googleId: ${email}`)
      }

      // 3. Si no existe InvitadoAuth, verificar si existe Invitado con ese email
      // (puede haber sido creado desde otra fuente como inscripción)
      if (!invitadoAuth) {
        this.logger.debug(`🔍 No se encontró InvitadoAuth, verificando si existe Invitado con email: ${email}`)
        const invitadoExistente = await this.prisma.invitado.findUnique({
          where: { email },
          include: {
            auth: true,
          },
        })

        if (invitadoExistente) {
          // Si el invitado existe pero no tiene auth, crear el auth
          if (!invitadoExistente.auth) {
            this.logger.log(`📝 Creando InvitadoAuth para invitado existente: ${email}`)
            const randomPassword = await bcrypt.hash(
              Math.random().toString(36) + Date.now().toString(),
              10
            )

            const nuevoAuth = await this.prisma.invitadoAuth.create({
              data: {
                invitadoId: invitadoExistente.id,
                email,
                password: randomPassword,
                googleId,
                emailVerificado: true,
              },
              include: {
                invitado: true,
              },
            })

            // Actualizar foto si no tiene y Google proporciona una
            if (fotoUrl && !invitadoExistente.fotoUrl) {
              await this.prisma.invitado.update({
                where: { id: invitadoExistente.id },
                data: { fotoUrl },
              })
              // Obtener datos actualizados con foto
              invitadoAuth = await this.prisma.invitadoAuth.findUnique({
                where: { id: nuevoAuth.id },
                include: {
                  invitado: true,
                },
              })
            } else {
              invitadoAuth = nuevoAuth
            }
          } else {
            // Si tiene auth pero no tiene googleId, actualizarlo
            this.logger.log(`🔄 Actualizando InvitadoAuth existente con googleId: ${email}`)
            await this.prisma.invitadoAuth.update({
              where: { id: invitadoExistente.auth.id },
              data: { googleId },
            })

            // Actualizar foto si no tiene y Google proporciona una
            if (fotoUrl && !invitadoExistente.fotoUrl) {
              await this.prisma.invitado.update({
                where: { id: invitadoExistente.id },
                data: { fotoUrl },
              })
            }

            invitadoAuth = await this.prisma.invitadoAuth.findUnique({
              where: { id: invitadoExistente.auth.id },
              include: {
                invitado: true,
              },
            })
          }
        }
      }

      // 4. Si aún no existe, verificar UNA VEZ MÁS antes de crear (evitar race conditions)
      if (!invitadoAuth) {
        // Verificación final antes de crear para evitar race conditions
        this.logger.debug(`🔍 Verificación final antes de crear: buscando Invitado con email: ${email}`)
        const verificacionFinal = await this.prisma.invitado.findUnique({
          where: { email },
          include: {
            auth: true,
          },
        })

        if (verificacionFinal) {
          this.logger.log(`⚠️ Invitado encontrado en verificación final (posible race condition): ${email}`)
          // Si tiene auth, actualizar googleId
          if (verificacionFinal.auth) {
            if (!verificacionFinal.auth.googleId) {
              await this.prisma.invitadoAuth.update({
                where: { id: verificacionFinal.auth.id },
                data: { googleId },
              })
            }
            invitadoAuth = await this.prisma.invitadoAuth.findUnique({
              where: { id: verificacionFinal.auth.id },
              include: {
                invitado: true,
              },
            })
          } else {
            // Crear auth para invitado existente
            const randomPassword = await bcrypt.hash(
              Math.random().toString(36) + Date.now().toString(),
              10
            )
            const nuevoAuth = await this.prisma.invitadoAuth.create({
              data: {
                invitadoId: verificacionFinal.id,
                email,
                password: randomPassword,
                googleId,
                emailVerificado: true,
              },
              include: {
                invitado: true,
              },
            })
            invitadoAuth = nuevoAuth
          }
        }
      }

      // 5. Si AÚN no existe, crear nuevo invitado y auth
      if (!invitadoAuth) {
        try {
          this.logger.log(`📝 Creando nuevo invitado con Google OAuth: ${email}`)
          // Generar una contraseña aleatoria (no se usará, pero es requerida por el schema)
          const randomPassword = await bcrypt.hash(
            Math.random().toString(36) + Date.now().toString(),
            10
          )

          // Crear invitado
          this.logger.log(`📸 Guardando fotoUrl de Google: ${fotoUrl || 'NO HAY FOTO'}`)

          // Asegurar que nombre y apellido tengan valores válidos (apellido puede estar vacío)
          const nombreFinal = nombre.trim() || email.split('@')[0] || 'Usuario'
          const apellidoFinal = apellido.trim() || '' // Apellido vacío es válido según el schema

          this.logger.log(`📝 Creando invitado con datos:`, {
            nombre: nombreFinal,
            apellido: apellidoFinal || '(vacío)',
            email,
            tieneFoto: !!fotoUrl
          })

          const invitado = await this.prisma.invitado.create({
            data: {
              nombre: nombreFinal,
              apellido: apellidoFinal,
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
            this.logger.error('❌ Error: invitado.auth es null después de crear')
            throw new Error('Error al crear autenticación para invitado')
          }

          invitadoAuth = await this.prisma.invitadoAuth.findUnique({
            where: { id: invitado.auth.id },
            include: {
              invitado: true,
            },
          })

          if (!invitadoAuth) {
            this.logger.error('❌ Error: No se pudo obtener invitadoAuth después de crear')
            throw new Error('Error al obtener autenticación del invitado')
          }

          this.logger.log(`✅ Invitado creado con Google OAuth: ${email}`, {
            invitadoId: invitadoAuth.invitado.id,
            email,
            googleId,
            fotoUrlGuardada: invitadoAuth.invitado.fotoUrl,
          })
        } catch (error: unknown) {
          this.logger.error('❌ Error al crear invitado:', error)
          
          // Si es un error de constraint único (email duplicado), intentar recuperar el invitado existente
          if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code?: string; meta?: { target?: string[] } }
            this.logger.error('❌ Error de Prisma:', {
              code: prismaError.code,
              meta: prismaError.meta
            })
            
            // Si es un error de constraint único en email, buscar el invitado existente
            if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
              this.logger.log(`🔄 Error de constraint único detectado, buscando invitado existente: ${email}`)
              try {
                const invitadoExistente = await this.prisma.invitado.findUnique({
                  where: { email },
                  include: {
                    auth: true,
                  },
                })
                
                if (invitadoExistente) {
                  this.logger.log(`✅ Invitado existente encontrado: ${email}`)
                  
                  // Si tiene auth, actualizar googleId si falta
                  if (invitadoExistente.auth) {
                    if (!invitadoExistente.auth.googleId) {
                      await this.prisma.invitadoAuth.update({
                        where: { id: invitadoExistente.auth.id },
                        data: { googleId },
                      })
                    }
                    invitadoAuth = await this.prisma.invitadoAuth.findUnique({
                      where: { id: invitadoExistente.auth.id },
                      include: {
                        invitado: true,
                      },
                    })
                  } else {
                    // Crear auth para invitado existente
                    const randomPassword = await bcrypt.hash(
                      Math.random().toString(36) + Date.now().toString(),
                      10
                    )
                    const nuevoAuth = await this.prisma.invitadoAuth.create({
                      data: {
                        invitadoId: invitadoExistente.id,
                        email,
                        password: randomPassword,
                        googleId,
                        emailVerificado: true,
                      },
                      include: {
                        invitado: true,
                      },
                    })
                    invitadoAuth = nuevoAuth
                  }
                  
                  // Si se recuperó exitosamente, continuar con el flujo normal
                  if (invitadoAuth) {
                    this.logger.log(`✅ Invitado recuperado exitosamente: ${email}`)
                    // No lanzar error, continuar con el flujo
                  } else {
                    throw error
                  }
                } else {
                  // Si no se encuentra el invitado, lanzar el error original
                  throw error
                }
              } catch (recoveryError) {
                this.logger.error('❌ Error al recuperar invitado existente:', recoveryError)
                throw error // Lanzar el error original
              }
            } else {
              // Si no es un error de constraint único, lanzar el error original
              throw error
            }
          } else {
            throw error
          }
        }
      }

      // 5. Si tenemos invitadoAuth (ya existía o fue recuperado), actualizar último login
      if (invitadoAuth) {
        if (!invitadoAuth.invitado) {
          throw new Error('InvitadoAuth no tiene invitado asociado')
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
      } else {
        throw new Error('InvitadoAuth no encontrado después de todos los intentos')
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
        googleId: googleId,
        email: email
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
          | { exp?: number;[key: string]: unknown }
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

  /**
   * Autenticación con Google usando token de ID (para móvil)
   *
   * @param idToken - Token de ID de Google
   * @param deviceToken - Token de dispositivo para push notifications (opcional)
   * @param platform - Plataforma del dispositivo (opcional)
   * @param deviceId - ID único del dispositivo (opcional)
   * @returns Tokens de acceso y datos del invitado
   * @throws BadRequestException si el token es inválido
   */
  async googleAuthMobile(
    idToken: string,
    deviceToken?: string,
    platform?: 'ios' | 'android',
    deviceId?: string
  ) {
    try {
      if (!this.googleClient) {
        this.logger.error('❌ Google OAuth no configurado')
        throw new BadRequestException('Google OAuth no está configurado')
      }

      if (!idToken) {
        this.logger.error('❌ Google Auth Mobile: idToken faltante')
        throw new BadRequestException('Token de Google requerido')
      }

      this.logger.log('🔐 Verificando token de ID de Google...')

      // Verificar el token con Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (!payload) {
        this.logger.error('❌ Google Auth Mobile: Payload inválido')
        throw new BadRequestException('Token de Google inválido')
      }

      // Validar que el email esté verificado
      if (!payload.email_verified) {
        this.logger.error(`❌ Google Auth Mobile: Email no verificado: ${payload.email}`)
        throw new BadRequestException('Email de Google no verificado')
      }

      // Extraer datos del usuario
      const googleId = payload.sub
      const email = payload.email
      if (!email || !googleId) {
        this.logger.error('❌ Google Auth Mobile: Email o googleId faltantes')
        throw new BadRequestException('Datos de Google incompletos')
      }

      // Extraer nombre y apellido
      let nombre = payload.given_name || payload.name?.split(' ')[0] || ''
      let apellido = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || ''

      // Si no hay apellido pero hay nombre completo, usar la última palabra como apellido
      if (!apellido && payload.name) {
        const parts = payload.name.trim().split(/\s+/)
        if (parts.length > 1) {
          nombre = parts[0] || ''
          apellido = parts.slice(1).join(' ') || ''
        }
      }

      // Si aún no hay nombre ni apellido, usar el email como fallback
      if (!nombre && !apellido) {
        nombre = email.split('@')[0] || 'Usuario'
        apellido = ''
      }

      // Asegurar que al menos nombre tenga un valor
      if (!nombre) {
        nombre = email.split('@')[0] || 'Usuario'
      }

      // Obtener foto del perfil
      const fotoUrl = payload.picture || undefined

      this.logger.log(`✅ Token de Google verificado para: ${email}`, {
        googleId,
        nombre,
        apellido,
        tieneFoto: !!fotoUrl,
      })

      // Usar el método googleAuth existente
      const result = await this.googleAuth(googleId, email, nombre, apellido, fotoUrl)

      // Registrar token de dispositivo si se proporciona
      if (deviceToken && platform && result.invitado) {
        try {
          await this.notificationsService.registerInvitadoDeviceToken(
            result.invitado.id,
            deviceToken,
            platform,
            deviceId
          )
          this.logger.log(`📱 Token de dispositivo registrado para invitado: ${email}`)
        } catch (tokenError) {
          // No fallar el login si el registro del token falla
          this.logger.warn(`⚠️ Error registrando token de dispositivo:`, tokenError)
        }
      }

      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined

      this.logger.error(`❌ Error en googleAuthMobile: ${errorMessage}`, {
        error: errorMessage,
        stack: errorStack,
        errorType: error?.constructor?.name,
      })

      // Re-lanzar errores de BadRequestException
      if (error instanceof BadRequestException) {
        throw error
      }

      // Re-lanzar otros errores
      throw new BadRequestException(`Error al autenticar con Google: ${errorMessage}`)
    }
  }

  /**
   * Generar URL de autorización de Google OAuth para backend proxy
   * El móvil abrirá esta URL y Google redirigirá al callback del backend
   */
  async generateGoogleOAuthUrl(redirectUri?: string): Promise<GoogleOAuthAuthorizeResponse> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!googleClientId || !googleClientSecret) {
      throw new BadRequestException('Google OAuth no está configurado en el backend')
    }

    // Generar state aleatorio para seguridad
    const state = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64url')

    // Construir callback URL del backend
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    // Incluir mobileRedirectUri en el callback para que el backend sepa dónde redirigir
    const mobileRedirectUri = 'amva-app://google-oauth-callback'
    const baseCallbackUrl = redirectUri || `${backendUrl}/api/auth/invitado/google/callback-proxy`
    const callbackUrl = `${baseCallbackUrl}${baseCallbackUrl.includes('?') ? '&' : '?'}mobileRedirectUri=${encodeURIComponent(mobileRedirectUri)}`

    // Construir URL de autorización de Google
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent',
      state,
    })

    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    this.logger.log('🔗 URL de autorización Google generada', {
      callbackUrl,
      hasState: !!state,
    })

    return {
      authorizationUrl,
      state,
    }
  }

  /**
   * Intercambiar código de autorización por id_token de Google
   * Este método se llama desde el callback del backend después de que Google redirige
   */
  async exchangeCodeForIdToken(
    code: string,
    redirectUri?: string
  ): Promise<GoogleOAuthTokenResponse> {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!googleClientId || !googleClientSecret) {
      throw new BadRequestException('Google OAuth no está configurado en el backend')
    }

    if (!code) {
      throw new BadRequestException('Código de autorización requerido')
    }

    // Construir callback URL del backend
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const callbackUrl = redirectUri || `${backendUrl}/api/auth/invitado/google/callback-proxy`

    this.logger.log('🔄 Intercambiando código por id_token...', {
      codeLength: code.length,
      callbackUrl,
    })

    try {
      // Intercambiar código por tokens usando Google OAuth2 API
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        this.logger.error('❌ Error al intercambiar código:', {
          status: tokenResponse.status,
          error: errorText,
        })
        throw new BadRequestException(`Error al intercambiar código: ${tokenResponse.status}`)
      }

      const tokenData = (await tokenResponse.json()) as {
        id_token?: string
        access_token?: string
        expires_in?: number
        error?: string
        error_description?: string
      }

      if (tokenData.error) {
        this.logger.error('❌ Error de Google OAuth:', {
          error: tokenData.error,
          description: tokenData.error_description,
        })
        throw new BadRequestException(
          `Error de Google OAuth: ${tokenData.error} - ${tokenData.error_description || ''}`
        )
      }

      if (!tokenData.id_token) {
        this.logger.error('❌ No se recibió id_token en la respuesta')
        throw new BadRequestException('No se recibió id_token en la respuesta de Google')
      }

      this.logger.log('✅ id_token obtenido exitosamente', {
        hasIdToken: !!tokenData.id_token,
        hasAccessToken: !!tokenData.access_token,
        expiresIn: tokenData.expires_in,
      })

      return {
        id_token: tokenData.id_token,
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al intercambiar código por token: ${errorMessage}`)

      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException(`Error al intercambiar código por token: ${errorMessage}`)
    }
  }
}
