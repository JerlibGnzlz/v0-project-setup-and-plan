import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSedeDto, UpdateSedeDto } from './dto/sede.dto'
import { BaseService } from '../../common/base.service'
import { Sede } from '@prisma/client'
import { PrismaModelDelegate } from '../../common/types/prisma.types'

/**
 * Servicio para gestión de Sedes
 * Gestiona las ubicaciones/sedes del ministerio para mostrar en la landing page
 */
@Injectable()
export class SedesService extends BaseService<Sede, CreateSedeDto, UpdateSedeDto> {
  private readonly logger = new Logger(SedesService.name)

  constructor(private prisma: PrismaService) {
    super(prisma.sede as unknown as PrismaModelDelegate<Sede>, { entityName: 'Sede' })
  }

  /**
   * Sobrescribe findAll para ordenar por orden y luego por país
   * Solo retorna sedes activas por defecto
   */
  override async findAll(): Promise<Sede[]> {
    return this.model.findMany({
      where: { activa: true },
      orderBy: [
        { orden: 'asc' },
        { pais: 'asc' },
      ],
    })
  }

  /**
   * Encuentra todas las sedes (incluyendo inactivas) ordenadas
   */
  async findAllIncludingInactive(): Promise<Sede[]> {
    return this.model.findMany({
      orderBy: [
        { orden: 'asc' },
        { pais: 'asc' },
      ],
    })
  }

  /**
   * Cuenta el total de sedes activas
   */
  async getTotalActiveCount(): Promise<number> {
    return this.model.count({
      where: { activa: true },
    })
  }
}

