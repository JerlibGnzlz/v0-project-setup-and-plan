import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'

/**
 * DTO base para búsqueda y filtros
 */
export class SearchFilterDto {
  @IsOptional()
  @IsString()
  search?: string

  /**
   * Búsqueda en múltiples campos (nombre, email, etc.)
   */
  @IsOptional()
  @IsString()
  q?: string
}

/**
 * DTO para filtros de Pastores
 */
export class PastorFilterDto extends SearchFilterDto {
  @IsOptional()
  @IsEnum(['todos', 'activos', 'inactivos'])
  status?: 'todos' | 'activos' | 'inactivos' | string // Permitir string para flexibilidad

  @IsOptional()
  @IsEnum(['DIRECTIVA', 'SUPERVISOR', 'PRESIDENTE', 'todos'])
  tipo?: 'DIRECTIVA' | 'SUPERVISOR' | 'PRESIDENTE' | 'todos'

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mostrarEnLanding?: boolean
}

/**
 * DTO para filtros de Inscripciones
 */
export class InscripcionFilterDto extends SearchFilterDto {
  @IsOptional()
  @IsEnum(['todos', 'pendiente', 'confirmado', 'cancelado'])
  estado?: 'todos' | 'pendiente' | 'confirmado' | 'cancelado'

  @IsOptional()
  @IsEnum(['todos', 'web', 'dashboard', 'mobile'])
  origen?: 'todos' | 'web' | 'dashboard' | 'mobile'

  @IsOptional()
  @IsString()
  convencionId?: string
}

/**
 * DTO para filtros de Pagos
 */
export class PagoFilterDto extends SearchFilterDto {
  @IsOptional()
  @IsEnum(['todos', 'PENDIENTE', 'COMPLETADO', 'RECHAZADO', 'CANCELADO'])
  estado?: 'todos' | 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO'

  @IsOptional()
  @IsEnum(['todos', 'transferencia', 'mercadopago', 'efectivo', 'otro'])
  metodoPago?: 'todos' | 'transferencia' | 'mercadopago' | 'efectivo' | 'otro'

  @IsOptional()
  @IsEnum(['todos', 'web', 'dashboard', 'mobile'])
  origen?: 'todos' | 'web' | 'dashboard' | 'mobile'

  @IsOptional()
  @IsString()
  inscripcionId?: string

  @IsOptional()
  @IsString()
  convencionId?: string
}

