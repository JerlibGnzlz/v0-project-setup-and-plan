import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateNoticiaDto, UpdateNoticiaDto } from './dto/noticia.dto'
import { Noticia, CategoriaNoticia } from '@prisma/client'

@Injectable()
export class NoticiasService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.noticia.create({
      data: {
        ...createNoticiaDto,
        slug: uniqueSlug,
        fechaPublicacion: createNoticiaDto.fechaPublicacion
          ? new Date(createNoticiaDto.fechaPublicacion)
          : createNoticiaDto.publicado
            ? new Date()
            : null,
      },
    })
  }

  // Actualizar noticia
  async update(id: string, updateNoticiaDto: UpdateNoticiaDto): Promise<Noticia> {
    await this.findOne(id) // Verificar que existe

    let slug = updateNoticiaDto.slug
    if (updateNoticiaDto.titulo && !updateNoticiaDto.slug) {
      slug = this.generateSlug(updateNoticiaDto.titulo)
    }

    if (slug) {
      slug = await this.ensureUniqueSlug(slug, id)
    }

    return this.prisma.noticia.update({
      where: { id },
      data: {
        ...updateNoticiaDto,
        ...(slug ? { slug } : {}),
        ...(updateNoticiaDto.fechaPublicacion
          ? { fechaPublicacion: new Date(updateNoticiaDto.fechaPublicacion) }
          : {}),
      },
    })
  }

  // Eliminar noticia
  async remove(id: string): Promise<void> {
    await this.findOne(id) // Verificar que existe
    await this.prisma.noticia.delete({
      where: { id },
    })
  }

  // Publicar/despublicar noticia
  async togglePublicado(id: string): Promise<Noticia> {
    const noticia = await this.findOne(id)

    return this.prisma.noticia.update({
      where: { id },
      data: {
        publicado: !noticia.publicado,
        fechaPublicacion: !noticia.publicado ? new Date() : noticia.fechaPublicacion,
      },
    })
  }

  // Destacar/quitar destacado
  async toggleDestacado(id: string): Promise<Noticia> {
    const noticia = await this.findOne(id)

    return this.prisma.noticia.update({
      where: { id },
      data: { destacado: !noticia.destacado },
    })
  }

  // Incrementar vistas (optimizado - no bloquea, no espera respuesta)
  async incrementarVista(slug: string): Promise<void> {
    console.log(`📊 [Backend] incrementarVista llamado para slug: "${slug}"`)

    try {
      // Usamos updateMany para evitar errores si la noticia no existe
      const result = await this.prisma.noticia.updateMany({
        where: { slug, publicado: true },
        data: { vistas: { increment: 1 } },
      })

      console.log(
        `✅ [Backend] Vista incrementada para "${slug}". Filas afectadas: ${result.count}`
      )

      if (result.count === 0) {
        console.warn(`⚠️ [Backend] No se encontró noticia con slug "${slug}" o no está publicada`)
      }
    } catch (error) {
      console.error(`❌ [Backend] Error al incrementar vista para "${slug}":`, error)
      throw error // Re-lanzar para que el controller pueda manejarlo
    }
  }
}
