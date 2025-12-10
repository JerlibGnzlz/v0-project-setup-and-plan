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
import { NotificationType } from '../types/notification.types'

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name)

  constructor(@InjectQueue('notifications') private notificationsQueue: Queue) {}

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
    this.logger.log(
      `📬 Evento recibido: PAGO_RECORDATORIO para ${event.email} (inscripcionId: ${event.data.inscripcionId})`
    )
    try {
      await this.queueNotification(event)
      this.logger.log(`✅ Recordatorio encolado exitosamente para ${event.email}`)
    } catch (error) {
      this.logger.error(`❌ Error procesando recordatorio para ${event.email}:`, error)
      // No lanzar el error para que no detenga el procesamiento de otros eventos
    }
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
   * Si la cola no está disponible, procesa directamente
   */
  private async queueNotification(event: BaseNotificationEvent) {
    try {
      // Verificar que la cola esté disponible
      if (!this.notificationsQueue) {
        this.logger.debug('⚠️ Cola de notificaciones no disponible (Redis no configurado), procesando directamente')
        // Fallback: procesar directamente sin cola
        await this.processDirectly(event)
        return
      }

      // Verificar que Redis esté realmente disponible intentando obtener el estado de la cola
      try {
        await this.notificationsQueue.getJobCounts()
      } catch (redisError) {
        this.logger.warn('⚠️ Redis no disponible, procesando notificación directamente')
        await this.processDirectly(event)
        return
      }

      const jobOptions = {
        attempts: 3, // Reintentar hasta 3 veces
        backoff: {
          type: 'exponential' as const,
          delay: 1000, // Empezar con 1 segundo
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
          channels: event.channels || ['email'], // Solo email para recordatorios masivos
        },
        jobOptions
      )

      this.logger.log(`✅ Notificación encolada para ${event.email} (tipo: ${event.type})`)
    } catch (error) {
      this.logger.error(
        `❌ Error encolando notificación para ${event.email}, procesando directamente:`,
        error
      )
      // Fallback: procesar directamente si la cola falla
      try {
        await this.processDirectly(event)
      } catch (fallbackError) {
        this.logger.error(`❌ Error en fallback directo para ${event.email}:`, fallbackError)
        // No lanzar error para no interrumpir el flujo principal
      }
    }
  }

  /**
   * Procesa la notificación directamente sin cola (fallback)
   */
  private async processDirectly(event: BaseNotificationEvent): Promise<boolean> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const emailServiceModule = await import('../email.service')
      const templatesModule = await import('../templates/email.templates')

      const EmailService = emailServiceModule.EmailService
      const getEmailTemplate = templatesModule.getEmailTemplate

      const emailService = new EmailService()
      const template = getEmailTemplate(this.getEventType(event.type), event.data || {})

      const emailSent = await emailService.sendNotificationEmail(
        event.email,
        template.title,
        template.body,
        { ...(event.data || {}), type: this.getEventType(event.type) }
      )

      if (emailSent) {
        this.logger.log(`✅ Email enviado directamente a ${event.email} (sin cola)`)
        return true
      } else {
        this.logger.warn(`⚠️ No se pudo enviar email directamente a ${event.email}`)
        return false
      }
    } catch (error) {
      this.logger.error(`❌ Error en processDirectly para ${event.email}:`, error)
      return false
    }
  }

  /**
   * Convierte el tipo de evento a NotificationType para el template
   */
  private getEventType(eventType: NotificationEventType): NotificationType {
    const typeMap: Record<NotificationEventType, NotificationType> = {
      [NotificationEventType.PAGO_VALIDADO]: 'pago_validado',
      [NotificationEventType.PAGO_RECHAZADO]: 'pago_rechazado',
      [NotificationEventType.PAGO_REHABILITADO]: 'pago_rehabilitado',
      [NotificationEventType.PAGO_RECORDATORIO]: 'pago_recordatorio',
      [NotificationEventType.INSCRIPCION_CREADA]: 'inscripcion_creada',
      [NotificationEventType.INSCRIPCION_CONFIRMADA]: 'inscripcion_confirmada',
      [NotificationEventType.INSCRIPCION_CANCELADA]: 'otro', // No hay tipo específico para cancelada
      [NotificationEventType.INSCRIPCION_ACTUALIZADA]: 'otro', // No hay tipo específico para actualizada
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
