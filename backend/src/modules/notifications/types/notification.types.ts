/**
 * Tipos para el módulo de notificaciones
 * Define tipos seguros para datos de notificaciones, mensajes de Expo y respuestas
 */

import { Prisma } from '@prisma/client'

/**
 * Tipos de notificaciones soportados
 */
export type NotificationType =
    | 'general'
    | 'nueva_inscripcion'
    | 'inscripcion_creada'
    | 'inscripcion_confirmada'
    | 'inscripcion_recibida'
    | 'pago_validado'
    | 'pago_rechazado'
    | 'pago_rehabilitado'
    | 'recordatorio_pago'
    | 'convencion_proxima'
    | 'nuevo_invitado'
    | 'nuevo_pastor_auth'
    | 'test'
    | 'otro'

/**
 * Datos base de una notificación
 * Puede contener información adicional según el tipo
 */
export interface BaseNotificationData {
    type?: NotificationType
    [key: string]: unknown // Permite propiedades adicionales dinámicas
}

/**
 * Datos específicos para notificación de nueva inscripción
 */
export interface NuevaInscripcionData extends BaseNotificationData {
    type: 'nueva_inscripcion'
    inscripcionId: string
    convencionId: string
    convencionTitulo: string
    nombre: string
}

/**
 * Datos específicos para notificación de inscripción creada
 */
export interface InscripcionCreadaData extends BaseNotificationData {
    type: 'inscripcion_creada'
    inscripcionId?: string
    convencionId?: string
    [key: string]: unknown
}

/**
 * Datos específicos para notificación de pago validado
 */
export interface PagoValidadoData extends BaseNotificationData {
    type: 'pago_validado'
    pagoId: string
    inscripcionId?: string
    monto?: number
}

/**
 * Datos específicos para notificación de pago rechazado
 */
export interface PagoRechazadoData extends BaseNotificationData {
    type: 'pago_rechazado'
    pagoId: string
    inscripcionId?: string
    motivo?: string
}

/**
 * Datos específicos para notificación de pago rehabilitado
 */
export interface PagoRehabilitadoData extends BaseNotificationData {
    type: 'pago_rehabilitado'
    pagoId: string
    inscripcionId?: string
}

/**
 * Datos específicos para recordatorio de pago
 */
export interface RecordatorioPagoData extends BaseNotificationData {
    type: 'recordatorio_pago'
    inscripcionId: string
    convencionId?: string
    montoPendiente?: number
}

/**
 * Datos específicos para convención próxima
 */
export interface ConvencionProximaData extends BaseNotificationData {
    type: 'convencion_proxima'
    convencionId: string
    convencionTitulo: string
    fechaInicio?: string
}

/**
 * Unión de todos los tipos de datos de notificación
 */
export type NotificationData =
    | BaseNotificationData
    | NuevaInscripcionData
    | InscripcionCreadaData
    | PagoValidadoData
    | PagoRechazadoData
    | PagoRehabilitadoData
    | RecordatorioPagoData
    | ConvencionProximaData

/**
 * Mensaje para Expo Push Notification Service
 * Basado en la documentación oficial de Expo
 */
export interface ExpoMessage {
    to: string
    sound?: 'default' | null
    title: string
    body: string
    data?: NotificationData | Record<string, unknown>
    priority?: 'default' | 'normal' | 'high'
    channelId?: string
    badge?: number
    ttl?: number
    expiration?: number
    [key: string]: unknown // Permite propiedades adicionales de Expo
}

/**
 * Respuesta individual de Expo para cada mensaje
 */
export interface ExpoResponseItem {
    status: 'ok' | 'error'
    id?: string
    message?: string
    details?: {
        error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded'
        [key: string]: unknown
    }
}

/**
 * Respuesta completa de Expo Push Notification Service
 */
export interface ExpoResponse {
    data: ExpoResponseItem[]
}

