import { IsOptional, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

/**
 * DTO para parámetros de paginación
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  /**
   * Calcula el offset basado en la página y el límite
   */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20)
  }

  /**
   * Calcula el take (cuántos registros tomar)
   */
  get take(): number {
    return this.limit || 20
  }
}

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Helper para crear respuesta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
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
}

