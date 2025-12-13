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
    private notificationsService: NotificationsService
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
        const admins = await this.prisma.user.findMany({
          where: { activo: true },
        })

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
          `⚠️ Intento de crear credencial duplicada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
        )

        throw new ConflictException(
          `Ya existe una credencial con el documento ${dto.documento}`
        )
      }

      // Parsear fechas correctamente (sin problemas de timezone)
      // Las fechas vienen como string en formato YYYY-MM-DD
      const fechaNacimiento = this.parseDateString(dto.fechaNacimiento)
      const fechaVencimiento = this.parseDateString(dto.fechaVencimiento)

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
        },
      })

      this.logger.log(
        `✅ Credencial ministerial creada: ${dto.documento} - ${dto.nombre} ${dto.apellido}`
      )

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

      // Parsear fechas correctamente si se proporcionan
      const updateData: Partial<CredencialMinisterial> = { ...dto }
      
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

}

