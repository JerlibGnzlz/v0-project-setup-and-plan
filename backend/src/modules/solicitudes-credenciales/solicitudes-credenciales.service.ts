import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateSolicitudCredencialDto,
  UpdateSolicitudCredencialDto,
  EstadoSolicitud,
  TipoCredencial,
} from './dto/solicitud-credencial.dto'
import { SolicitudCredencial } from '@prisma/client'
import { NotificationsService } from '../notifications/notifications.service'

export interface SolicitudCredencialWithRelations extends SolicitudCredencial {
  invitado: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  credencialMinisterial?: {
    id: string
    documento: string
    nombre: string
    apellido: string
  } | null
  credencialCapellania?: {
    id: string
    documento: string
    nombre: string
    apellido: string
  } | null
}

@Injectable()
export class SolicitudesCredencialesService {
  private readonly logger = new Logger(SolicitudesCredencialesService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  /**
   * Crear una nueva solicitud de credencial desde la app móvil
   */
  async create(
    invitadoId: string,
    dto: CreateSolicitudCredencialDto
  ): Promise<SolicitudCredencial> {
    try {
      this.logger.log(`📝 ===== INICIO CREATE SERVICE =====`)
      this.logger.log(`📝 InvitadoId recibido: ${invitadoId}`)
      this.logger.log(`📝 DTO recibido: ${JSON.stringify(dto)}`)

      // Verificar conexión a la base de datos
      try {
        await this.prisma.$queryRaw`SELECT 1`
        this.logger.log('✅ Conexión a la base de datos verificada')
      } catch (dbError: unknown) {
        const dbErrorMessage = dbError instanceof Error ? dbError.message : 'Error desconocido'
        this.logger.error(`❌ Error de conexión a la base de datos: ${dbErrorMessage}`)
        throw new InternalServerErrorException('Error de conexión a la base de datos')
      }

      // Verificar que el invitado existe
      this.logger.log(`🔍 Buscando invitado con ID: ${invitadoId}`)
      const invitado = await this.prisma.invitado.findUnique({
        where: { id: invitadoId },
      })

      if (!invitado) {
        this.logger.error(`❌ Invitado no encontrado con ID: ${invitadoId}`)
        throw new NotFoundException('Invitado no encontrado')
      }

      this.logger.log(`✅ Invitado encontrado: ${invitado.email}`)

      // Verificar que el invitado tenga al menos una inscripción activa en alguna convención
      // Esto asegura que solo usuarios que han participado en convenciones puedan solicitar credenciales
      this.logger.log(`🔍 Verificando inscripciones del invitado ${invitadoId}...`)
      const inscripciones = await this.prisma.inscripcion.findMany({
        where: {
          invitadoId,
          estado: {
            in: ['pendiente', 'confirmada', 'activa'],
          },
        },
        select: {
          id: true,
          convencionId: true,
          estado: true,
        },
        take: 1, // Solo necesitamos saber si existe al menos una
      })

      if (inscripciones.length === 0) {
        this.logger.warn(`⚠️ Invitado ${invitadoId} no tiene inscripciones activas`)
        throw new BadRequestException(
          'Debes estar inscrito en al menos una convención para solicitar una credencial'
        )
      }

      this.logger.log(`✅ Invitado tiene ${inscripciones.length} inscripción(es) activa(s)`)

      // Normalizar tipo antes de verificar solicitud existente
      const tipoString = dto.tipo === TipoCredencial.MINISTERIAL ? 'ministerial' : 'capellania'
      
      // Verificar que no haya una solicitud pendiente para este DNI y tipo
      this.logger.log(`🔍 Verificando solicitud existente para DNI: ${dto.dni.trim()}, tipo: ${tipoString}`)
      const solicitudExistente = await this.prisma.solicitudCredencial.findFirst({
        where: {
          invitadoId,
          dni: dto.dni.trim(),
          tipo: tipoString,
          estado: 'pendiente',
        },
      })

      if (solicitudExistente) {
        this.logger.warn(`⚠️ Solicitud existente encontrada: ${solicitudExistente.id}`)
        throw new BadRequestException(
          'Ya existe una solicitud pendiente para este DNI y tipo de credencial'
        )
      }

      this.logger.log('✅ No hay solicitud existente, procediendo a crear')

      const estadoString = 'pendiente'
      
      // Validar y parsear fecha de nacimiento si se proporciona
      let fechaNacimientoParsed: Date | null = null
      if (dto.fechaNacimiento) {
        try {
          fechaNacimientoParsed = new Date(dto.fechaNacimiento)
          if (isNaN(fechaNacimientoParsed.getTime())) {
            throw new BadRequestException('Fecha de nacimiento inválida')
          }
          this.logger.log(`✅ Fecha de nacimiento parseada: ${fechaNacimientoParsed.toISOString()}`)
        } catch (dateError: unknown) {
          const dateErrorMessage = dateError instanceof Error ? dateError.message : 'Error desconocido'
          this.logger.error(`❌ Error parseando fecha de nacimiento: ${dateErrorMessage}`)
          throw new BadRequestException('Fecha de nacimiento inválida')
        }
      }

      // Preparar datos para Prisma
      const dataToCreate = {
        invitadoId,
        tipo: tipoString,
        dni: dto.dni.trim(),
        nombre: dto.nombre.trim(),
        apellido: dto.apellido.trim(),
        nacionalidad: dto.nacionalidad?.trim() || null,
        fechaNacimiento: fechaNacimientoParsed,
        motivo: dto.motivo?.trim() || null,
        estado: estadoString,
      }

      this.logger.log(`📝 Datos preparados para Prisma:`, {
        ...dataToCreate,
        fechaNacimiento: dataToCreate.fechaNacimiento ? dataToCreate.fechaNacimiento.toISOString() : null,
      })

      // Crear la solicitud
      let solicitud: SolicitudCredencial
      try {
        this.logger.log('📝 Intentando crear solicitud en Prisma...')
        this.logger.log(`📝 Tabla: solicitudes_credenciales`)
        this.logger.log(`📝 Campos requeridos: invitadoId, tipo, dni, nombre, apellido, estado`)
        
        solicitud = await this.prisma.solicitudCredencial.create({
          data: dataToCreate,
          include: {
            invitado: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        })
        
        this.logger.log(`✅ Solicitud creada exitosamente en Prisma: ${solicitud.id}`)
        this.logger.log(`✅ Datos de la solicitud creada:`, {
          id: solicitud.id,
          invitadoId: solicitud.invitadoId,
          tipo: solicitud.tipo,
          dni: solicitud.dni,
          estado: solicitud.estado,
          createdAt: solicitud.createdAt.toISOString(),
        })
      } catch (prismaError: unknown) {
        const prismaErrorMessage = prismaError instanceof Error ? prismaError.message : 'Error desconocido'
        const prismaErrorStack = prismaError instanceof Error ? prismaError.stack : undefined
        
        // Si es un error de Prisma, proporcionar más detalles
        if (prismaError && typeof prismaError === 'object' && 'code' in prismaError) {
          const prismaErrorCode = prismaError as { code?: string; meta?: unknown }
          this.logger.error(`❌ Error de Prisma al crear solicitud:`)
          this.logger.error(`   Código: ${prismaErrorCode.code}`)
          this.logger.error(`   Mensaje: ${prismaErrorMessage}`)
          this.logger.error(`   Meta: ${JSON.stringify(prismaErrorCode.meta)}`)
          
          // Errores comunes de Prisma
          if (prismaErrorCode.code === 'P2002') {
            const meta = prismaErrorCode.meta as { target?: string[] } | undefined
            const target = meta?.target?.join(', ') || 'campos desconocidos'
            this.logger.error(`   Violación de constraint único en: ${target}`)
            throw new BadRequestException(`Ya existe una solicitud con estos datos (${target})`)
          }
          if (prismaErrorCode.code === 'P2003') {
            const meta = prismaErrorCode.meta as { field_name?: string } | undefined
            const fieldName = meta?.field_name || 'campo desconocido'
            this.logger.error(`   Violación de foreign key en: ${fieldName}`)
            throw new BadRequestException(`Referencia inválida: ${fieldName}`)
          }
          if (prismaErrorCode.code === 'P2011') {
            this.logger.error(`   Campo requerido es null`)
            throw new BadRequestException('Faltan campos requeridos en la solicitud')
          }
        }
        
        this.logger.error(`❌ Error al crear solicitud en Prisma: ${prismaErrorMessage}`)
        if (prismaErrorStack) {
          this.logger.error(`Stack trace: ${prismaErrorStack}`)
        }
        
        // Re-lanzar el error para que el controller lo capture
        throw prismaError
      }

      this.logger.log(
        `✅ Solicitud de credencial ${dto.tipo} creada para invitado ${invitado.email} (DNI: ${dto.dni})`
      )

      // Notificar a todos los admins (igual que con inscripciones)
      // Usar setTimeout para no bloquear la respuesta
      setTimeout(async () => {
        try {
          this.logger.log('📧 Iniciando proceso de notificaciones a admins...')
          const admins = await this.prisma.user.findMany({
            select: {
              id: true,
              email: true,
              nombre: true,
            },
          })

          if (!admins || admins.length === 0) {
            this.logger.warn('⚠️ No hay admins para notificar')
            return
          }

          this.logger.log(`📧 Encontrados ${admins.length} admin(s) para notificar`)

          const tipoLabel = dto.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'
          const titulo = 'Nueva Solicitud de Credencial'
          const mensaje = `${invitado.nombre} ${invitado.apellido} (${invitado.email}) ha solicitado una credencial ${tipoLabel}.\n\nDNI: ${dto.dni}\nMotivo: ${dto.motivo || 'No especificado'}`

          // Enviar notificaciones a todos los admins en paralelo
          const notificationPromises = admins.map(async (admin) => {
            try {
              this.logger.log(`📧 Enviando notificación a admin ${admin.email}...`)
              await this.notificationsService.sendNotificationToAdmin(
                admin.email,
                titulo,
                mensaje,
                {
                  type: 'solicitud_credencial',
                  solicitudId: solicitud.id,
                  invitadoId,
                  invitadoEmail: invitado.email,
                  invitadoNombre: invitado.nombre,
                  invitadoApellido: invitado.apellido,
                  tipoCredencial: dto.tipo,
                  dni: dto.dni,
                  motivo: dto.motivo || null,
                }
              )
              this.logger.log(`✅ Notificación enviada a admin ${admin.email}`)
            } catch (notificationError: unknown) {
              const errorMessage = notificationError instanceof Error ? notificationError.message : 'Error desconocido'
              const errorStack = notificationError instanceof Error ? notificationError.stack : undefined
              this.logger.warn(`⚠️ No se pudo enviar notificación a admin ${admin.email}: ${errorMessage}`)
              if (errorStack) {
                this.logger.warn(`Stack trace: ${errorStack}`)
              }
              // No lanzar error, solo loggear - la solicitud ya fue creada exitosamente
            }
          })

          await Promise.allSettled(notificationPromises)
          this.logger.log(`✅ Proceso de notificaciones completado para ${admins.length} admin(s)`)
        } catch (notificationError: unknown) {
          const errorMessage = notificationError instanceof Error ? notificationError.message : 'Error desconocido'
          const errorStack = notificationError instanceof Error ? notificationError.stack : undefined
          this.logger.error(`❌ Error enviando notificaciones a admins: ${errorMessage}`)
          if (errorStack) {
            this.logger.error(`Stack trace: ${errorStack}`)
          }
          // No lanzar error, la solicitud ya fue creada exitosamente
        }
      }, 0)

      this.logger.log(`✅ ===== FIN CREATE SERVICE (EXITOSO) =====`)
      return solicitud
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      this.logger.error(`❌ ===== ERROR EN CREATE SERVICE =====`)
      this.logger.error(`❌ Error creando solicitud de credencial: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      
      // Si es un error conocido de Prisma, proporcionar más detalles
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code?: string; meta?: unknown }
        this.logger.error(`Prisma error code: ${prismaError.code}`)
        this.logger.error(`Prisma error meta: ${JSON.stringify(prismaError.meta)}`)
      }
      
      // Si es un error conocido de NestJS, re-lanzarlo tal cual
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error
      }
      
      // Si es un error de Prisma, proporcionar más contexto
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code?: string; meta?: unknown }
        
        if (prismaError.code === 'P2002') {
          throw new BadRequestException('Ya existe una solicitud con estos datos')
        }
        if (prismaError.code === 'P2003') {
          throw new BadRequestException('Referencia inválida en la base de datos')
        }
        if (prismaError.code === 'P2011') {
          throw new BadRequestException('Faltan campos requeridos en la solicitud')
        }
      }
      
      // Para otros errores, lanzar un InternalServerErrorException con más detalles
      throw new InternalServerErrorException(
        `Error al crear solicitud de credencial: ${errorMessage}`
      )
    }
  }

  /**
   * Obtener todas las solicitudes de un invitado
   */
  async findByInvitadoId(invitadoId: string): Promise<SolicitudCredencial[]> {
    try {
      this.logger.log(`🔍 Buscando solicitudes para invitado ${invitadoId}`)
      
      // Primero intentar sin includes para evitar problemas con relaciones
      const solicitudesSimples = await this.prisma.solicitudCredencial.findMany({
        where: { invitadoId },
        orderBy: { createdAt: 'desc' },
      })

      this.logger.log(`✅ Encontradas ${solicitudesSimples.length} solicitudes para invitado ${invitadoId}`)
      
      // Si hay solicitudes, intentar obtener las relaciones de forma segura
      if (solicitudesSimples.length > 0) {
        try {
          const solicitudesConRelaciones = await Promise.all(
            solicitudesSimples.map(async (solicitud) => {
              const credencialMinisterial = solicitud.credencialMinisterialId
                ? await this.prisma.credencialMinisterial.findUnique({
                    where: { id: solicitud.credencialMinisterialId },
                    select: {
                      id: true,
                      documento: true,
                      nombre: true,
                      apellido: true,
                      fechaVencimiento: true,
                      activa: true,
                    },
                  }).catch(() => null)
                : null

              const credencialCapellania = solicitud.credencialCapellaniaId
                ? await this.prisma.credencialCapellania.findUnique({
                    where: { id: solicitud.credencialCapellaniaId },
                    select: {
                      id: true,
                      documento: true,
                      nombre: true,
                      apellido: true,
                      fechaVencimiento: true,
                      activa: true,
                    },
                  }).catch(() => null)
                : null

              return {
                ...solicitud,
                credencialMinisterial,
                credencialCapellania,
              }
            })
          )

          return solicitudesConRelaciones as SolicitudCredencial[]
        } catch (relationError: unknown) {
          const relationErrorMessage = relationError instanceof Error ? relationError.message : 'Error desconocido'
          this.logger.warn(`⚠️ Error obteniendo relaciones, retornando solicitudes simples: ${relationErrorMessage}`)
          return solicitudesSimples as SolicitudCredencial[]
        }
      }

      return solicitudesSimples as SolicitudCredencial[]
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      this.logger.error(`❌ Error obteniendo solicitudes para invitado ${invitadoId}: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      
      // Si es un error de Prisma, proporcionar más detalles
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code?: string; meta?: unknown }
        this.logger.error(`Prisma error code: ${prismaError.code}`)
        this.logger.error(`Prisma error meta: ${JSON.stringify(prismaError.meta)}`)
      }
      
      throw new BadRequestException(`Error obteniendo solicitudes: ${errorMessage}`)
    }
  }

  /**
   * Obtener todas las solicitudes (para admins)
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    estado?: EstadoSolicitud,
    tipo?: TipoCredencial
  ): Promise<{
    data: SolicitudCredencialWithRelations[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const skip = (page - 1) * limit

    const where: {
      estado?: EstadoSolicitud
      tipo?: TipoCredencial
    } = {}

    if (estado) {
      where.estado = estado
    }

    if (tipo) {
      where.tipo = tipo
    }

    const [data, total] = await Promise.all([
      this.prisma.solicitudCredencial.findMany({
        where,
        include: {
          invitado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          credencialMinisterial: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
            },
          },
          credencialCapellania: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.solicitudCredencial.count({ where }),
    ])

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Obtener una solicitud por ID
   */
  async findOne(id: string): Promise<SolicitudCredencialWithRelations> {
    const solicitud = await this.prisma.solicitudCredencial.findUnique({
      where: { id },
      include: {
        invitado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            sede: true,
          },
        },
        credencialMinisterial: {
          select: {
            id: true,
            documento: true,
            nombre: true,
            apellido: true,
            fechaVencimiento: true,
            activa: true,
          },
        },
        credencialCapellania: {
          select: {
            id: true,
            documento: true,
            nombre: true,
            apellido: true,
            fechaVencimiento: true,
            activa: true,
          },
        },
      },
    })

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID "${id}" no encontrada`)
    }

    return solicitud
  }

  /**
   * Actualizar una solicitud (para admins)
   */
  async update(
    id: string,
    dto: UpdateSolicitudCredencialDto
  ): Promise<SolicitudCredencialWithRelations> {
    const solicitud = await this.findOne(id)

    const updateData: {
      estado?: EstadoSolicitud
      observaciones?: string
      credencialMinisterialId?: string
      credencialCapellaniaId?: string
      aprobadaAt?: Date
      completadaAt?: Date
    } = {}

    if (dto.estado) {
      updateData.estado = dto.estado

      if (dto.estado === EstadoSolicitud.APROBADA && !solicitud.aprobadaAt) {
        updateData.aprobadaAt = new Date()
      }

      if (dto.estado === EstadoSolicitud.COMPLETADA && !solicitud.completadaAt) {
        updateData.completadaAt = new Date()
      }
    }

    if (dto.observaciones !== undefined) {
      updateData.observaciones = dto.observaciones
    }

    if (dto.credencialMinisterialId) {
      updateData.credencialMinisterialId = dto.credencialMinisterialId
    }

    if (dto.credencialCapellaniaId) {
      updateData.credencialCapellaniaId = dto.credencialCapellaniaId
    }

    const updated = await this.prisma.solicitudCredencial.update({
      where: { id },
      data: updateData,
      include: {
        invitado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        credencialMinisterial: {
          select: {
            id: true,
            documento: true,
            nombre: true,
            apellido: true,
          },
        },
        credencialCapellania: {
          select: {
            id: true,
            documento: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    // Si se completó la solicitud, notificar al invitado
    if (dto.estado === EstadoSolicitud.COMPLETADA) {
      await this.notificarCredencialCompletada(updated)
    }

    return updated
  }

  /**
   * Notificar al invitado cuando su credencial está lista
   */
  private async notificarCredencialCompletada(
    solicitud: SolicitudCredencialWithRelations
  ): Promise<void> {
    try {
      const tipoLabel =
        solicitud.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'

      // Enviar notificación push si tiene device token
      const invitadoAuth = await this.prisma.invitadoAuth.findUnique({
        where: { invitadoId: solicitud.invitadoId },
        include: {
          deviceTokens: {
            where: { active: true },
          },
        },
      })

      if (invitadoAuth && invitadoAuth.deviceTokens.length > 0) {
        for (const deviceToken of invitadoAuth.deviceTokens) {
          await this.notificationsService.sendPushNotification(
            deviceToken.token,
            'Credencial Lista',
            `Tu credencial ${tipoLabel} ha sido creada y está disponible en la app.`,
            {
              tipo: 'credencial_completada',
              solicitudId: solicitud.id,
              tipoCredencial: solicitud.tipo,
            }
          )
        }
      }

      // Enviar email de notificación
      await this.notificationsService.sendEmailToInvitado(
        solicitud.invitado.email,
        `Credencial ${tipoLabel} Lista`,
        `Tu credencial ${tipoLabel} ha sido creada exitosamente y está disponible en la aplicación móvil.`,
        {
          tipo: 'credencial_completada',
          solicitudId: solicitud.id,
          tipoCredencial: solicitud.tipo,
          nombre: solicitud.invitado.nombre,
          apellido: solicitud.invitado.apellido,
        }
      )

      this.logger.log(
        `✅ Notificación enviada a invitado ${solicitud.invitado.email} sobre credencial completada`
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error notificando credencial completada: ${errorMessage}`)
      // No lanzar error, solo loggear
    }
  }
}
