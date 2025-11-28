import { ICrudService, IPaginatedResult } from './crud.interface';
import { Convencion } from '@prisma/client';
import { CreateConvencionDto, UpdateConvencionDto } from '../../modules/convenciones/dto/convencion.dto';

/**
 * Interfaz para el repositorio de Convenciones
 * Define el contrato de acceso a datos específico para convenciones
 */
export interface IConvencionRepository {
  // Métodos heredados del CRUD base
  findAll(): Promise<Convencion[]>;
  findById(id: string): Promise<Convencion | null>;
  findByIdOrFail(id: string): Promise<Convencion>;
  create(data: CreateConvencionDto): Promise<Convencion>;
  update(id: string, data: UpdateConvencionDto): Promise<Convencion>;
  delete(id: string): Promise<Convencion>;
  count(where?: any): Promise<number>;
  exists(where: any): Promise<boolean>;
  
  // Métodos específicos de convenciones
  findActive(): Promise<Convencion | null>;
  findUpcoming(): Promise<Convencion[]>;
  findPast(): Promise<Convencion[]>;
  deactivateAll(exceptId?: string): Promise<{ count: number }>;
  activate(id: string): Promise<Convencion>;
  deactivate(id: string): Promise<Convencion>;
  findByYear(year: number): Promise<Convencion[]>;
  hasActiveConvention(): Promise<boolean>;
}

/**
 * Interfaz para el servicio de Convenciones
 * Define el contrato de lógica de negocio
 */
export interface IConvencionService 
  extends ICrudService<Convencion, CreateConvencionDto, UpdateConvencionDto> {
  
  // Métodos específicos de lógica de negocio
  findActive(): Promise<Convencion | null>;
  activate(id: string): Promise<Convencion>;
  deactivate(id: string): Promise<Convencion>;
  findUpcoming(): Promise<Convencion[]>;
  findPast(): Promise<Convencion[]>;
  hasActiveConvention(): Promise<boolean>;
  getStats(): Promise<IConvencionStats>;
}

/**
 * Estadísticas de convenciones
 */
export interface IConvencionStats {
  total: number;
  activas: number;
  proximas: number;
  pasadas: number;
}

/**
 * Respuesta de convención para API
 */
export interface IConvencionResponse {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  ubicacion: string | null;
  costo: number;
  activa: boolean;
  inscripcionesActivas: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convención con relaciones
 */
export interface IConvencionWithRelations extends Convencion {
  inscripciones?: any[];
  galeria?: any[];
}
