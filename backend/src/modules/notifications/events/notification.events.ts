/**
 * Eventos de notificaciones
 * Estos eventos se emiten cuando ocurren acciones que requieren notificaciones
 */

import { NotificationData } from '../types/notification.types'

export enum NotificationEventType {
  // Eventos de pagos
  PAGO_VALIDADO = 'pago.validado',
  PAGO_RECHAZADO = 'pago.rechazado',
  PAGO_REHABILITADO = 'pago.rehabilitado',
  PAGO_RECORDATORIO = 'pago.recordatorio',

  // Eventos de inscripciones
  INSCRIPCION_CREADA = 'inscripcion.creada',
  INSCRIPCION_CONFIRMADA = 'inscripcion.confirmada',
  INSCRIPCION_CANCELADA = 'inscripcion.cancelada',
  INSCRIPCION_ACTUALIZADA = 'inscripcion.actualizada',

  // Eventos de credenciales pastorales
  CREDENCIAL_POR_VENCER = 'credencial.por_vencer',
}

/**
 * Evento base para todas las notificaciones
 */
export interface BaseNotificationEvent {
  type: NotificationEventType
  userId?: string
  email: string
  data?: NotificationData
  priority?: 'low' | 'normal' | 'high'
  channels?: ('email' | 'push' | 'web')[]
}

/**
 * Evento de pago validado
 */
export class PagoValidadoEvent implements BaseNotificationEvent {
  type = NotificationEventType.PAGO_VALIDADO
  email: string
  userId?: string
  data: {
    pagoId: string
    inscripcionId: string
    monto: number
    numeroCuota: number
    cuotasTotales: number
    cuotasPagadas: number
    convencionTitulo: string
    metodoPago?: string
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'high' = 'high'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: PagoValidadoEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      pagoId: data.pagoId,
      inscripcionId: data.inscripcionId,
      monto: data.monto,
      numeroCuota: data.numeroCuota,
      cuotasTotales: data.cuotasTotales,
      cuotasPagadas: data.cuotasPagadas,
      convencionTitulo: data.convencionTitulo,
      metodoPago: data.metodoPago,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de pago rechazado
 */
export class PagoRechazadoEvent implements BaseNotificationEvent {
  type = NotificationEventType.PAGO_RECHAZADO
  email: string
  userId?: string
  data: {
    pagoId: string
    inscripcionId: string
    motivo?: string
    convencionTitulo: string
    monto?: number
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'high' = 'high'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: PagoRechazadoEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      pagoId: data.pagoId,
      inscripcionId: data.inscripcionId,
      motivo: data.motivo,
      convencionTitulo: data.convencionTitulo,
      monto: data.monto,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de pago rehabilitado
 */
export class PagoRehabilitadoEvent implements BaseNotificationEvent {
  type = NotificationEventType.PAGO_REHABILITADO
  email: string
  userId?: string
  data: {
    pagoId: string
    inscripcionId: string
    convencionTitulo: string
    monto?: number
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'normal' = 'normal'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: PagoRehabilitadoEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      pagoId: data.pagoId,
      inscripcionId: data.inscripcionId,
      convencionTitulo: data.convencionTitulo,
      monto: data.monto,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de recordatorio de pago
 */
export class PagoRecordatorioEvent implements BaseNotificationEvent {
  type = NotificationEventType.PAGO_RECORDATORIO
  email: string
  userId?: string
  data: {
    inscripcionId: string
    cuotasPendientes: number
    montoPendiente: number
    convencionTitulo: string
    fechaLimite?: Date
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'normal' = 'normal'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: PagoRecordatorioEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      inscripcionId: data.inscripcionId,
      cuotasPendientes: data.cuotasPendientes,
      montoPendiente: data.montoPendiente,
      convencionTitulo: data.convencionTitulo,
      fechaLimite: data.fechaLimite,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de inscripción creada
 */
export class InscripcionCreadaEvent implements BaseNotificationEvent {
  type = NotificationEventType.INSCRIPCION_CREADA
  email: string
  userId?: string
  data: {
    inscripcionId: string
    convencionTitulo: string
    numeroCuotas: number
    montoTotal: number
    origenRegistro: string
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'normal' = 'normal'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: InscripcionCreadaEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      inscripcionId: data.inscripcionId,
      convencionTitulo: data.convencionTitulo,
      numeroCuotas: data.numeroCuotas,
      montoTotal: data.montoTotal,
      origenRegistro: data.origenRegistro,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de inscripción confirmada
 */
export class InscripcionConfirmadaEvent implements BaseNotificationEvent {
  type = NotificationEventType.INSCRIPCION_CONFIRMADA
  email: string
  userId?: string
  data: {
    inscripcionId: string
    convencionTitulo: string
    fechaInicio: Date
    ubicacion: string
    nombre?: string
    apellido?: string
    inscripcionNombre?: string
  }
  priority: 'high' = 'high'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: InscripcionConfirmadaEvent['data'] & { email: string; userId?: string; nombre?: string; apellido?: string }) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto = data.nombre && data.apellido 
      ? `${data.nombre} ${data.apellido}` 
      : data.inscripcionNombre || ''
    this.data = {
      inscripcionId: data.inscripcionId,
      convencionTitulo: data.convencionTitulo,
      fechaInicio: data.fechaInicio,
      ubicacion: data.ubicacion,
      nombre: data.nombre,
      apellido: data.apellido,
      inscripcionNombre: nombreCompleto,
    }
  }
}

/**
 * Evento de inscripción cancelada
 */
export class InscripcionCanceladaEvent implements BaseNotificationEvent {
  type = NotificationEventType.INSCRIPCION_CANCELADA
  email: string
  userId?: string
  data: {
    inscripcionId: string
    convencionTitulo: string
    motivo?: string
  }
  priority: 'high' = 'high'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: InscripcionCanceladaEvent['data'] & { email: string; userId?: string }) {
    this.email = data.email
    this.userId = data.userId
    this.data = {
      inscripcionId: data.inscripcionId,
      convencionTitulo: data.convencionTitulo,
      motivo: data.motivo,
    }
  }
}

/**
 * Evento de inscripción actualizada
 */
export class InscripcionActualizadaEvent implements BaseNotificationEvent {
  type = NotificationEventType.INSCRIPCION_ACTUALIZADA
  email: string
  userId?: string
  data: {
    inscripcionId: string
    convencionTitulo: string
    cambios: Record<string, any>
  }
  priority: 'normal' = 'normal'
  channels?: ('email' | 'push' | 'web')[]

  constructor(data: InscripcionActualizadaEvent['data'] & { email: string; userId?: string }) {
    this.email = data.email
    this.userId = data.userId
    this.data = {
      inscripcionId: data.inscripcionId,
      convencionTitulo: data.convencionTitulo,
      cambios: data.cambios,
    }
  }
}

/**
 * Evento de credencial por vencer
 */
export class CredencialPorVencerEvent implements BaseNotificationEvent {
  type = NotificationEventType.CREDENCIAL_POR_VENCER
  email: string
  userId?: string
  data: {
    credencialId: string
    numeroCredencial: string
    fechaVencimiento: string
    diasRestantes: number
    nombre?: string
    apellido?: string
    credencialNombre?: string
  }
  priority: 'high' = 'high'
  channels?: ('email' | 'push' | 'web')[]

  constructor(
    data: CredencialPorVencerEvent['data'] & {
      email: string
      userId?: string
      nombre?: string
      apellido?: string
    }
  ) {
    this.email = data.email
    this.userId = data.userId
    const nombreCompleto =
      data.nombre && data.apellido
        ? `${data.nombre} ${data.apellido}`
        : data.credencialNombre || ''
    this.data = {
      credencialId: data.credencialId,
      numeroCredencial: data.numeroCredencial,
      fechaVencimiento: data.fechaVencimiento,
      diasRestantes: data.diasRestantes,
      nombre: data.nombre,
      apellido: data.apellido,
      credencialNombre: nombreCompleto,
    }
  }
}
