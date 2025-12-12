import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateCredencialPastoralDto,
  UpdateCredencialPastoralDto,
  CredencialFilterDto,
} from './dto/credencial-pastoral.dto'
import { CredencialPastoral, EstadoCredencial, Prisma } from '@prisma/client'
import { BaseService } from '../../common/base.service'
import { PrismaModelDelegate } from '../../common/types/prisma.types'

export interface CredencialWithPastor extends CredencialPastoral {
  pastor: {
    id: string
    nombre: string
    apellido: string
    email: string | null
    telefono: string | null
  }
}

/**
 * Servicio para gestión de Credenciales Pastorales
 *
 * Gestiona las credenciales ministeriales de los pastores,
 * incluyendo fechas de emisión, vencimiento y estados.
 */
@Injectable()
export class CredencialesPastoralesService extends BaseService<
  CredencialPastoral,
  CreateCredencialPastoralDto,
  UpdateCredencialPastoralDto
> {
  private readonly logger = new Logger(CredencialesPastoralesService.name)

  constructor(private prisma: PrismaService) {
    super(
      prisma.credencialPastoral as unknown as PrismaModelDelegate<CredencialPastoral>,
      { entityName: 'CredencialPastoral' }
    )
  }

  /**
   * Crea una nueva credencial pastoral
   */
  override async create(
    dto: CreateCredencialPastoralDto
  ): Promise<CredencialPastoral> {
    try {
      // Verificar que el pastor existe
      const pastor = await this.prisma.pastor.findUnique({
        where: { id: dto.pastorId },
      })

      if (!pastor) {
        throw new NotFoundException(`Pastor con ID ${dto.pastorId} no encontrado`)
      }

      // Verificar que el número de credencial no existe
      const credencialExistente = await this.prisma.credencialPastoral.findUnique({
        where: { numeroCredencial: dto.numeroCredencial },
      })

      if (credencialExistente) {
        throw new ConflictException(
          `Ya existe una credencial con el número ${dto.numeroCredencial}`
        )
      }

      // Calcular estado basado en fecha de vencimiento
      const fechaVencimiento = new Date(dto.fechaVencimiento)
      const hoy = new Date()
      const diasHastaVencimiento = Math.ceil(
        (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      )

      let estado = dto.estado || EstadoCredencial.VIGENTE
      if (fechaVencimiento < hoy) {
        estado = EstadoCredencial.VENCIDA
      } else if (diasHastaVencimiento <= 30) {
        estado = EstadoCredencial.POR_VENCER
      }

      const credencial = await this.prisma.credencialPastoral.create({
        data: {
          pastorId: dto.pastorId,
          numeroCredencial: dto.numeroCredencial,
          fechaEmision: new Date(dto.fechaEmision),
          fechaVencimiento: new Date(dto.fechaVencimiento),
          estado,
          activa: dto.activa ?? true,
          notas: dto.notas,
        },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
      })

      this.logger.log(`✅ Credencial creada: ${dto.numeroCredencial} para pastor ${pastor.nombre} ${pastor.apellido}`)

      return credencial
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al crear credencial: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Actualiza una credencial pastoral
   */
  override async update(
    id: string,
    dto: UpdateCredencialPastoralDto
  ): Promise<CredencialPastoral> {
    try {
      const credencial = await this.prisma.credencialPastoral.findUnique({
        where: { id },
      })

      if (!credencial) {
        throw new NotFoundException(`Credencial con ID ${id} no encontrada`)
      }

      // Si se actualiza el número, verificar que no existe
      if (dto.numeroCredencial && dto.numeroCredencial !== credencial.numeroCredencial) {
        const credencialExistente = await this.prisma.credencialPastoral.findUnique({
          where: { numeroCredencial: dto.numeroCredencial },
        })

        if (credencialExistente) {
          throw new ConflictException(
            `Ya existe una credencial con el número ${dto.numeroCredencial}`
          )
        }
      }

      // Calcular estado si se actualiza la fecha de vencimiento
      let estado = dto.estado
      if (dto.fechaVencimiento) {
        const fechaVencimiento = new Date(dto.fechaVencimiento)
        const hoy = new Date()
        const diasHastaVencimiento = Math.ceil(
          (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (fechaVencimiento < hoy) {
          estado = EstadoCredencial.VENCIDA
        } else if (diasHastaVencimiento <= 30) {
          estado = EstadoCredencial.POR_VENCER
        } else {
          estado = EstadoCredencial.VIGENTE
        }
      }

      const updated = await this.prisma.credencialPastoral.update({
        where: { id },
        data: {
          ...dto,
          fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : undefined,
          fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
          estado,
        },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
      })

      this.logger.log(`✅ Credencial actualizada: ${id}`)

      return updated
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar credencial: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene todas las credenciales con filtros
   */
  async findAllWithFilters(
    page: number = 1,
    limit: number = 20,
    filters?: CredencialFilterDto
  ): Promise<{
    data: CredencialWithPastor[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const skip = (page - 1) * limit

      const where: Prisma.CredencialPastoralWhereInput = {}

      if (filters?.estado) {
        where.estado = filters.estado
      }

      if (filters?.activa !== undefined) {
        where.activa = filters.activa
      }

      if (filters?.pastorId) {
        where.pastorId = filters.pastorId
      }

      if (filters?.numeroCredencial) {
        where.numeroCredencial = {
          contains: filters.numeroCredencial,
          mode: 'insensitive',
        }
      }

      const [data, total] = await Promise.all([
        this.prisma.credencialPastoral.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaVencimiento: 'asc' },
          include: {
            pastor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
              },
            },
          },
        }),
        this.prisma.credencialPastoral.count({ where }),
      ])

      return {
        data: data as CredencialWithPastor[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credenciales: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene credenciales por vencer (próximos 30 días)
   */
  async findPorVencer(): Promise<CredencialWithPastor[]> {
    try {
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      const credenciales = await this.prisma.credencialPastoral.findMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gte: hoy,
            lte: en30Dias,
          },
          estado: {
            in: [EstadoCredencial.VIGENTE, EstadoCredencial.POR_VENCER],
          },
        },
        orderBy: { fechaVencimiento: 'asc' },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
      })

      return credenciales as CredencialWithPastor[]
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credenciales por vencer: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene credenciales vencidas
   */
  async findVencidas(): Promise<CredencialWithPastor[]> {
    try {
      const hoy = new Date()

      const credenciales = await this.prisma.credencialPastoral.findMany({
        where: {
          activa: true,
          fechaVencimiento: {
            lt: hoy,
          },
          estado: EstadoCredencial.VENCIDA,
        },
        orderBy: { fechaVencimiento: 'desc' },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
      })

      return credenciales as CredencialWithPastor[]
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credenciales vencidas: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Actualiza el estado de todas las credenciales basado en fechas
   */
  async actualizarEstados(): Promise<{ actualizadas: number }> {
    try {
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      // Actualizar credenciales vencidas
      const vencidas = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            lt: hoy,
          },
          estado: {
            not: EstadoCredencial.VENCIDA,
          },
        },
        data: {
          estado: EstadoCredencial.VENCIDA,
        },
      })

      // Actualizar credenciales por vencer
      const porVencer = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gte: hoy,
            lte: en30Dias,
          },
          estado: {
            not: EstadoCredencial.POR_VENCER,
          },
        },
        data: {
          estado: EstadoCredencial.POR_VENCER,
        },
      })

      // Actualizar credenciales vigentes (más de 30 días)
      const vigentes = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gt: en30Dias,
          },
          estado: {
            not: EstadoCredencial.VIGENTE,
          },
        },
        data: {
          estado: EstadoCredencial.VIGENTE,
        },
      })

      const total = vencidas.count + porVencer.count + vigentes.count

      this.logger.log(
        `✅ Estados actualizados: ${vencidas.count} vencidas, ${porVencer.count} por vencer, ${vigentes.count} vigentes`
      )

      return { actualizadas: total }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar estados: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtiene una credencial con su pastor
   */
  async findOneWithPastor(id: string): Promise<CredencialWithPastor> {
    try {
      const credencial = await this.prisma.credencialPastoral.findUnique({
        where: { id },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
      })

      if (!credencial) {
        throw new NotFoundException(`Credencial con ID ${id} no encontrada`)
      }

      return credencial as CredencialWithPastor
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al obtener credencial: ${errorMessage}`)
      throw error
    }
  }
}

