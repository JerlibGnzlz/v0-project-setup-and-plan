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
import { CredencialMinisterial, Prisma } from '@prisma/client'
import { BaseService } from '../../common/base.service'
import { PrismaModelDelegate } from '../../common/types/prisma.types'

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

  constructor(private prisma: PrismaService) {
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
        throw new ConflictException(
          `Ya existe una credencial con el documento ${dto.documento}`
        )
      }

      const credencial = await this.prisma.credencialMinisterial.create({
        data: {
          apellido: dto.apellido,
          nombre: dto.nombre,
          documento: dto.documento,
          nacionalidad: dto.nacionalidad,
          fechaNacimiento: new Date(dto.fechaNacimiento),
          tipoPastor: dto.tipoPastor || 'PASTOR',
          fechaVencimiento: new Date(dto.fechaVencimiento),
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
          throw new ConflictException(
            `Ya existe una credencial con el documento ${dto.documento}`
          )
        }
      }

      const updated = await this.prisma.credencialMinisterial.update({
        where: { id },
        data: {
          ...dto,
          fechaNacimiento: dto.fechaNacimiento
            ? new Date(dto.fechaNacimiento)
            : undefined,
          fechaVencimiento: dto.fechaVencimiento
            ? new Date(dto.fechaVencimiento)
            : undefined,
        },
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

      const where: Prisma.CredencialMinisterialWhereInput = {
        activa: true,
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

      const [data, total] = await Promise.all([
        this.prisma.credencialMinisterial.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaVencimiento: 'asc' },
        }),
        this.prisma.credencialMinisterial.count({ where }),
      ])

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

