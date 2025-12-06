import { NotFoundException } from '@nestjs/common'

/**
 * Interfaz genérica para repositorios
 * Define el contrato que todos los repositorios deben seguir
 *
 * SOLID - Interface Segregation: Define solo las operaciones necesarias
 */
export interface IRepository<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateData): Promise<T>
  update(id: string, data: UpdateData): Promise<T>
  delete(id: string): Promise<T>
  count(where?: unknown): Promise<number>
}

/**
 * Opciones para consultas de repositorio
 */
export interface FindOptions<T = unknown> {
  where?: T
  orderBy?: T
  include?: T
  skip?: number
  take?: number
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Repositorio base abstracto que implementa operaciones CRUD genéricas
 *
 * Clean Architecture:
 * - Los repositorios son la capa de acceso a datos
 * - Abstraen la implementación de la base de datos
 * - Permiten cambiar Prisma por otra ORM sin afectar la lógica de negocio
 *
 * @template T - Tipo de la entidad
 */
export abstract class BaseRepository<
  T,
  CreateData = Partial<T>,
  UpdateData = Partial<T>
> implements IRepository<T, CreateData, UpdateData> {
  protected readonly entityName: string

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly model: any, // Prisma model delegate - difícil de tipar estrictamente
    entityName: string
  ) {
    this.entityName = entityName
  }

  /**
   * Obtiene todos los registros
   */
  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return this.model.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      include: options?.include,
      skip: options?.skip,
      take: options?.take,
    })
  }

  /**
   * Busca un registro por ID
   */
  async findById(id: string, include?: unknown): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    })
  }

  /**
   * Busca un registro por ID o lanza excepción
   */
  async findByIdOrFail(id: string, include?: unknown): Promise<T> {
    const entity = await this.findById(id, include)

    if (!entity) {
      throw new NotFoundException(`${this.entityName} con ID "${id}" no encontrado`)
    }

    return entity
  }

  /**
   * Busca el primer registro que coincida
   */
  async findFirst(options?: FindOptions<T>): Promise<T | null> {
    return this.model.findFirst({
      where: options?.where,
      orderBy: options?.orderBy,
      include: options?.include,
    })
  }

  /**
   * Crea un nuevo registro
   */
  async create(data: CreateData, include?: unknown): Promise<T> {
    return this.model.create({
      data,
      include,
    })
  }

  /**
   * Actualiza un registro
   */
  async update(id: string, data: UpdateData, include?: unknown): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include,
    })
  }

  /**
   * Actualiza múltiples registros
   */
  async updateMany(where: unknown, data: UpdateData): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    })
  }

  /**
   * Elimina un registro
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    })
  }

  /**
   * Elimina múltiples registros
   */
  async deleteMany(where: unknown): Promise<{ count: number }> {
    return this.model.deleteMany({
      where,
    })
  }

  /**
   * Cuenta registros
   */
  async count(where?: unknown): Promise<number> {
    return this.model.count({ where })
  }

  /**
   * Verifica si existe un registro
   */
  async exists(where: unknown): Promise<boolean> {
    const count = await this.count(where)
    return count > 0
  }

  /**
   * Busca con paginación
   */
  async findPaginated(
    page: number = 1,
    limit: number = 10,
    options?: Omit<FindOptions<T>, 'skip' | 'take'>
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
        include: options?.include,
        skip,
        take: limit,
      }),
      this.count(options?.where),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Ejecuta una transacción
   */
  async transaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R> {
    // El prisma client debería tener $transaction
    // Este método se puede sobrescribir en implementaciones concretas
    return fn(this.model)
  }
}
