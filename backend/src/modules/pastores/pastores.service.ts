import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePastorDto, UpdatePastorDto } from './dto/pastor.dto'
import { BaseService } from '../../common/base.service'
import { Pastor, TipoPastor } from '@prisma/client'
import { AuditService } from '../../common/services/audit.service'
import { PastorFilterDto } from '../../common/dto/search-filter.dto'
import { Prisma } from '@prisma/client'

/**
 * Servicio para gestión de Pastores (Estructura Organizacional)
 *
 * IMPORTANTE: Este servicio gestiona SOLO la estructura organizacional del ministerio.
 * NO gestiona inscripciones a convenciones (ver InscripcionesService).
 *
 * Separación de conceptos:
 * - Pastores: Estructura organizacional (directiva, equipo pastoral)
 * - Inscripciones: Participantes de convenciones (tabla separada)
 *
 * Los pastores se crean SOLO desde:
 * - app/admin/pastores (gestión de estructura organizacional)
 *
 * Las inscripciones se crean desde:
 * - Landing page (origenRegistro: 'web')
 * - Admin dashboard (origenRegistro: 'dashboard')
 * - App móvil (origenRegistro: 'mobile')
 *
 * Extiende BaseService para heredar operaciones CRUD básicas
 * y añade lógica de negocio específica para pastores
 */
@Injectable()
export class PastoresService extends BaseService<Pastor, CreatePastorDto, UpdatePastorDto> {
  private readonly logger = new Logger(PastoresService.name)

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {
    super(prisma.pastor, { entityName: 'Pastor' })
  }

  /**
   * Sobrescribe findAll para ordenar por nombre
   * IMPORTANTE: Solo retorna pastores activos (estructura organizacional)
   * Los invitados (activo=false) NO aparecen aquí
   */
  override async findAll(): Promise<Pastor[]> {
    return this.model.findMany({
      where: { activo: true }, // Solo pastores organizacionales
      orderBy: { nombre: 'asc' },
    })
  }

  /**
   * Obtiene pastores con paginación, búsqueda y filtros
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: PastorFilterDto
  ): Promise<{
    data: Pastor[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }> {
    const skip = (page - 1) * limit
    const take = limit

    this.logger.log(
      `🔍 Buscando pastores - página: ${page}, límite: ${limit}, filtros: ${JSON.stringify(filters)}`
    )

    // Construir condiciones WHERE
    const where: Prisma.PastorWhereInput = {}

    // Aplicar filtro de estado
    // IMPORTANTE: Si es 'todos' o no se especifica, mostrar TODOS (activos e inactivos)
    // Solo filtrar cuando se especifica explícitamente 'activos' o 'inactivos'
    if (filters?.status === 'activos') {
      where.activo = true
    } else if (filters?.status === 'inactivos') {
      where.activo = false
    }
    // Si es 'todos', undefined, o cualquier otro valor, no aplicar filtro de activo (muestra todos)

    // Aplicar filtro de tipo
    if (filters?.tipo && filters.tipo !== 'todos') {
      where.tipo = filters.tipo
    }

    // Aplicar filtro de mostrarEnLanding
    if (filters?.mostrarEnLanding !== undefined) {
      where.mostrarEnLanding = filters.mostrarEnLanding
    }

    // Aplicar búsqueda (busca en nombre, apellido, email, cargo, ministerio, sede)
    if (filters?.search || filters?.q) {
      const searchTerm = (filters.search || filters.q || '').trim()
      if (searchTerm) {
        where.OR = [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { apellido: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { cargo: { contains: searchTerm, mode: 'insensitive' } },
          { ministerio: { contains: searchTerm, mode: 'insensitive' } },
          { sede: { contains: searchTerm, mode: 'insensitive' } },
          { region: { contains: searchTerm, mode: 'insensitive' } },
        ]
      }
    }

    // Construir opciones de consulta
    const hasFilters = Object.keys(where).length > 0
    const findManyOptions: Prisma.PastorFindManyArgs = {
      orderBy: { nombre: 'asc' },
      skip,
      take,
    }

    if (hasFilters) {
      findManyOptions.where = where
    }

    const countOptions: Prisma.PastorCountArgs = hasFilters ? { where } : {}

    this.logger.log(`📋 FindMany options: ${JSON.stringify(findManyOptions, null, 2)}`)
    this.logger.log(`📋 Count options: ${JSON.stringify(countOptions, null, 2)}`)

    try {
      const [data, total] = await Promise.all([
        this.prisma.pastor.findMany(findManyOptions),
        this.prisma.pastor.count(countOptions),
      ])

      this.logger.log(`✅ Encontrados ${data.length} pastores de ${total} totales`)

      const totalPages = Math.ceil(total / limit)

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorCode = this.getErrorCode(error)
      const errorMeta = this.getErrorProperty(error, 'meta')
      const errorStack = error instanceof Error ? error.stack?.substring(0, 500) : undefined

      this.logger.error(`❌ Error al buscar pastores:`, error)
      this.logger.error(
        `FindMany options que causaron el error:`,
        JSON.stringify(findManyOptions, null, 2)
      )
      this.logger.error(
        `Count options que causaron el error:`,
        JSON.stringify(countOptions, null, 2)
      )
      this.logger.error(`Error completo:`, {
        message: errorMessage,
        code: errorCode,
        meta: errorMeta,
        stack: errorStack,
      })
      throw error
    }
  }

  /**
   * Obtiene solo los pastores activos
   */
  async findActive(): Promise<Pastor[]> {
    return this.model.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
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
   * Actualiza un pastor con auditoría
   */
  async updateWithAudit(
    id: string,
    data: UpdatePastorDto,
    userId?: string,
    userEmail?: string
  ): Promise<Pastor> {
    const currentPastor = await this.findOneOrNull(id)

    if (!currentPastor) {
      throw new NotFoundException('Pastor no encontrado')
    }

    const updated = await this.update(id, data)

    // Registrar auditoría
    const auditData = this.auditService.createAuditDataFromChanges(
      'PASTOR',
      id,
      'UPDATE',
      currentPastor,
      data,
      userId,
      userEmail
    )
    await this.auditService.log(auditData)

    return updated
  }

  /**
   * Sobrescribe create para asegurar que solo DIRECTIVA puede tener mostrarEnLanding = true
   * También valida duplicados antes de crear
   */
  override async create(data: CreatePastorDto): Promise<Pastor> {
    // Si el tipo no es DIRECTIVA, forzar mostrarEnLanding = false
    if (data.tipo && data.tipo !== 'DIRECTIVA') {
      data.mostrarEnLanding = false
      this.logger.log(`⚠️ Pastor nuevo no es DIRECTIVA, desactivando mostrarEnLanding`)
    }

    // Verificar si ya existe un pastor con el mismo email (si se proporciona)
    if (data.email) {
      const existingPastor = await this.model.findUnique({
        where: { email: data.email },
      })

      if (existingPastor) {
        throw new ConflictException(`Ya existe un pastor con el correo electrónico ${data.email}`)
      }
    }

    try {
      return await super.create(data)
    } catch (error: unknown) {
      // Si Prisma lanza un error de constraint único, mejorar el mensaje
      const errorCode = this.getErrorCode(error)
      const errorMeta = this.getErrorProperty(error, 'meta') as { target?: string[] } | undefined

      if (errorCode === 'P2002' && errorMeta?.target?.includes('email')) {
        throw new ConflictException(`Ya existe un pastor con el correo electrónico ${data.email}`)
      }
      throw error
    }
  }

  /**
   * Crea un pastor con auditoría
   */
  async createWithAudit(
    data: CreatePastorDto,
    userId?: string,
    userEmail?: string
  ): Promise<Pastor> {
    const created = await this.create(data)

    // Registrar auditoría
    await this.auditService.log({
      entityType: 'PASTOR',
      entityId: created.id,
      action: 'CREATE',
      userId,
      userEmail,
      metadata: {
        nombre: created.nombre,
        apellido: created.apellido,
        tipo: created.tipo,
      },
    })

    return created
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
   * Elimina/desactiva un pastor con auditoría
   */
  async removeWithAudit(id: string, userId?: string, userEmail?: string): Promise<Pastor> {
    const currentPastor = await this.findOne(id)
    this.logger.log(`🗑️ Desactivando pastor: ${id}`)

    const updated = await this.remove(id)

    // Registrar auditoría
    await this.auditService.log({
      entityType: 'PASTOR',
      entityId: id,
      action: 'DESACTIVAR',
      userId,
      userEmail,
      changes: [
        {
          field: 'activo',
          oldValue: currentPastor.activo,
          newValue: false,
        },
      ],
    })

    return updated
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
        activo: true,
      },
      orderBy: { nombre: 'asc' },
    })
  }

  /**
   * Busca pastores por país
   */
  async findByPais(pais: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        pais,
        activo: true,
      },
      orderBy: { nombre: 'asc' },
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
    const [total, activos] = await Promise.all([this.count(), this.count({ activo: true })])

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
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    })
  }

  /**
   * Obtiene pastores por tipo
   */
  async findByTipo(tipo: string): Promise<Pastor[]> {
    return this.model.findMany({
      where: {
        tipo: tipo as TipoPastor,
        activo: true,
      },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
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
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
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
      orderBy: [{ region: 'asc' }, { orden: 'asc' }, { nombre: 'asc' }],
    })
  }

  /**
   * Helper para obtener el código de error de forma segura
   */
  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return typeof error.code === 'string' ? error.code : undefined
    }
    return undefined
  }

  /**
   * Helper para obtener propiedades de error de forma segura
   */
  private getErrorProperty(error: unknown, property: string): unknown {
    if (error && typeof error === 'object' && property in error) {
      return (error as Record<string, unknown>)[property]
    }
    return undefined
  }
}
