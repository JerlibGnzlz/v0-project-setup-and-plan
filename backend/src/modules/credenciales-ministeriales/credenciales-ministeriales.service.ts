import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateCredencialMinisterialDto,
  UpdateCredencialMinisterialDto,
  CredencialMinisterialFilterDto,
} from './dto/credencial-ministerial.dto'
import { CredencialMinisterial, Prisma, TipoPastor } from '@prisma/client'
import { BaseService } from '../../common/base.service'
import { PrismaModelDelegate } from '../../common/types/prisma.types'
import { NotificationsService } from '../notifications/notifications.service'
import { DataSyncGateway } from '../data-sync/data-sync.gateway'

export interface CredencialMinisterialWithEstado extends CredencialMinisterial {
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes: number
}

/**
 * Servicio para gestión de Credenciales Ministeriales Físicas
 *
 * Gestiona las credenciales físicas de los pastores con información
 * completa para impresión (frente y dorso).
 */
@Injectable()
export class CredencialesMinisterialesService extends BaseService<
  CredencialMinisterial,
  CreateCredencialMinisterialDto,
  UpdateCredencialMinisterialDto
> {
  private readonly logger = new Logger(CredencialesMinisterialesService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private dataSyncGateway: DataSyncGateway
  ) {
    super(
      prisma.credencialMinisterial as unknown as PrismaModelDelegate<CredencialMinisterial>,
      { entityName: 'CredencialMinisterial' }
    )
  }

  /**
   * Calcula el estado de una credencial basado en la fecha de vencimiento
   */
  private calcularEstado(fechaVencimiento: Date): {
    estado: 'vigente' | 'por_vencer' | 'vencida'
    diasRestantes: number
  } {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diasRestantes = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasRestantes < 0) {
      return { estado: 'vencida', diasRestantes: Math.abs(diasRestantes) }
    } else if (diasRestantes <= 30) {
      return { estado: 'por_vencer', diasRestantes }
    } else {
      return { estado: 'vigente', diasRestantes }
    }
  }

  /**
   * Crea una nueva credencial ministerial
   */
  override async create(
    dto: CreateCredencialMinisterialDto
  ): Promise<CredencialMinisterial> {
    try {
      // Verificar que el documento no existe
      const credencialExistente = await this.prisma.credencialMinisterial.findUnique({
        where: { documento: dto.documento },
      })

      if (credencialExistente) {
        // Enviar notificación a todos los admins
        const admins = await this.prisma.user.findMany()

        const titulo = 'Intento de crear credencial duplicada'
        const mensaje = `Se intentó crear una credencial con el documento ${dto.documento} que ya existe. La credencial existente pertenece a ${credencialExistente.nombre} ${credencialExistente.apellido}.`

        for (const admin of admins) {
          await this.notificationsService.sendNotificationToAdmin(
            admin.email,
            titulo,
            mensaje,
            {
              tipo: 'credencial_duplicada',
              documento: dto.documento,
              credencialExistenteId: credencialExistente.id,
            }
          )
        }

        this.logger.warn(
          `⚠️ Intento de crear credencial ministerial duplicada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
        )

        throw new ConflictException(
          `Ya existe una credencial MINISTERIAL con el documento ${dto.documento}. Nota: Una persona puede tener credenciales ministeriales y de capellanía con el mismo DNI, pero no puede tener dos credenciales del mismo tipo.`
        )
      }

      // Parsear fechas correctamente (sin problemas de timezone)
      // Las fechas vienen como string en formato YYYY-MM-DD
      const fechaNacimiento = this.parseDateString(dto.fechaNacimiento)
      const fechaVencimiento = this.parseDateString(dto.fechaVencimiento)

      // Buscar si hay una solicitud pendiente para este DNI
      let solicitudCredencial = null
      let invitadoId = dto.invitadoId

      if (!invitadoId && dto.documento) {
        // Buscar solicitud por DNI y tipo ministerial
        solicitudCredencial = await this.prisma.solicitudCredencial.findFirst({
          where: {
            dni: dto.documento,
            tipo: 'ministerial',
            estado: 'pendiente',
          },
          include: {
            invitado: true,
          },
        })

        if (solicitudCredencial) {
          invitadoId = solicitudCredencial.invitadoId
          this.logger.log(
            `📋 Solicitud encontrada para DNI ${dto.documento}, vinculando con credencial`
          )
        }
      }

      const credencial = await this.prisma.credencialMinisterial.create({
        data: {
          apellido: dto.apellido,
          nombre: dto.nombre,
          documento: dto.documento,
          nacionalidad: dto.nacionalidad,
          fechaNacimiento,
          tipoPastor: dto.tipoPastor || 'PASTOR',
          fechaVencimiento,
          fotoUrl: dto.fotoUrl,
          activa: dto.activa ?? true,
          invitadoId: invitadoId || dto.invitadoId,
          solicitudCredencialId: solicitudCredencial?.id || dto.solicitudCredencialId,
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
          solicitudCredencial: true,
        },
      })

      // Si hay solicitud, actualizarla como completada
      if (solicitudCredencial) {
        await this.prisma.solicitudCredencial.update({
          where: { id: solicitudCredencial.id },
          data: {
            estado: 'completada',
            credencialMinisterialId: credencial.id,
            completadaAt: new Date(),
          },
        })

        // Notificar al invitado
        if (solicitudCredencial.invitado) {
          try {
            // Buscar tokens de dispositivo del invitado para push notifications
            const invitadoConTokens = await this.prisma.invitado.findUnique({
              where: { id: solicitudCredencial.invitado.id },
              include: {
                auth: {
                  include: {
                    deviceTokens: {
                      where: { active: true },
                    },
                  },
                },
              },
            })

            // Enviar push notifications a todos los dispositivos activos
            if (invitadoConTokens?.auth?.deviceTokens && invitadoConTokens.auth.deviceTokens.length > 0) {
              for (const deviceToken of invitadoConTokens.auth.deviceTokens) {
                await this.notificationsService.sendPushNotification(
                  deviceToken.token,
                  'Credencial Ministerial Creada',
                  `Tu credencial ministerial ha sido creada exitosamente. Documento: ${credencial.documento}`,
                  {
                    tipo: 'credencial_creada',
                    credencialId: credencial.id,
                    tipoCredencial: 'ministerial',
                    documento: credencial.documento,
                  }
                )
              }
            }

            // Enviar email
            await this.notificationsService.sendEmailToInvitado(
              solicitudCredencial.invitado.email,
              'Credencial Ministerial Creada',
              `Hola ${solicitudCredencial.invitado.nombre},\n\nTu credencial ministerial ha sido creada exitosamente.\n\nDocumento: ${credencial.documento}\nNombre: ${credencial.nombre} ${credencial.apellido}\nFecha de Vencimiento: ${credencial.fechaVencimiento.toLocaleDateString('es-ES')}\n\nPuedes consultarla en la aplicación móvil.`,
              {
                tipo: 'credencial_creada',
                credencialId: credencial.id,
                tipoCredencial: 'ministerial',
              }
            )

            this.logger.log(
              `✅ Notificación enviada a invitado ${solicitudCredencial.invitado.email} por credencial creada`
            )
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(
              `❌ Error enviando notificación a invitado: ${errorMessage}`
            )
            // No lanzar error, solo loggear (la credencial ya fue creada)
          }
        }
      }

      this.logger.log(
        `✅ Credencial ministerial creada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
      )

      // Emitir evento de sincronización
      this.dataSyncGateway.emitCredencialUpdated(credencial.id, 'ministerial')

      return credencial
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al crear credencial ministerial: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Parsea un string de fecha (YYYY-MM-DD) a Date sin problemas de timezone
   * Asegura que el día, mes y año se mantengan exactamente como se ingresaron
   */
  private parseDateString(dateString: string): Date {
    // Si viene en formato YYYY-MM-DD, parsearlo correctamente
    const parts = dateString.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexed
      const day = parseInt(parts[2], 10)
      return new Date(Date.UTC(year, month, day, 12, 0, 0)) // Usar UTC para evitar problemas de timezone
    }
    // Fallback a parseo normal
    return new Date(dateString)
  }

  /**
   * Actualiza una credencial ministerial
   */
  override async update(
    id: string,
    dto: UpdateCredencialMinisterialDto
  ): Promise<CredencialMinisterial> {
    try {
      const credencial = await this.prisma.credencialMinisterial.findUnique({
        where: { id },
      })

      if (!credencial) {
        throw new NotFoundException(`Credencial con ID ${id} no encontrada`)
      }

      // Si se actualiza el documento, verificar que no existe
      if (dto.documento && dto.documento !== credencial.documento) {
        const credencialExistente = await this.prisma.credencialMinisterial.findUnique({
          where: { documento: dto.documento },
        })

        if (credencialExistente) {
          // Enviar notificación a todos los admins
          const admins = await this.prisma.user.findMany()

          const titulo = 'Intento de actualizar credencial con documento duplicado'
          const mensaje = `Se intentó actualizar la credencial ${id} con el documento ${dto.documento} que ya existe. La credencial existente pertenece a ${credencialExistente.nombre} ${credencialExistente.apellido}.`

          for (const admin of admins) {
            await this.notificationsService.sendNotificationToAdmin(
              admin.email,
              titulo,
              mensaje,
              {
                tipo: 'credencial_duplicada',
                documento: dto.documento,
                credencialExistenteId: credencialExistente.id,
                credencialActualId: id,
              }
            )
          }

          throw new ConflictException(
            `Ya existe una credencial con el documento ${dto.documento}`
          )
        }
      }

      // Construir updateData explícitamente para evitar problemas de tipos
      const updateData: Prisma.CredencialMinisterialUpdateInput = {}
      
      // Copiar campos que no son fechas
      if (dto.apellido !== undefined) updateData.apellido = dto.apellido
      if (dto.nombre !== undefined) updateData.nombre = dto.nombre
      if (dto.documento !== undefined) updateData.documento = dto.documento
      if (dto.nacionalidad !== undefined) updateData.nacionalidad = dto.nacionalidad
      if (dto.tipoPastor !== undefined) updateData.tipoPastor = dto.tipoPastor
      if (dto.fotoUrl !== undefined) updateData.fotoUrl = dto.fotoUrl
      if (dto.activa !== undefined) updateData.activa = dto.activa
      
      // Parsear fechas a Date
      if (dto.fechaNacimiento) {
        updateData.fechaNacimiento = this.parseDateString(dto.fechaNacimiento)
      }
      
      if (dto.fechaVencimiento) {
        updateData.fechaVencimiento = this.parseDateString(dto.fechaVencimiento)
      }

      const updated = await this.prisma.credencialMinisterial.update({
        where: { id },
        data: updateData,
      })

      this.logger.log(`✅ Credencial ministerial actualizada: ${id}`)

      // Emitir evento de sincronización
      this.dataSyncGateway.emitCredencialUpdated(id, 'ministerial')

      return updated
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar credencial ministerial: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene todas las credenciales con filtros y estados calculados
   */
  async findAllWithFilters(
    page: number = 1,
    limit: number = 20,
    filters?: CredencialMinisterialFilterDto
  ): Promise<{
    data: CredencialMinisterialWithEstado[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const skip = (page - 1) * limit
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      const where: Prisma.CredencialMinisterialWhereInput = {}

      // Filtrar por activa solo si se especifica en los filtros
      if (filters?.activa !== undefined) {
        where.activa = filters.activa
      } else {
        // Por defecto, mostrar solo las activas
        where.activa = true
      }

      if (filters?.documento && filters.documento.trim()) {
        where.documento = {
          contains: filters.documento.trim(),
          mode: 'insensitive',
        }
      }

      if (filters?.estado && filters.estado.trim()) {
        if (filters.estado === 'vencida') {
          where.fechaVencimiento = {
            lt: hoy,
          }
        } else if (filters.estado === 'por_vencer') {
          where.fechaVencimiento = {
            gte: hoy,
            lte: en30Dias,
          }
        } else if (filters.estado === 'vigente') {
          where.fechaVencimiento = {
            gt: en30Dias,
          }
        }
      }

      this.logger.log(
        `🔍 Buscando credenciales ministeriales con filtros: ${JSON.stringify(where)}`
      )

      const [data, total] = await Promise.all([
        this.prisma.credencialMinisterial.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaVencimiento: 'asc' },
        }),
        this.prisma.credencialMinisterial.count({ where }),
      ])

      this.logger.log(
        `✅ Encontradas ${data.length} credenciales de un total de ${total}`
      )

      // Calcular estados para cada credencial
      const dataWithEstado: CredencialMinisterialWithEstado[] = data.map((credencial) => {
        const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)
        return {
          ...credencial,
          estado,
          diasRestantes,
        }
      })

      return {
        data: dataWithEstado,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credenciales ministeriales: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene una credencial por ID con estado calculado
   */
  async findOneWithEstado(id: string): Promise<CredencialMinisterialWithEstado> {
    try {
      const credencial = await this.prisma.credencialMinisterial.findUnique({
        where: { id },
      })

      if (!credencial) {
        throw new NotFoundException(`Credencial con ID ${id} no encontrada`)
      }

      const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)

      return {
        ...credencial,
        estado,
        diasRestantes,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credencial ministerial: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Envía notificación push sobre el estado de una credencial a través de la app móvil
   * Busca al pastor por documento y envía notificación push si tiene device tokens
   */
  async enviarNotificacionEstadoCredencial(
    credencial: CredencialMinisterial
  ): Promise<boolean> {
    try {
      const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)

      // Buscar pastor por documento (las credenciales pueden estar asociadas a pastores)
      // Intentar buscar por documento en la tabla de pastores
      // Nota: Esto requiere que el documento de la credencial coincida con algún identificador del pastor
      // Por ahora, buscaremos pastores que puedan tener el mismo documento
      const pastores = await this.prisma.pastor.findMany({
        where: {
          activo: true,
        },
        include: {
          auth: {
            include: {
              deviceTokens: {
                where: { active: true },
              },
            },
          },
        },
      })

      // Buscar pastor que coincida con la credencial
      // Estrategia de búsqueda:
      // 1. Buscar por nombre y apellido exactos (más confiable)
      // 2. Si no se encuentra, buscar por nombre o apellido parcial (más flexible)
      let pastorEncontrado = pastores.find(
        (p) =>
          p.nombre.toLowerCase().trim() === credencial.nombre.toLowerCase().trim() &&
          p.apellido.toLowerCase().trim() === credencial.apellido.toLowerCase().trim() &&
          p.auth &&
          p.auth.deviceTokens.length > 0
      )

      // Si no encontramos coincidencia exacta, intentar búsqueda flexible
      if (!pastorEncontrado) {
        pastorEncontrado = pastores.find(
          (p) =>
            (p.nombre.toLowerCase().trim().includes(credencial.nombre.toLowerCase().trim()) ||
              credencial.nombre.toLowerCase().trim().includes(p.nombre.toLowerCase().trim())) &&
            (p.apellido.toLowerCase().trim().includes(credencial.apellido.toLowerCase().trim()) ||
              credencial.apellido.toLowerCase().trim().includes(p.apellido.toLowerCase().trim())) &&
            p.auth &&
            p.auth.deviceTokens.length > 0
        )
      }

      // Si aún no encontramos, retornar false
      if (!pastorEncontrado) {
        this.logger.warn(
          `No se encontró pastor con device tokens para credencial ${credencial.id} (${credencial.nombre} ${credencial.apellido})`
        )
        return false
      }

      // Preparar mensaje según el estado
      let titulo = ''
      let mensaje = ''
      const nombreCompleto = `${credencial.nombre} ${credencial.apellido}`

      if (estado === 'vencida') {
        titulo = '⚠️ Credencial Vencida'
        mensaje = `${nombreCompleto}, tu credencial ministerial ha vencido hace ${diasRestantes} día(s). Por favor, renueva tu credencial para continuar ejerciendo tus funciones ministeriales.`
      } else if (estado === 'por_vencer') {
        titulo = '⏰ Credencial por Vencer'
        mensaje = `${nombreCompleto}, tu credencial ministerial vence en ${diasRestantes} día(s). Por favor, renueva tu credencial antes de la fecha de vencimiento (${this.formatDate(credencial.fechaVencimiento)}).`
      } else {
        titulo = '✅ Credencial Vigente'
        mensaje = `${nombreCompleto}, tu credencial ministerial está vigente. Vence en ${diasRestantes} día(s) (${this.formatDate(credencial.fechaVencimiento)}).`
      }

      // Enviar notificación push usando NotificationsService
      if (pastorEncontrado.auth && pastorEncontrado.auth.email) {
        const email = pastorEncontrado.auth.email
        const resultado = await this.notificationsService.sendNotificationToUser(
          email,
          titulo,
          mensaje,
          {
            type: 'credencial_estado',
            credencialId: credencial.id,
            estado,
            diasRestantes,
            fechaVencimiento: credencial.fechaVencimiento.toISOString(),
            documento: credencial.documento,
          }
        )

        if (resultado) {
          this.logger.log(
            `✅ Notificación push enviada a ${email} sobre estado de credencial ${credencial.id} (${estado})`
          )
        } else {
          this.logger.warn(
            `⚠️ No se pudo enviar notificación push a ${email} sobre credencial ${credencial.id}`
          )
        }

        return resultado
      }

      return false
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(
        `Error enviando notificación de estado de credencial ${credencial.id}:`,
        errorMessage
      )
      return false
    }
  }

  /**
   * Envía recordatorios de estado de credenciales a todos los usuarios con credenciales
   * Se puede ejecutar manualmente o mediante cron job
   */
  async enviarRecordatoriosEstadoCredenciales(): Promise<{
    enviados: number
    fallidos: number
    detalles: Array<{
      credencialId: string
      documento: string
      nombre: string
      estado: string
      exito: boolean
    }>
  }> {
    try {
      this.logger.log('📱 Iniciando envío de recordatorios de estado de credenciales...')

      // Obtener todas las credenciales activas
      const credenciales = await this.prisma.credencialMinisterial.findMany({
        where: {
          activa: true,
        },
      })

      this.logger.log(`📋 Encontradas ${credenciales.length} credenciales activas`)

      let enviados = 0
      let fallidos = 0
      const detalles: Array<{
        credencialId: string
        documento: string
        nombre: string
        estado: string
        exito: boolean
      }> = []

      // Procesar cada credencial
      for (const credencial of credenciales) {
        try {
          const { estado } = this.calcularEstado(credencial.fechaVencimiento)

          // Solo enviar notificaciones para credenciales por vencer o vencidas
          // Las vigentes se pueden notificar también, pero con menor prioridad
          const resultado = await this.enviarNotificacionEstadoCredencial(credencial)

          detalles.push({
            credencialId: credencial.id,
            documento: credencial.documento,
            nombre: `${credencial.nombre} ${credencial.apellido}`,
            estado,
            exito: resultado,
          })

          if (resultado) {
            enviados++
          } else {
            fallidos++
          }

          // Pequeño delay para evitar saturar
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error: unknown) {
          fallidos++
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          this.logger.error(
            `Error procesando credencial ${credencial.id}:`,
            errorMessage
          )
          detalles.push({
            credencialId: credencial.id,
            documento: credencial.documento,
            nombre: `${credencial.nombre} ${credencial.apellido}`,
            estado: 'error',
            exito: false,
          })
        }
      }

      this.logger.log(
        `📊 Recordatorios de credenciales: ${enviados} enviados, ${fallidos} fallidos`
      )

      return { enviados, fallidos, detalles }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error('Error en enviarRecordatoriosEstadoCredenciales:', errorMessage)
      throw error
    }
  }

  /**
   * Formatea una fecha para mostrar en mensajes
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Obtiene el estado de una credencial por documento
   * Útil para que los usuarios consulten su credencial desde la app móvil
   */
  /**
   * Normaliza un documento removiendo espacios, guiones y convirtiendo a mayúsculas
   * para hacer búsquedas más flexibles
   */
  private normalizarDocumento(documento: string): string {
    return documento.trim().replace(/[\s-]/g, '').toUpperCase()
  }

  async obtenerEstadoPorDocumento(documento: string): Promise<CredencialMinisterialWithEstado | null> {
    try {
      // Normalizar el documento para búsqueda flexible
      const documentoNormalizado = this.normalizarDocumento(documento)
      this.logger.log(`Buscando credencial ministerial con documento: "${documento}" (normalizado: "${documentoNormalizado}")`)

      // Primero intentar búsqueda exacta
      let credencial = await this.prisma.credencialMinisterial.findUnique({
        where: { documento },
      })

      // Si no se encuentra, intentar con documento normalizado
      if (!credencial) {
        // Buscar todas las credenciales y comparar documentos normalizados
        const todasLasCredenciales = await this.prisma.credencialMinisterial.findMany({
          where: { activa: true },
        })

        credencial = todasLasCredenciales.find(
          c => this.normalizarDocumento(c.documento) === documentoNormalizado
        ) || null

        if (credencial) {
          this.logger.log(`✅ Credencial encontrada con búsqueda normalizada para documento: "${documento}"`)
        }
      } else {
        this.logger.log(`✅ Credencial encontrada con búsqueda exacta para documento: "${documento}"`)
      }

      if (!credencial) {
        this.logger.warn(`⚠️ No se encontró credencial ministerial para documento: "${documento}" (normalizado: "${documentoNormalizado}")`)
        return null
      }

      const { estado, diasRestantes } = this.calcularEstado(credencial.fechaVencimiento)

      return {
        ...credencial,
        estado,
        diasRestantes,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error obteniendo credencial por documento ${documento}:`, errorMessage)
      throw error
    }
  }

}

