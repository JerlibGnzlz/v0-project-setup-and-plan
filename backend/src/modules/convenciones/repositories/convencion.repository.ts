import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { BaseRepository } from '../../../common/base.repository'
import { Convencion, Prisma } from '@prisma/client'

/**
 * Interfaz específica para el repositorio de Convenciones
 * Extiende el contrato base con métodos específicos del dominio
 */
export interface IConvencionRepository {
  findActive(): Promise<Convencion | null>
  findUpcoming(): Promise<Convencion[]>
  findPast(): Promise<Convencion[]>
  deactivateAll(exceptId?: string): Promise<{ count: number }>
}

/**
 * Repositorio para la entidad Convencion
 *
 * Encapsula todas las operaciones de acceso a datos para convenciones
 * Permite testear la lógica de negocio sin depender de la base de datos
 */
@Injectable()
export class ConvencionRepository
  extends BaseRepository<Convencion>
  implements IConvencionRepository
{
  constructor(private prisma: PrismaService) {
    super(prisma.convencion, 'Convención')
  }

  /**
   * Obtiene todas las convenciones ordenadas por fecha
   */
  override async findAll(): Promise<Convencion[]> {
    return super.findAll({
      orderBy: { fechaFin: 'desc' } as unknown as Convencion,
    })
  }

  /**
   * Encuentra la convención activa actual
   */
  async findActive(): Promise<Convencion | null> {
    return this.findFirst({
      where: { activa: true } as unknown as Convencion,
      orderBy: { fechaInicio: 'desc' } as unknown as Convencion,
    })
  }

  /**
   * Obtiene convenciones futuras
   */
  async findUpcoming(): Promise<Convencion[]> {
    return super.findAll({
      where: {
        fechaInicio: { gte: new Date() },
      } as unknown as Convencion,
      orderBy: { fechaInicio: 'asc' } as unknown as Convencion,
    })
  }

  /**
   * Obtiene convenciones pasadas
   */
  async findPast(): Promise<Convencion[]> {
    return super.findAll({
      where: {
        fechaFin: { lt: new Date() },
      } as unknown as Convencion,
      orderBy: { fechaFin: 'desc' } as unknown as Convencion,
    })
  }

  /**
   * Desactiva todas las convenciones excepto una
   */
  async deactivateAll(exceptId?: string): Promise<{ count: number }> {
    const where: Prisma.ConvencionWhereInput = { activa: true }

    if (exceptId) {
      where.id = { not: exceptId }
    }

    return this.updateMany(where as unknown, { activa: false } as unknown)
  }

  /**
   * Activa una convención específica
   * Retorna la convención actualizada
   */
  async activate(id: string): Promise<Convencion> {
    return this.update(id, { activa: true })
  }

  /**
   * Desactiva una convención específica
   */
  async deactivate(id: string): Promise<Convencion> {
    return this.update(id, { activa: false })
  }

  /**
   * Busca convenciones por año
   */
  async findByYear(year: number): Promise<Convencion[]> {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59)

    return super.findAll({
      where: {
        fechaInicio: {
          gte: startOfYear,
          lte: endOfYear,
        },
      } as unknown as Convencion,
      orderBy: { fechaInicio: 'asc' } as unknown as Convencion,
    })
  }

  /**
   * Verifica si hay una convención activa
   */
  async hasActiveConvention(): Promise<boolean> {
    return this.exists({ activa: true })
  }
}
