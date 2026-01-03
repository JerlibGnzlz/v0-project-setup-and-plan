import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../../common/services/audit.service'
import { CreateGaleriaDto, UpdateGaleriaDto, TipoGaleria } from './dto/galeria.dto'
import { BaseService } from '../../common/base.service'
import { GaleriaImagen } from '@prisma/client'
import { PrismaModelDelegate } from '../../common/types/prisma.types'

/**
 * Servicio para gestión de Galería (imágenes y videos)
 *
 * Extiende BaseService para heredar operaciones CRUD básicas
 * y añade lógica de negocio específica para galería
 */
@Injectable()
export class GaleriaService extends BaseService<GaleriaImagen, CreateGaleriaDto, UpdateGaleriaDto> {
  private readonly logger = new Logger(GaleriaService.name)

  // Límites de elementos para la landing page (solo visualización)
  // El admin puede agregar infinitas imágenes y videos
  // Estos límites solo se usan para métodos de consulta específicos de la landing
  static readonly MAX_IMAGENES_LANDING = 4 // Solo para mostrar en landing
  static readonly MAX_VIDEOS_LANDING = 2 // Solo para mostrar en landing

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {
    super(prisma.galeriaImagen as unknown as PrismaModelDelegate<GaleriaImagen>, { entityName: 'Elemento de Galería' })
  }

  /**
   * Sobrescribe findAll para mostrar solo activos ordenados
   */
  override async findAll(): Promise<GaleriaImagen[]> {
    return this.model.findMany({
      where: { activa: true },
      orderBy: { orden: 'asc' },
    })
  }

  /**
   * Obtiene todos los elementos incluyendo inactivos (para admin)
   */
  async findAllAdmin(): Promise<GaleriaImagen[]> {
    return this.model.findMany({
      orderBy: { orden: 'asc' },
    })
  }

  /**
   * Obtiene solo las imágenes activas
   */
  async findImages(): Promise<GaleriaImagen[]> {
    return this.model.findMany({
      where: {
        activa: true,
        tipo: TipoGaleria.IMAGEN,
      },
      orderBy: { orden: 'asc' },
      take: GaleriaService.MAX_IMAGENES,
    })
  }

  /**
   * Obtiene solo los videos activos
   */
  async findVideos(): Promise<GaleriaImagen[]> {
    return this.model.findMany({
      where: {
        activa: true,
        tipo: TipoGaleria.VIDEO,
      },
      orderBy: { orden: 'asc' },
      take: GaleriaService.MAX_VIDEOS,
    })
  }

  /**
   * Cuenta imágenes activas
   */
  async countImages(): Promise<number> {
    return this.count({
      activa: true,
      tipo: TipoGaleria.IMAGEN,
    })
  }

  /**
   * Cuenta videos activos
   */
  async countVideos(): Promise<number> {
    return this.count({
      activa: true,
      tipo: TipoGaleria.VIDEO,
    })
  }

  /**
   * Verifica si se puede agregar más imágenes
   * Siempre retorna true - sin límites en el admin
   */
  async canAddImage(): Promise<boolean> {
    // Sin límites - el admin puede agregar infinitas imágenes
    return true
  }

  /**
   * Verifica si se puede agregar más videos
   * Siempre retorna true - sin límites en el admin
   */
  async canAddVideo(): Promise<boolean> {
    // Sin límites - el admin puede agregar infinitos videos
    return true
  }

  /**
   * Método wrapper para create con auditoría
   * Mantiene compatibilidad con BaseService pero agrega auditoría
   */
  async createWithAudit(dto: CreateGaleriaDto, userId?: string, userEmail?: string, ipAddress?: string): Promise<GaleriaImagen> {
    const item = await super.create(dto)

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'GALERIA',
        entityId: item.id,
        action: 'CREATE',
        userId,
        userEmail: userEmail || 'sistema',
        metadata: {
          tipo: item.tipo,
          imagenUrl: item.imagenUrl,
          videoOriginalUrl: item.videoOriginalUrl || null,
        },
        ipAddress: ipAddress || undefined,
      })
    }

    return item
  }

  /**
   * Método wrapper para update con auditoría
   * Mantiene compatibilidad con BaseService pero agrega auditoría
   */
  async updateWithAudit(id: string, dto: UpdateGaleriaDto, userId?: string, userEmail?: string, ipAddress?: string): Promise<GaleriaImagen> {
    const oldItem = await this.findOne(id)
    const updatedItem = await super.update(id, dto)

    // Registrar auditoría con cambios
    if (userId) {
      const auditData = this.auditService.createAuditDataFromChanges(
        'GALERIA',
        id,
        'UPDATE',
        oldItem,
        dto,
        userId,
        userEmail
      )
      auditData.ipAddress = ipAddress
      await this.auditService.log(auditData)
    }

    return updatedItem
  }

  /**
   * Método wrapper para remove con auditoría
   * Mantiene compatibilidad con BaseService pero agrega auditoría
   */
  async removeWithAudit(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<GaleriaImagen> {
    const item = await this.findOne(id)
    const deletedItem = await super.remove(id)

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'GALERIA',
        entityId: id,
        action: 'DELETE',
        userId,
        userEmail: userEmail || 'sistema',
        metadata: {
          tipo: item.tipo,
          imagenUrl: item.imagenUrl,
          videoOriginalUrl: item.videoOriginalUrl || null,
        },
        ipAddress: ipAddress || undefined,
      })
    }

    return deletedItem
  }

  /**
   * Reordena los elementos de la galería
   */
  async reorder(items: { id: string; orden: number }[]): Promise<void> {
    this.logger.log(`🔄 Reordenando ${items.length} elementos de galería`)

    await Promise.all(
      items.map(item =>
        this.model.update({
          where: { id: item.id },
          data: { orden: item.orden },
        })
      )
    )
  }

  /**
   * Activa/desactiva un elemento
   */
  async toggleActive(id: string): Promise<GaleriaImagen> {
    const item = await this.findOne(id)

    if (!item) {
      throw new Error(`Elemento de galería no encontrado: ${id}`)
    }

    return this.update(id, { activa: !item.activa } as UpdateGaleriaDto)
  }

  /**
   * Obtiene estadísticas de la galería
   */
  async getStats(): Promise<{
    totalImagenes: number
    totalVideos: number
    imagenesActivas: number
    videosActivos: number
    espacioImagenes: number
    espacioVideos: number
  }> {
    const [totalImagenes, totalVideos, imagenesActivas, videosActivos] = await Promise.all([
      this.count({ tipo: TipoGaleria.IMAGEN }),
      this.count({ tipo: TipoGaleria.VIDEO }),
      this.countImages(),
      this.countVideos(),
    ])

    return {
      totalImagenes,
      totalVideos,
      imagenesActivas,
      videosActivos,
      espacioImagenes: GaleriaService.MAX_IMAGENES - imagenesActivas,
      espacioVideos: GaleriaService.MAX_VIDEOS - videosActivos,
    }
  }
}
