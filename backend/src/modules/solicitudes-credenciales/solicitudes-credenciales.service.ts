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
import { DataSyncGateway } from '../data-sync/data-sync.gateway'

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
    private dataSyncGateway: DataSyncGateway
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

      // Normalizar DNI: quitar puntos/espacios para comparar y guardar (acepta "95.774.063" o "95774063")
      const dniNormalizado = dto.dni.trim().replace(/\D/g, '')
      if (dniNormalizado.length < 5) {
        throw new BadRequestException('El DNI debe tener al menos 5 dígitos')
      }

      // Normalizar tipo antes de verificar solicitud existente
      const tipoString = dto.tipo === TipoCredencial.MINISTERIAL ? 'ministerial' : 'capellania'

      // Verificar que no haya una solicitud pendiente para este DNI (normalizado) y tipo
      this.logger.log(`🔍 Verificando solicitud existente para DNI: ${dniNormalizado}, tipo: ${tipoString}`)
      const todasPendientes = await this.prisma.solicitudCredencial.findMany({
        where: { invitadoId, tipo: tipoString, estado: 'pendiente' },
      })
      const solicitudExistente = todasPendientes.find(
        (s) => s.dni.replace(/\D/g, '') === dniNormalizado
      )

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

      // Preparar datos para Prisma (DNI guardado con puntos si los trae el cliente, o solo dígitos)
      const dniParaGuardar = dto.dni.trim()
      const dataToCreate = {
        invitadoId,
        tipo: tipoString,
        tipoPastor: dto.tipoPastor?.trim() || null,
        dni: dniParaGuardar,
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
        const msgLower = String(prismaErrorMessage).toLowerCase()

        // Columna faltante en BD (ej. tipo_pastor): suele indicar que faltan migraciones
        const posibleColumnaFaltante =
          msgLower.includes('tipo_pastor') ||
          (msgLower.includes('column') && msgLower.includes('does not exist')) ||
          msgLower.includes('no existe')
        if (posibleColumnaFaltante) {
          this.logger.error(`❌ Error de Prisma (posible migración pendiente): ${prismaErrorMessage}`)
          throw new BadRequestException(
            'La base de datos no está actualizada. Ejecuta las migraciones de Prisma en el servidor: npx prisma migrate deploy'
          )
        }

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

    this.logger.log(
      `findAll solicitudes: where=${JSON.stringify(where)}, skip=${skip}, take=${limit}`
    )

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

    this.logger.log(`findAll solicitudes: total=${total}, devolviendo ${data.length} en esta página`)

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

    // Si se completó la solicitud y tiene credencial asociada, actualizar el invitadoId en la credencial
    if (dto.estado === EstadoSolicitud.COMPLETADA) {
      try {
        if (updated.credencialMinisterialId && updated.invitadoId) {
          await this.prisma.credencialMinisterial.update({
            where: { id: updated.credencialMinisterialId },
            data: { invitadoId: updated.invitadoId },
          })
          this.logger.log(`✅ Credencial ministerial ${updated.credencialMinisterialId} asociada a invitado ${updated.invitadoId}`)
        }
        if (updated.credencialCapellaniaId && updated.invitadoId) {
          await this.prisma.credencialCapellania.update({
            where: { id: updated.credencialCapellaniaId },
            data: { invitadoId: updated.invitadoId },
          })
          this.logger.log(`✅ Credencial de capellanía ${updated.credencialCapellaniaId} asociada a invitado ${updated.invitadoId}`)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.error(`Error asociando credencial a invitado: ${errorMessage}`)
        // No lanzar error, solo loggear - la solicitud ya se actualizó
      }
    }

    // Emitir evento WebSocket para sincronización en tiempo real (no bloquear si falla)
    if (dto.estado && dto.estado !== solicitud.estado) {
      try {
        this.dataSyncGateway.emitSolicitudUpdated(updated.id, updated.invitadoId, dto.estado)
        this.logger.log(`📡 Evento WebSocket emitido: solicitud_updated para ${updated.id}`)
        
        // Si la solicitud se completó y tiene una credencial asociada, emitir también evento de credencial actualizada
        if (dto.estado === EstadoSolicitud.COMPLETADA) {
          if (updated.credencialMinisterialId) {
            this.dataSyncGateway.emitCredencialUpdated(updated.credencialMinisterialId, 'ministerial')
            this.logger.log(`📡 Evento WebSocket emitido: credencial_updated (ministerial) para ${updated.credencialMinisterialId}`)
          }
          if (updated.credencialCapellaniaId) {
            this.dataSyncGateway.emitCredencialUpdated(updated.credencialCapellaniaId, 'capellania')
            this.logger.log(`📡 Evento WebSocket emitido: credencial_updated (capellania) para ${updated.credencialCapellaniaId}`)
          }
        }
      } catch (wsError: unknown) {
        const wsErrorMessage = wsError instanceof Error ? wsError.message : 'Error desconocido'
        this.logger.warn(`⚠️ Error emitiendo WebSocket: ${wsErrorMessage}`)
        // No bloquear, solo loggear
      }
    }

    // Notificar al invitado cuando cambia el estado (en background, no bloquear)
    setTimeout(async () => {
      try {
        if (dto.estado) {
          await this.notificarCambioEstadoSolicitud(updated, dto.estado, solicitud.estado)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.error(`Error notificando cambio de estado: ${errorMessage}`)
        // No lanzar error, solo loggear
      }
    }, 0)

    return updated
  }

  /**
   * Eliminar una solicitud (solo admin).
   * Si la solicitud tiene credencial asociada (ministerial o capellanía), la elimina también
   * para que no siga apareciendo en "Ver Credenciales".
   */
  async remove(id: string): Promise<void> {
    const solicitud = await this.prisma.solicitudCredencial.findUnique({
      where: { id },
      select: { id: true, credencialMinisterialId: true, credencialCapellaniaId: true },
    })
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`)
    }

    await this.prisma.$transaction(async (tx) => {
      // Quitar la referencia en la solicitud para poder borrar las credenciales sin violar FK
      await tx.solicitudCredencial.update({
        where: { id },
        data: { credencialMinisterialId: null, credencialCapellaniaId: null },
      })
      // Eliminar la credencial ministerial asociada (si existe)
      if (solicitud.credencialMinisterialId) {
        await tx.credencialMinisterial.deleteMany({
          where: { id: solicitud.credencialMinisterialId },
        })
        this.logger.log(`✅ Credencial ministerial ${solicitud.credencialMinisterialId} eliminada`)
      }
      // Eliminar la credencial de capellanía asociada (si existe)
      if (solicitud.credencialCapellaniaId) {
        await tx.credencialCapellania.deleteMany({
          where: { id: solicitud.credencialCapellaniaId },
        })
        this.logger.log(`✅ Credencial capellanía ${solicitud.credencialCapellaniaId} eliminada`)
      }
      // Eliminar la solicitud
      await tx.solicitudCredencial.delete({
        where: { id },
      })
    })
    this.logger.log(`✅ Solicitud ${id} eliminada correctamente`)
  }

  /**
   * Notificar al invitado cuando cambia el estado de su solicitud
   */
  private async notificarCambioEstadoSolicitud(
    solicitud: SolicitudCredencialWithRelations,
    nuevoEstado: EstadoSolicitud,
    estadoAnterior: string
  ): Promise<void> {
    try {
      // Solo notificar si el estado cambió
      if (nuevoEstado === estadoAnterior) {
        return
      }

      const tipoLabel = solicitud.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'
      let titulo = ''
      let mensaje = ''
      let tipoNotificacion = ''

      switch (nuevoEstado) {
        case EstadoSolicitud.APROBADA:
          titulo = `✅ Solicitud de Credencial ${tipoLabel} Aprobada`
          mensaje = `Tu solicitud de credencial ${tipoLabel} ha sido aprobada. Pronto recibirás más información.`
          tipoNotificacion = 'solicitud_aprobada'
          break

        case EstadoSolicitud.RECHAZADA:
          titulo = `❌ Solicitud de Credencial ${tipoLabel} Rechazada`
          const motivoRechazo = solicitud.observaciones || 'No se especificó motivo'
          mensaje = `Tu solicitud de credencial ${tipoLabel} ha sido rechazada.\n\nMotivo: ${motivoRechazo}`
          tipoNotificacion = 'solicitud_rechazada'
          break

        case EstadoSolicitud.COMPLETADA:
          titulo = `🎉 Credencial ${tipoLabel} Lista`
          mensaje = `Tu credencial ${tipoLabel} ha sido creada y está disponible en la app. Ábrela para verla.`
          tipoNotificacion = 'solicitud_completada'
          break

        default:
          // No notificar para otros estados
          return
      }

      this.logger.log(`📧 Notificando cambio de estado a invitado ${solicitud.invitado.email}`)

      // Enviar notificación push
      await this.notificationsService.sendPushNotificationToInvitado(
        solicitud.invitado.id,
        titulo,
        mensaje,
        {
          type: tipoNotificacion,
          solicitudId: solicitud.id,
          tipoCredencial: solicitud.tipo,
          estado: nuevoEstado,
          dni: solicitud.dni,
        }
      )

      // Enviar email de notificación
      await this.notificationsService.sendEmailToInvitado(
        solicitud.invitado.email,
        titulo,
        mensaje,
        {
          type: tipoNotificacion,
          solicitudId: solicitud.id,
          tipoCredencial: solicitud.tipo,
          estado: nuevoEstado,
          nombre: solicitud.invitado.nombre,
          apellido: solicitud.invitado.apellido,
          dni: solicitud.dni,
          observaciones: solicitud.observaciones || null,
        }
      )

      this.logger.log(`✅ Notificación enviada a invitado ${solicitud.invitado.email} sobre cambio de estado`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error notificando cambio de estado: ${errorMessage}`)
      // No lanzar error, solo loggear
    }
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
