import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
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
import { EventEmitter2 } from '@nestjs/event-emitter'

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
    private notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Crear una nueva solicitud de credencial desde la app móvil
   */
  async create(
    invitadoId: string,
    dto: CreateSolicitudCredencialDto
  ): Promise<SolicitudCredencial> {
    try {
      // Verificar que el invitado existe
      const invitado = await this.prisma.invitado.findUnique({
        where: { id: invitadoId },
      })

      if (!invitado) {
        throw new NotFoundException('Invitado no encontrado')
      }

      // Verificar que no haya una solicitud pendiente para este DNI y tipo
      const solicitudExistente = await this.prisma.solicitudCredencial.findFirst({
        where: {
          invitadoId,
          dni: dto.dni,
          tipo: dto.tipo,
          estado: EstadoSolicitud.PENDIENTE,
        },
      })

      if (solicitudExistente) {
        throw new BadRequestException(
          'Ya existe una solicitud pendiente para este DNI y tipo de credencial'
        )
      }

      // Normalizar valores para asegurar compatibilidad con Prisma
      // El schema usa String, no enum, así que convertimos el enum a string
      const tipoString = dto.tipo === TipoCredencial.MINISTERIAL ? 'ministerial' : 'capellania'
      const estadoString = 'pendiente' // EstadoSolicitud.PENDIENTE es 'pendiente'
      
      // Validar y parsear fecha de nacimiento si se proporciona
      let fechaNacimientoParsed: Date | null = null
      if (dto.fechaNacimiento) {
        try {
          fechaNacimientoParsed = new Date(dto.fechaNacimiento)
          if (isNaN(fechaNacimientoParsed.getTime())) {
            throw new BadRequestException('Fecha de nacimiento inválida')
          }
        } catch (dateError: unknown) {
          const dateErrorMessage = dateError instanceof Error ? dateError.message : 'Error desconocido'
          this.logger.error(`Error parseando fecha de nacimiento: ${dateErrorMessage}`)
          throw new BadRequestException('Fecha de nacimiento inválida')
        }
      }

      this.logger.log(`📝 Creando solicitud con datos normalizados:`, {
        invitadoId,
        tipo: tipoString,
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
        estado: estadoString,
      })

      // Crear la solicitud
      const solicitud = await this.prisma.solicitudCredencial.create({
        data: {
          invitadoId,
          tipo: tipoString,
          dni: dto.dni.trim(),
          nombre: dto.nombre.trim(),
          apellido: dto.apellido.trim(),
          nacionalidad: dto.nacionalidad?.trim() || null,
          fechaNacimiento: fechaNacimientoParsed,
          motivo: dto.motivo?.trim() || null,
          estado: estadoString,
        },
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

      this.logger.log(
        `✅ Solicitud de credencial ${dto.tipo} creada para invitado ${invitado.email} (DNI: ${dto.dni})`
      )

      // Notificar a todos los admins (no bloquear si falla)
      // Ejecutar en background sin esperar
      setImmediate(async () => {
        try {
          const admins = await this.prisma.user.findMany()
          if (!admins || admins.length === 0) {
            this.logger.warn('No hay admins para notificar')
            return
          }

          const tipoLabel = dto.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'

          // Enviar notificaciones en paralelo sin bloquear
          const notificationPromises = admins.map(async (admin) => {
            try {
              await this.notificationsService.sendNotificationToAdmin(
                admin.email,
                'Nueva Solicitud de Credencial',
                `${invitado.nombre} ${invitado.apellido} (${invitado.email}) ha solicitado una credencial ${tipoLabel}.\n\nDNI: ${dto.dni}\nMotivo: ${dto.motivo || 'No especificado'}`,
                {
                  tipo: 'solicitud_credencial',
                  solicitudId: solicitud.id,
                  invitadoId,
                  tipoCredencial: dto.tipo,
                  dni: dto.dni,
                }
              )
              this.logger.log(`✅ Notificación enviada a admin ${admin.email}`)
            } catch (notificationError: unknown) {
              const errorMessage = notificationError instanceof Error ? notificationError.message : 'Error desconocido'
              this.logger.warn(`No se pudo enviar notificación a admin ${admin.email}: ${errorMessage}`)
              // No lanzar error, solo loggear
            }
          })

          // Esperar todas las notificaciones sin bloquear
          await Promise.allSettled(notificationPromises)
        } catch (notificationError: unknown) {
          const errorMessage = notificationError instanceof Error ? notificationError.message : 'Error desconocido'
          this.logger.warn(`Error enviando notificaciones a admins: ${errorMessage}`)
          // No lanzar error, la solicitud ya fue creada exitosamente
        }
      })

      return solicitud
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
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
      
      // Si es un error de validación, re-lanzarlo tal cual
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      
      // Para otros errores, lanzar un error más descriptivo
      throw new Error(`Error al crear solicitud de credencial: ${errorMessage}`)
    }
  }

  /**
   * Obtener todas las solicitudes de un invitado
   */
  async findByInvitadoId(invitadoId: string): Promise<SolicitudCredencial[]> {
    try {
      this.logger.log(`Buscando solicitudes para invitado ${invitadoId}`)
      
      const solicitudes = await this.prisma.solicitudCredencial.findMany({
        where: { invitadoId },
        include: {
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
        orderBy: { createdAt: 'desc' },
      })

      this.logger.log(`✅ Encontradas ${solicitudes.length} solicitudes para invitado ${invitadoId}`)
      return solicitudes
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error obteniendo solicitudes para invitado ${invitadoId}: ${errorMessage}`)
      
      // Si hay un error con las relaciones, intentar sin includes
      try {
        this.logger.warn('Intentando obtener solicitudes sin relaciones...')
        const solicitudesSimples = await this.prisma.solicitudCredencial.findMany({
          where: { invitadoId },
          orderBy: { createdAt: 'desc' },
        })
        this.logger.log(`✅ Obtenidas ${solicitudesSimples.length} solicitudes sin relaciones`)
        return solicitudesSimples as SolicitudCredencial[]
      } catch (fallbackError: unknown) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Error desconocido'
        this.logger.error(`Error en fallback al obtener solicitudes: ${fallbackMessage}`)
        throw new BadRequestException(`Error obteniendo solicitudes: ${errorMessage}`)
      }
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

