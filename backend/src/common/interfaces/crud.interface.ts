/**
 * Interfaces para operaciones CRUD
 * 
 * Estas interfaces definen contratos claros para:
 * - Repositorios: Acceso a datos
 * - Servicios: Lógica de negocio
 * 
 * SOLID - Interface Segregation Principle:
 * Las interfaces están separadas por responsabilidad
 */

/**
 * Operaciones de lectura
 */
export interface IReadRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByIdOrFail(id: string): Promise<T>;
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
}

/**
 * Operaciones de escritura
 */
export interface IWriteRepository<T, CreateDto, UpdateDto> {
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  delete(id: string): Promise<T>;
}

/**
 * Repositorio completo (lectura + escritura)
 */
export interface ICrudRepository<T, CreateDto = any, UpdateDto = any>
  extends IReadRepository<T>,
    IWriteRepository<T, CreateDto, UpdateDto> {}

/**
 * Servicio con operaciones CRUD
 */
export interface ICrudService<T, CreateDto, UpdateDto> {
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T>;
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  remove(id: string): Promise<T>;
}

/**
 * Resultado paginado genérico
 */
export interface IPaginatedResult<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Metadatos de paginación
 */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Opciones de paginación
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Entidad con soft delete
 */
export interface ISoftDeletable {
  activo: boolean;
  deletedAt?: Date;
}

/**
 * Entidad con timestamps
 */
export interface ITimestamped {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad base con ID
 */
export interface IEntity {
  id: string;
}

/**
 * Entidad completa con timestamps
 */
export interface IBaseEntity extends IEntity, ITimestamped {}


