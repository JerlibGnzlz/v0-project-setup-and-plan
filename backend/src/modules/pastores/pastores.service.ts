import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreatePastorDto, UpdatePastorDto } from "./dto/pastor.dto"
import { BaseService } from "../../common/base.service"
import { Pastor } from "@prisma/client"

/**
 * Servicio para gestión de Pastores
 * 
 * Extiende BaseService para heredar operaciones CRUD básicas
 * y añade lógica de negocio específica para pastores
 */
@Injectable()
export class PastoresService extends BaseService<
  Pastor,
  CreatePastorDto,
  UpdatePastorDto
> {
  private readonly logger = new Logger(PastoresService.name)

  constructor(private prisma: PrismaService) {
    super(prisma.pastor, { entityName: 'Pastor' })
  }

  /**
   * Sobrescribe findAll para ordenar por nombre
   */
  override async findAll(): Promise<Pastor[]> {
    return this.model.findMany({
      orderBy: { nombre: "asc" },
    })
  }

  /**
   * Obtiene solo los pastores activos
   */
  async findActive(): Promise<Pastor[]> {
    return this.model.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    })
  }

  /**
   * Sobrescribe remove para hacer soft delete
   * En lugar de eliminar, marca como inactivo
   */
  override async remove(id: string): Promise<Pastor> {
    this.logger.log(`🗑️ Desactivando pastor: ${id}`)

    return this.model.update({
      where: { id },
      data: { activo: false },
    })
  }

  /**
   * Elimina permanentemente un pastor (hard delete)
   * Usar con precaución
   */
  async hardDelete(id: string): Promise<Pastor> {
    this.logger.warn(`⚠️ Eliminación permanente de pastor: ${id}`)

    return this.model.delete({
      where: { id },
    })
  }

  /**
   * Reactiva un pastor previamente desactivado
   */
  async reactivate(id: string): Promise<Pastor> {
    this.logger.log(`✅ Reactivando pastor: ${id}`)

    return this.model.update({
      where: { id },
      data: { activo: true },
    })
  }

  /**
   * Busca pastores por región
   */
  async findByRegion(region: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        region,
        activo: true
      },
      orderBy: { nombre: "asc" },
    })
  }

  /**
   * Busca pastores por país
   */
  async findByPais(pais: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        pais,
        activo: true
      },
      orderBy: { nombre: "asc" },
    })
  }

  /**
   * Cuenta pastores activos
   */
  async countActive(): Promise<number> {
    return this.count({ activo: true })
  }

  /**
   * Obtiene estadísticas de pastores
   */
  async getStats(): Promise<{
    total: number
    activos: number
    inactivos: number
  }> {
    const [total, activos] = await Promise.all([
      this.count(),
      this.count({ activo: true }),
    ])

    return {
      total,
      activos,
      inactivos: total - activos,
    }
  }
}
