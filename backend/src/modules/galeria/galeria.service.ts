import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateGaleriaDto, UpdateGaleriaDto, TipoGaleria } from './dto/galeria.dto'
import { BaseService } from '../../common/base.service'
import { GaleriaImagen } from '@prisma/client'

/**
 * Servicio para gestión de Galería (imágenes y videos)
 *
 * Extiende BaseService para heredar operaciones CRUD básicas
 * y añade lógica de negocio específica para galería
 */
@Injectable()
export class GaleriaService extends BaseService<GaleriaImagen, CreateGaleriaDto, UpdateGaleriaDto> {
  private readonly logger = new Logger(GaleriaService.name)

  // Límites de elementos para la landing page
  static readonly MAX_IMAGENES = 4
  static readonly MAX_VIDEOS = 2

  constructor(private prisma: PrismaService) {
    super(prisma.galeriaImagen, { entityName: 'Elemento de Galería' })
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
   */
  async canAddImage(): Promise<boolean> {
    const count = await this.countImages()
    return count < GaleriaService.MAX_IMAGENES
  }

  /**
   * Verifica si se puede agregar más videos
   */
  async canAddVideo(): Promise<boolean> {
    const count = await this.countVideos()
    return count < GaleriaService.MAX_VIDEOS
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
