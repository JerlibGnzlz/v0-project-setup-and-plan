import { Injectable, Logger, NotFoundException } from "@nestjs/common"
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
   * Sobrescribe update para asegurar que solo DIRECTIVA puede tener mostrarEnLanding = true
   */
  override async update(id: string, data: UpdatePastorDto): Promise<Pastor> {
    // Si se está actualizando el tipo o mostrarEnLanding, validar la lógica
    const currentPastor = await this.findOneOrNull(id)
    
    if (!currentPastor) {
      throw new NotFoundException('Pastor no encontrado')
    }

    // Determinar el tipo final (el que viene en data o el actual)
    const finalTipo = data.tipo || currentPastor.tipo

    // Si el tipo no es DIRECTIVA, forzar mostrarEnLanding = false
    if (finalTipo !== 'DIRECTIVA') {
      data.mostrarEnLanding = false
      this.logger.log(`⚠️ Pastor ${id} no es DIRECTIVA, desactivando mostrarEnLanding`)
    }

    return super.update(id, data)
  }

  /**
   * Sobrescribe create para asegurar que solo DIRECTIVA puede tener mostrarEnLanding = true
   */
  override async create(data: CreatePastorDto): Promise<Pastor> {
    // Si el tipo no es DIRECTIVA, forzar mostrarEnLanding = false
    if (data.tipo && data.tipo !== 'DIRECTIVA') {
      data.mostrarEnLanding = false
      this.logger.log(`⚠️ Pastor nuevo no es DIRECTIVA, desactivando mostrarEnLanding`)
    }

    return super.create(data)
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

  /**
   * Obtiene los pastores para mostrar en la landing page
   * Solo devuelve los que tienen mostrarEnLanding = true
   * Ordenados por 'orden' y luego por nombre
   */
  async findForLanding(): Promise<Pastor[]> {
    this.logger.log('📋 Obteniendo pastores para landing page')
    
    return this.model.findMany({
      where: {
        activo: true,
        mostrarEnLanding: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })
  }

  /**
   * Obtiene pastores por tipo
   */
  async findByTipo(tipo: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        tipo: tipo as any,
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })
  }

  /**
   * Obtiene la directiva pastoral
   */
  async findDirectiva(): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        tipo: 'DIRECTIVA',
        activo: true,
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })
  }

  /**
   * Obtiene supervisores por región
   */
  async findSupervisores(region?: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        tipo: 'SUPERVISOR',
        activo: true,
        ...(region && { region }),
      },
      orderBy: [
        { region: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    })
  }
}
