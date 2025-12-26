import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateCredencialCapellaniaDto,
  UpdateCredencialCapellaniaDto,
  CredencialCapellaniaFilterDto,
} from './dto/credencial-capellania.dto'
import { CredencialCapellania, Prisma } from '@prisma/client'
import { BaseService } from '../../common/base.service'
import { PrismaModelDelegate } from '../../common/types/prisma.types'
import { NotificationsService } from '../notifications/notifications.service'
import { DataSyncGateway } from '../data-sync/data-sync.gateway'

export interface CredencialCapellaniaWithEstado extends CredencialCapellania {
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes: number
}

/**
 * Servicio para gestión de Credenciales de Capellanía Físicas
 *
 * Gestiona las credenciales físicas de los capellanes con información
 * completa para impresión (frente y dorso).
 */
@Injectable()
export class CredencialesCapellaniaService extends BaseService<
  CredencialCapellania,
  CreateCredencialCapellaniaDto,
  UpdateCredencialCapellaniaDto
> {
  private readonly logger = new Logger(CredencialesCapellaniaService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private dataSyncGateway: DataSyncGateway
  ) {
    super(
      prisma.credencialCapellania as unknown as PrismaModelDelegate<CredencialCapellania>,
      { entityName: 'CredencialCapellania' }
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
   * Crea una nueva credencial de capellanía
   */
  override async create(
    dto: CreateCredencialCapellaniaDto
  ): Promise<CredencialCapellania> {
    try {
      // Verificar que el documento no existe
      const credencialExistente = await this.prisma.credencialCapellania.findUnique({
        where: { documento: dto.documento },
      })

      if (credencialExistente) {
        // Enviar notificación a todos los admins
        const admins = await this.prisma.user.findMany()

        const titulo = 'Intento de crear credencial de capellanía duplicada'
        const mensaje = `Se intentó crear una credencial con el documento ${dto.documento} que ya existe. La credencial existente pertenece a ${credencialExistente.nombre} ${credencialExistente.apellido}.`

        for (const admin of admins) {
          await this.notificationsService.sendNotificationToAdmin(
            admin.email,
            titulo,
            mensaje,
            {
              tipo: 'credencial_capellania_duplicada',
              documento: dto.documento,
              credencialExistenteId: credencialExistente.id,
            }
          )
        }

        this.logger.warn(
          `⚠️ Intento de crear credencial de capellanía duplicada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
        )

        throw new ConflictException(
          `Ya existe una credencial DE CAPELLANÍA con el documento ${dto.documento}. Nota: Una persona puede tener credenciales ministeriales y de capellanía con el mismo DNI, pero no puede tener dos credenciales del mismo tipo.`
        )
      }

      // Parsear fechas correctamente (sin problemas de timezone)
      // Las fechas vienen como string en formato YYYY-MM-DD
      const fechaNacimiento = this.parseDateString(dto.fechaNacimiento)
      const fechaVencimiento = this.parseDateString(dto.fechaVencimiento)

      const credencial = await this.prisma.credencialCapellania.create({
        data: {
          apellido: dto.apellido,
          nombre: dto.nombre,
          documento: dto.documento,
          nacionalidad: dto.nacionalidad,
          fechaNacimiento,
          tipoCapellan: dto.tipoCapellan || 'CAPELLAN',
          fechaVencimiento,
          fotoUrl: dto.fotoUrl,
          activa: dto.activa ?? true,
        },
      })

      this.logger.log(
        `✅ Credencial de capellanía creada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
      )

      // Emitir evento de sincronización
      this.dataSyncGateway.emitCredencialUpdated(credencial.id, 'capellania')

      return credencial
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al crear credencial de capellanía: ${errorMessage}`)
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
   * Actualiza una credencial de capellanía
   */
  override async update(
    id: string,
    dto: UpdateCredencialCapellaniaDto
  ): Promise<CredencialCapellania> {
    try {
      const credencial = await this.prisma.credencialCapellania.findUnique({
        where: { id },
      })

      if (!credencial) {
        throw new NotFoundException(`Credencial con ID ${id} no encontrada`)
      }

      // Si se actualiza el documento, verificar que no existe
      if (dto.documento && dto.documento !== credencial.documento) {
        const credencialExistente = await this.prisma.credencialCapellania.findUnique({
          where: { documento: dto.documento },
        })

        if (credencialExistente) {
          // Enviar notificación a todos los admins
          const admins = await this.prisma.user.findMany()

          const titulo = 'Intento de actualizar credencial de capellanía con documento duplicado'
          const mensaje = `Se intentó actualizar la credencial ${id} con el documento ${dto.documento} que ya existe. La credencial existente pertenece a ${credencialExistente.nombre} ${credencialExistente.apellido}.`

          for (const admin of admins) {
            await this.notificationsService.sendNotificationToAdmin(
              admin.email,
              titulo,
              mensaje,
              {
                tipo: 'credencial_capellania_duplicada',
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
      const updateData: Prisma.CredencialCapellaniaUpdateInput = {}
      
      // Copiar campos que no son fechas
      if (dto.apellido !== undefined) updateData.apellido = dto.apellido
      if (dto.nombre !== undefined) updateData.nombre = dto.nombre
      if (dto.documento !== undefined) updateData.documento = dto.documento
      if (dto.nacionalidad !== undefined) updateData.nacionalidad = dto.nacionalidad
      if (dto.tipoCapellan !== undefined) updateData.tipoCapellan = dto.tipoCapellan
      if (dto.fotoUrl !== undefined) updateData.fotoUrl = dto.fotoUrl
      if (dto.activa !== undefined) updateData.activa = dto.activa
      
      // Parsear fechas a Date
      if (dto.fechaNacimiento) {
        updateData.fechaNacimiento = this.parseDateString(dto.fechaNacimiento)
      }
      
      if (dto.fechaVencimiento) {
        updateData.fechaVencimiento = this.parseDateString(dto.fechaVencimiento)
      }

      const updated = await this.prisma.credencialCapellania.update({
        where: { id },
        data: updateData,
      })

      this.logger.log(`✅ Credencial de capellanía actualizada: ${id}`)

      // Emitir evento de sincronización
      this.dataSyncGateway.emitCredencialUpdated(id, 'capellania')

      return updated
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar credencial de capellanía: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene todas las credenciales con filtros y estados calculados
   */
  async findAllWithFilters(
    page: number = 1,
    limit: number = 20,
    filters?: CredencialCapellaniaFilterDto
  ): Promise<{
    data: CredencialCapellaniaWithEstado[]
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

      const where: Prisma.CredencialCapellaniaWhereInput = {}

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
        `🔍 Buscando credenciales de capellanía con filtros: ${JSON.stringify(where)}`
      )

      const [data, total] = await Promise.all([
        this.prisma.credencialCapellania.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaVencimiento: 'asc' },
        }),
        this.prisma.credencialCapellania.count({ where }),
      ])

      this.logger.log(
        `✅ Encontradas ${data.length} credenciales de un total de ${total}`
      )

      // Calcular estados para cada credencial
      const dataWithEstado: CredencialCapellaniaWithEstado[] = data.map((credencial) => {
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
      this.logger.error(`❌ Error al obtener credenciales de capellanía: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene una credencial por ID con estado calculado
   */
  async findOneWithEstado(id: string): Promise<CredencialCapellaniaWithEstado> {
    try {
      const credencial = await this.prisma.credencialCapellania.findUnique({
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
      this.logger.error(`❌ Error al obtener credencial de capellanía: ${errorMessage}`)
      throw error
    }
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

  async obtenerEstadoPorDocumento(documento: string): Promise<CredencialCapellaniaWithEstado | null> {
    try {
      // Normalizar el documento para búsqueda flexible
      const documentoNormalizado = this.normalizarDocumento(documento)
      this.logger.log(`Buscando credencial de capellanía con documento: "${documento}" (normalizado: "${documentoNormalizado}")`)

      // Primero intentar búsqueda exacta
      let credencial = await this.prisma.credencialCapellania.findUnique({
        where: { documento },
      })

      // Si no se encuentra, intentar con documento normalizado
      if (!credencial) {
        // Buscar todas las credenciales y comparar documentos normalizados
        const todasLasCredenciales = await this.prisma.credencialCapellania.findMany({
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
        this.logger.warn(`⚠️ No se encontró credencial de capellanía para documento: "${documento}" (normalizado: "${documentoNormalizado}")`)
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

