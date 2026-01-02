import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../../common/services/audit.service'
import { CreateNoticiaDto, UpdateNoticiaDto } from './dto/noticia.dto'
import { Noticia, CategoriaNoticia } from '@prisma/client'

@Injectable()
export class NoticiasService {
  private readonly logger = new Logger(NoticiasService.name)

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  // Generar slug desde el título
  private generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim()
  }

  // Asegurar slug único
  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug
    let counter = 1

    while (true) {
      const existing = await this.prisma.noticia.findFirst({
        where: {
          slug: uniqueSlug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      })

      if (!existing) break
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    return uniqueSlug
  }

  // Obtener todas las noticias (admin)
  async findAll(): Promise<Noticia[]> {
    return this.prisma.noticia.findMany({
      orderBy: [{ destacado: 'desc' }, { fechaPublicacion: 'desc' }, { createdAt: 'desc' }],
    })
  }

  // Obtener noticias publicadas (público)
  async findPublished(limit?: number): Promise<Noticia[]> {
    return this.prisma.noticia.findMany({
      where: {
        publicado: true,
        OR: [{ fechaPublicacion: null }, { fechaPublicacion: { lte: new Date() } }],
      },
      orderBy: [{ destacado: 'desc' }, { fechaPublicacion: 'desc' }, { createdAt: 'desc' }],
      ...(limit ? { take: limit } : {}),
    })
  }

  // Obtener noticias destacadas
  async findDestacadas(limit: number = 3): Promise<Noticia[]> {
    return this.prisma.noticia.findMany({
      where: {
        publicado: true,
        destacado: true,
        OR: [{ fechaPublicacion: null }, { fechaPublicacion: { lte: new Date() } }],
      },
      orderBy: { fechaPublicacion: 'desc' },
      take: limit,
    })
  }

  // Obtener noticias por categoría
  async findByCategoria(categoria: CategoriaNoticia, limit?: number): Promise<Noticia[]> {
    return this.prisma.noticia.findMany({
      where: {
        publicado: true,
        categoria,
        OR: [{ fechaPublicacion: null }, { fechaPublicacion: { lte: new Date() } }],
      },
      orderBy: { fechaPublicacion: 'desc' },
      ...(limit ? { take: limit } : {}),
    })
  }

  // Obtener una noticia por ID
  async findOne(id: string): Promise<Noticia> {
    const noticia = await this.prisma.noticia.findUnique({
      where: { id },
    })

    if (!noticia) {
      throw new NotFoundException(`Noticia con ID ${id} no encontrada`)
    }

    return noticia
  }

  // Obtener una noticia por slug (público)
  async findBySlug(slug: string): Promise<Noticia> {
    const noticia = await this.prisma.noticia.findUnique({
      where: { slug },
    })

    if (!noticia || !noticia.publicado) {
      throw new NotFoundException(`Noticia no encontrada`)
    }

    return noticia
  }

  // Crear noticia
  async create(createNoticiaDto: CreateNoticiaDto): Promise<Noticia> {
    const slug = createNoticiaDto.slug || this.generateSlug(createNoticiaDto.titulo)
    const uniqueSlug = await this.ensureUniqueSlug(slug)

    // Manejar fechaPublicacion: si se envía, convertir correctamente preservando la hora
    let fechaPublicacion: Date | null = null
    if (createNoticiaDto.fechaPublicacion) {
      const fechaStr = createNoticiaDto.fechaPublicacion
      // Si viene en formato ISO sin zona horaria, interpretarlo como hora local
      if (fechaStr.includes('T') && !fechaStr.includes('Z') && !fechaStr.includes('+')) {
        // Formato: "2025-12-10T23:51" - interpretar como hora local
        const [datePart, timePart] = fechaStr.split('T')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)
        // Crear fecha en hora local
        fechaPublicacion = new Date(year, month - 1, day, hours, minutes)
      } else {
        // Si ya tiene zona horaria, usar directamente
        fechaPublicacion = new Date(createNoticiaDto.fechaPublicacion)
      }
    } else if (createNoticiaDto.publicado) {
      fechaPublicacion = new Date()
    }

    return this.prisma.noticia.create({
      data: {
        ...createNoticiaDto,
        slug: uniqueSlug,
        fechaPublicacion,
      },
    })
  }

  // Actualizar noticia
  async update(id: string, updateNoticiaDto: UpdateNoticiaDto, userId?: string, userEmail?: string, ipAddress?: string): Promise<Noticia> {
    const oldNoticia = await this.findOne(id) // Verificar que existe

    let slug = updateNoticiaDto.slug
    if (updateNoticiaDto.titulo && !updateNoticiaDto.slug) {
      slug = this.generateSlug(updateNoticiaDto.titulo)
    }

    if (slug) {
      slug = await this.ensureUniqueSlug(slug, id)
    }

    // Preparar datos de actualización
    const updateData: any = {
      ...updateNoticiaDto,
      ...(slug ? { slug } : {}),
    }

    // Manejar fechaPublicacion: si se envía, convertir correctamente preservando la hora
    // El frontend envía en formato "yyyy-MM-dd'T'HH:mm" (sin zona horaria)
    // Necesitamos interpretarlo como hora local y convertir a UTC para la BD
    if (updateNoticiaDto.fechaPublicacion) {
      const fechaStr = updateNoticiaDto.fechaPublicacion
      // Si viene en formato ISO sin zona horaria, interpretarlo como hora local
      if (fechaStr.includes('T') && !fechaStr.includes('Z') && !fechaStr.includes('+')) {
        // Formato: "2025-12-10T23:51" - interpretar como hora local
        const [datePart, timePart] = fechaStr.split('T')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)
        // Crear fecha en hora local
        const fechaLocal = new Date(year, month - 1, day, hours, minutes)
        updateData.fechaPublicacion = fechaLocal
      } else {
        // Si ya tiene zona horaria, usar directamente
        updateData.fechaPublicacion = new Date(updateNoticiaDto.fechaPublicacion)
      }
    }

    const updatedNoticia = await this.prisma.noticia.update({
      where: { id },
      data: updateData,
    })

    // Registrar auditoría con cambios
    if (userId) {
      const auditData = this.auditService.createAuditDataFromChanges(
        'NOTICIA',
        id,
        'UPDATE',
        oldNoticia,
        updateData,
        userId,
        userEmail
      )
      auditData.ipAddress = ipAddress
      await this.auditService.log(auditData)
    }

    return updatedNoticia
  }

  // Eliminar noticia
  async remove(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<void> {
    const noticia = await this.findOne(id) // Verificar que existe
    
    await this.prisma.noticia.delete({
      where: { id },
    })

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'NOTICIA',
        entityId: id,
        action: 'DELETE',
        userId,
        userEmail: userEmail || 'sistema',
        metadata: {
          titulo: noticia.titulo,
          slug: noticia.slug,
        },
        ipAddress: ipAddress || undefined,
      })
    }
  }

  // Publicar/despublicar noticia
  async togglePublicado(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<Noticia> {
    const oldNoticia = await this.findOne(id)
    const nuevoEstado = !oldNoticia.publicado

    const noticia = await this.prisma.noticia.update({
      where: { id },
      data: {
        publicado: nuevoEstado,
        fechaPublicacion: nuevoEstado ? new Date() : oldNoticia.fechaPublicacion,
      },
    })

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'NOTICIA',
        entityId: id,
        action: nuevoEstado ? 'PUBLICAR' : 'OCULTAR',
        userId,
        userEmail: userEmail || 'sistema',
        changes: [
          {
            field: 'publicado',
            oldValue: oldNoticia.publicado,
            newValue: nuevoEstado,
          },
        ],
        metadata: {
          titulo: noticia.titulo,
        },
        ipAddress: ipAddress || undefined,
      })
    }

    return noticia
  }

  // Destacar/quitar destacado
  async toggleDestacado(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<Noticia> {
    const oldNoticia = await this.findOne(id)
    const nuevoEstado = !oldNoticia.destacado

    const noticia = await this.prisma.noticia.update({
      where: { id },
      data: { destacado: nuevoEstado },
    })

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'NOTICIA',
        entityId: id,
        action: nuevoEstado ? 'DESTACAR' : 'QUITAR_DESTACADO',
        userId,
        userEmail: userEmail || 'sistema',
        changes: [
          {
            field: 'destacado',
            oldValue: oldNoticia.destacado,
            newValue: nuevoEstado,
          },
        ],
        metadata: {
          titulo: noticia.titulo,
        },
        ipAddress: ipAddress || undefined,
      })
    }

    return noticia
  }

  // Incrementar vistas (optimizado - no bloquea, no espera respuesta)
  async incrementarVista(slug: string): Promise<void> {
    this.logger.debug(`Incrementar vista llamado para slug: "${slug}"`)

    try {
      // Usamos updateMany para evitar errores si la noticia no existe
      const result = await this.prisma.noticia.updateMany({
        where: { slug, publicado: true },
        data: { vistas: { increment: 1 } },
      })

      this.logger.debug(
        `Vista incrementada para "${slug}". Filas afectadas: ${result.count}`
      )

      if (result.count === 0) {
        this.logger.warn(`No se encontró noticia con slug "${slug}" o no está publicada`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error al incrementar vista para "${slug}": ${errorMessage}`)
      throw error // Re-lanzar para que el controller pueda manejarlo
    }
  }
}
