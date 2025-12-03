import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import {
  BaseNotificationEvent,
  PagoValidadoEvent,
  PagoRechazadoEvent,
  PagoRehabilitadoEvent,
  PagoRecordatorioEvent,
  InscripcionCreadaEvent,
  InscripcionConfirmadaEvent,
  InscripcionCanceladaEvent,
  InscripcionActualizadaEvent,
  NotificationEventType,
} from '../events/notification.events'

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name)

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  /**
   * Escucha eventos de pago validado
   */
  @OnEvent(NotificationEventType.PAGO_VALIDADO)
  async handlePagoValidado(event: PagoValidadoEvent) {
    this.logger.log(`📬 Evento recibido: PAGO_VALIDADO para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de pago rechazado
   */
  @OnEvent(NotificationEventType.PAGO_RECHAZADO)
  async handlePagoRechazado(event: PagoRechazadoEvent) {
    this.logger.log(`📬 Evento recibido: PAGO_RECHAZADO para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de pago rehabilitado
   */
  @OnEvent(NotificationEventType.PAGO_REHABILITADO)
  async handlePagoRehabilitado(event: PagoRehabilitadoEvent) {
    this.logger.log(`📬 Evento recibido: PAGO_REHABILITADO para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de recordatorio de pago
   */
  @OnEvent(NotificationEventType.PAGO_RECORDATORIO)
  async handlePagoRecordatorio(event: PagoRecordatorioEvent) {
    this.logger.log(`📬 Evento recibido: PAGO_RECORDATORIO para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de inscripción creada
   */
  @OnEvent(NotificationEventType.INSCRIPCION_CREADA)
  async handleInscripcionCreada(event: InscripcionCreadaEvent) {
    this.logger.log(`📬 Evento recibido: INSCRIPCION_CREADA para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de inscripción confirmada
   */
  @OnEvent(NotificationEventType.INSCRIPCION_CONFIRMADA)
  async handleInscripcionConfirmada(event: InscripcionConfirmadaEvent) {
    this.logger.log(`📬 Evento recibido: INSCRIPCION_CONFIRMADA para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de inscripción cancelada
   */
  @OnEvent(NotificationEventType.INSCRIPCION_CANCELADA)
  async handleInscripcionCancelada(event: InscripcionCanceladaEvent) {
    this.logger.log(`📬 Evento recibido: INSCRIPCION_CANCELADA para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Escucha eventos de inscripción actualizada
   */
  @OnEvent(NotificationEventType.INSCRIPCION_ACTUALIZADA)
  async handleInscripcionActualizada(event: InscripcionActualizadaEvent) {
    this.logger.log(`📬 Evento recibido: INSCRIPCION_ACTUALIZADA para ${event.email}`)
    await this.queueNotification(event)
  }

  /**
   * Agrega la notificación a la cola de procesamiento
   */
  private async queueNotification(event: BaseNotificationEvent) {
    try {
      const jobOptions = {
        attempts: 3, // Reintentar hasta 3 veces
        backoff: {
          type: 'exponential' as const,
          delay: 1000, // Empezar con 1 segundo (reducido de 2)
        },
        removeOnComplete: {
          age: 24 * 3600, // Mantener trabajos completados por 24 horas
          count: 1000, // Mantener máximo 1000 trabajos completados
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Mantener trabajos fallidos por 7 días
        },
        priority: this.getPriority(event.priority),
        delay: 0, // Sin delay inicial - procesar inmediatamente
      }

      await this.notificationsQueue.add(
        'send-notification',
        {
          type: this.getEventType(event.type),
          email: event.email,
          userId: event.userId,
          data: event.data,
          priority: event.priority || 'normal',
          channels: event.channels || ['email', 'push', 'web'],
        },
        jobOptions,
      )

      this.logger.log(`✅ Notificación encolada para ${event.email} (tipo: ${event.type})`)
    } catch (error) {
      this.logger.error(`❌ Error encolando notificación para ${event.email}:`, error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Convierte el tipo de evento a string para el template
   */
  private getEventType(eventType: NotificationEventType): string {
    const typeMap: Record<NotificationEventType, string> = {
      [NotificationEventType.PAGO_VALIDADO]: 'pago_validado',
      [NotificationEventType.PAGO_RECHAZADO]: 'pago_rechazado',
      [NotificationEventType.PAGO_REHABILITADO]: 'pago_rehabilitado',
      [NotificationEventType.PAGO_RECORDATORIO]: 'pago_recordatorio',
      [NotificationEventType.INSCRIPCION_CREADA]: 'inscripcion_creada',
      [NotificationEventType.INSCRIPCION_CONFIRMADA]: 'inscripcion_confirmada',
      [NotificationEventType.INSCRIPCION_CANCELADA]: 'inscripcion_cancelada',
      [NotificationEventType.INSCRIPCION_ACTUALIZADA]: 'inscripcion_actualizada',
    }
    return typeMap[eventType] || 'general'
  }

  /**
   * Convierte la prioridad a número para Bull
   */
  private getPriority(priority?: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high':
        return 10
      case 'normal':
        return 5
      case 'low':
        return 1
      default:
        return 5
    }
  }
}



