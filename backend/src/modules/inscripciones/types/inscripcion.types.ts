/**
 * Tipos para Inscripciones con relaciones
 * Define tipos específicos para inscripciones con sus relaciones de Prisma
 */

import { Inscripcion, Pago, Convencion } from '@prisma/client'

/**
 * Inscripción con convención
 */
export type InscripcionWithConvencion = Inscripcion & {
    convencion: Convencion
}

/**
 * Inscripción con pagos
 */
export type InscripcionWithPagos = Inscripcion & {
    pagos: Pago[]
}

/**
 * Inscripción completa con todas las relaciones
 */
export type InscripcionWithRelations = Inscripcion & {
    convencion: Convencion
    pagos: Pago[]
}

/**
 * Pago con inscripción
 */
export type PagoWithInscripcion = Pago & {
    inscripcion: Inscripcion
}

/**
 * Pago con inscripción y convención
 */
export type PagoWithInscripcionAndConvencion = Pago & {
    inscripcion: InscripcionWithConvencion
}

/**
 * Información de pagos para cálculos
 */
export interface PagosInfo {
    estado: 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO'
    numeroCuota: number
    monto: number
    fechaVencimiento?: Date
}

/**
 * Filtros de búsqueda para inscripciones
 */
export interface InscripcionSearchFilters {
    search?: string
    estado?: string
    convencionId?: string
    origenRegistro?: string
    fechaDesde?: Date
    fechaHasta?: Date
}

/**
 * Filtros de búsqueda para pagos
 */
export interface PagoSearchFilters {
    search?: string
    estado?: string
    metodoPago?: string
    origen?: string
    fechaDesde?: Date
    fechaHasta?: Date
}

