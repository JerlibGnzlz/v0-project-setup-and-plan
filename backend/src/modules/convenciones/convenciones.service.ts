import { Injectable, Logger } from '@nestjs/common'
import { CreateConvencionDto, UpdateConvencionDto } from './dto/convencion.dto'
import { ConvencionRepository } from './repositories/convencion.repository'
import { Convencion, Prisma } from '@prisma/client'

/**
 * Servicio para gestión de Convenciones
 *
 * Clean Architecture:
 * - El servicio contiene la lógica de negocio
 * - Usa el repositorio para acceso a datos (no conoce Prisma directamente)
 * - Fácil de testear con mocks del repositorio
 *
 * SOLID:
 * - S: Solo maneja lógica de negocio de convenciones
 * - O: Abierto para extensión (métodos pueden añadirse)
 * - D: Depende de la abstracción (repositorio), no de Prisma
 */
@Injectable()
export class ConvencionesService {
  private readonly logger = new Logger(ConvencionesService.name)

  constructor(private readonly repository: ConvencionRepository) {}

  /**
   * Obtiene todas las convenciones
   */
  async findAll(): Promise<Convencion[]> {
    return this.repository.findAll()
  }

  /**
   * Obtiene una convención por ID
   */
  async findOne(id: string): Promise<Convencion> {
    return this.repository.findByIdOrFail(id)
  }

  /**
   * Encuentra la convención activa actual
   */
  async findActive(): Promise<Convencion | null> {
    const convencion = await this.repository.findActive()

    this.logger.log(
      convencion ? `✅ Convención activa: ${convencion.titulo}` : '📭 No hay convención activa'
    )

    return convencion
  }

  /**
   * Crea una nueva convención
   */
  async create(dto: CreateConvencionDto): Promise<Convencion> {
    this.logger.log(`📝 Creando convención: ${dto.titulo}`)
    // Convertir fechas de string a Date y costo a Decimal si es necesario
    const data: Prisma.ConvencionCreateInput = {
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: new Date(dto.fechaFin),
      ubicacion: dto.ubicacion,
      costo: dto.costo !== undefined ? new Prisma.Decimal(dto.costo) : undefined,
      cupoMaximo: dto.cupoMaximo,
      imagenUrl: dto.imagenUrl || null,
      activa: dto.activa ?? false,
      archivada: dto.archivada ?? false,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.repository.create(data as any)
  }

  /**
   * Actualiza una convención
   * Si se activa, desactiva todas las demás
   */
  async update(id: string, dto: UpdateConvencionDto): Promise<Convencion> {
    // Convertir fechas de string a Date si vienen y costo a Decimal
    const data: Prisma.ConvencionUpdateInput = {}
    
    if (dto.titulo !== undefined) data.titulo = dto.titulo
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion
    if (dto.fechaInicio !== undefined) data.fechaInicio = new Date(dto.fechaInicio)
    if (dto.fechaFin !== undefined) data.fechaFin = new Date(dto.fechaFin)
    if (dto.ubicacion !== undefined) data.ubicacion = dto.ubicacion
    if (dto.costo !== undefined) data.costo = new Prisma.Decimal(dto.costo)
    if (dto.cupoMaximo !== undefined) data.cupoMaximo = dto.cupoMaximo
    if (dto.imagenUrl !== undefined) data.imagenUrl = dto.imagenUrl
    if (dto.activa !== undefined) data.activa = dto.activa

    this.logger.log(`📝 Actualizando convención: ${id}`)

    try {
      // Lógica de negocio: Si se activa, desactivar las demás
      if (data.activa === true) {
        await this.deactivateOthers(id)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.repository.update(id, data as any)

      this.logger.log(`✅ Convención actualizada: ${result.titulo} (activa: ${result.activa})`)
      return result
    } catch (error) {
      this.logger.error(`❌ Error actualizando convención: ${error}`)
      throw error
    }
  }

  /**
   * Archiva una convención
   */
  async archivar(id: string): Promise<Convencion> {
    this.logger.log(`📦 Archiving convención: ${id}`)
    const convencion = await this.repository.findByIdOrFail(id)

    return this.repository.update(id, {
      archivada: true,
      fechaArchivado: new Date(),
      activa: false, // Desactivar automáticamente al archivar
    })
  }

  /**
   * Desarchiva una convención
   */
  async desarchivar(id: string): Promise<Convencion> {
    this.logger.log(`📦 Unarchiving convención: ${id}`)
    return this.repository.update(id, {
      archivada: false,
      fechaArchivado: null,
    })
  }

  /**
   * Elimina una convención
   */
  async remove(id: string): Promise<Convencion> {
    this.logger.warn(`🗑️ Eliminando convención: ${id}`)
    return this.repository.delete(id)
  }

  /**
   * Activa una convención específica
   * Desactiva todas las demás automáticamente
   */
  async activate(id: string): Promise<Convencion> {
    this.logger.log(`🔓 Activando convención: ${id}`)

    await this.deactivateOthers(id)
    return this.repository.activate(id)
  }

  /**
   * Desactiva una convención
   */
  async deactivate(id: string): Promise<Convencion> {
    this.logger.log(`🔒 Desactivando convención: ${id}`)
    return this.repository.deactivate(id)
  }

  /**
   * Obtiene convenciones próximas
   */
  async findUpcoming(): Promise<Convencion[]> {
    return this.repository.findUpcoming()
  }

  /**
   * Obtiene convenciones pasadas
   */
  async findPast(): Promise<Convencion[]> {
    return this.repository.findPast()
  }

  /**
   * Verifica si hay una convención activa
   */
  async hasActiveConvention(): Promise<boolean> {
    return this.repository.hasActiveConvention()
  }

  /**
   * Cuenta el total de convenciones
   */
  async count(): Promise<number> {
    return this.repository.count()
  }

  /**
   * Obtiene estadísticas de convenciones
   */
  async getStats(): Promise<{
    total: number
    activas: number
    proximas: number
    pasadas: number
  }> {
    const [total, activas, proximas, pasadas] = await Promise.all([
      this.repository.count(),
      this.repository.count({ activa: true }),
      this.repository.findUpcoming().then(c => c.length),
      this.repository.findPast().then(c => c.length),
    ])

    return { total, activas, proximas, pasadas }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Desactiva todas las convenciones excepto la especificada
   */
  private async deactivateOthers(excludeId: string): Promise<void> {
    this.logger.log('🔄 Desactivando otras convenciones...')
    await this.repository.deactivateAll(excludeId)
  }
}
