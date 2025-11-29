import { NotFoundException } from '@nestjs/common';

/**
 * Interfaz genérica para operaciones CRUD básicas
 * Permite que cualquier servicio implemente estas operaciones de forma consistente
 */
export interface IBaseService<T, CreateDto, UpdateDto> {
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  remove(id: string): Promise<T>;
}

/**
 * Opciones de configuración para el BaseService
 */
export interface BaseServiceOptions {
  entityName: string;  // Nombre de la entidad para mensajes de error
}

/**
 * Clase base abstracta que implementa operaciones CRUD genéricas
 * 
 * SOLID Principles:
 * - S (Single Responsibility): Solo maneja operaciones CRUD básicas
 * - O (Open/Closed): Abierto para extensión (métodos pueden ser sobrescritos)
 * - L (Liskov): Las clases hijas pueden sustituir a la base
 * - I (Interface Segregation): Implementa IBaseService
 * - D (Dependency Inversion): Depende de la abstracción del modelo
 * 
 * @template T - Tipo de la entidad
 * @template CreateDto - DTO para creación
 * @template UpdateDto - DTO para actualización
 */
export abstract class BaseService<T, CreateDto, UpdateDto> 
  implements IBaseService<T, CreateDto, UpdateDto> {
  
  protected readonly entityName: string;

  constructor(
    protected readonly model: any,  // Prisma model delegate
    options: BaseServiceOptions
  ) {
    this.entityName = options.entityName;
  }

  /**
   * Obtiene todos los registros
   * Puede ser sobrescrito para añadir filtros, ordenamiento, etc.
   */
  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  /**
   * Obtiene un registro por ID
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<T | null> {
    const entity = await this.model.findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} con ID "${id}" no encontrado`);
    }

    return entity;
  }

  /**
   * Obtiene un registro por ID sin lanzar excepción
   * Útil para verificaciones opcionales
   */
  async findOneOrNull(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  /**
   * Crea un nuevo registro
   */
  async create(dto: CreateDto): Promise<T> {
    return this.model.create({
      data: dto as any,
    });
  }

  /**
   * Actualiza un registro existente
   * @throws NotFoundException si no existe
   */
  async update(id: string, dto: UpdateDto): Promise<T> {
    // Verificar que existe antes de actualizar
    await this.findOne(id);

    return this.model.update({
      where: { id },
      data: dto as any,
    });
  }

  /**
   * Elimina un registro
   * @throws NotFoundException si no existe
   */
  async remove(id: string): Promise<T> {
    // Verificar que existe antes de eliminar
    await this.findOne(id);

    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Cuenta el total de registros
   */
  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Verifica si existe un registro con cierta condición
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Busca registros con paginación
   */
  async findWithPagination(options: {
    page?: number;
    limit?: number;
    orderBy?: any;
    where?: any;
  }): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: options.where,
        orderBy: options.orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where: options.where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

