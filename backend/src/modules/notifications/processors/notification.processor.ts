import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { Logger } from '@nestjs/common'
import { NotificationsService } from '../notifications.service'
import { EmailService } from '../email.service'
import { getEmailTemplate } from '../templates/email.templates'
import { NotificationData, NotificationType } from '../types/notification.types'

export interface NotificationJobData {
  type: string
  email: string
  userId?: string
  data: NotificationData
  priority?: 'low' | 'normal' | 'high'
  channels?: ('email' | 'push' | 'web')[]
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}

  @Process({ name: 'send-notification', concurrency: 10 })
  async handleNotification(job: Job<NotificationJobData>) {
    const { type, email, data, channels = ['email', 'push', 'web'] } = job.data
    const notificationType: NotificationType = type as NotificationType

    this.logger.log(`📬 Procesando notificación ${notificationType} para ${email} (Job ID: ${job.id})`)

    try {
      // Obtener template de email
      const template = getEmailTemplate(notificationType, data)

      // Enviar notificación según los canales especificados
      const results: { email?: boolean; push?: boolean; web?: boolean } = {}

      // Email - Prioridad: procesar primero
      if (channels.includes('email')) {
        try {
          const emailSent = await this.emailService.sendNotificationEmail(
            email,
            template.title,
            template.body,
            { ...data, type: notificationType }
          )
          results.email = emailSent
          this.logger.log(`📧 Email ${emailSent ? 'enviado' : 'falló'} para ${email}`)
        } catch (error) {
          this.logger.error(`Error enviando email a ${email}:`, error)
          results.email = false
        }
      }

      // Push notification
      if (channels.includes('push')) {
        try {
          const pushResult = await this.notificationsService.sendNotificationToUser(
            email,
            template.title,
            template.body.replace(/<[^>]*>/g, ''), // Texto plano para push
            { ...data, type: notificationType }
          )
          results.push = pushResult
          this.logger.log(`📱 Push ${pushResult ? 'enviado' : 'falló'} para ${email}`)
        } catch (error) {
          this.logger.error(`Error enviando push a ${email}:`, error)
          results.push = false
        }
      }

      // Web notification (WebSocket)
      if (channels.includes('web')) {
        try {
          await this.notificationsService.sendNotificationToAdmin(
            email,
            template.title,
            template.body.replace(/<[^>]*>/g, ''), // Texto plano para web
            { ...data, type: notificationType }
          )
          results.web = true
          this.logger.log(`🌐 Notificación web enviada para ${email}`)
        } catch (error) {
          this.logger.error(`Error enviando notificación web a ${email}:`, error)
          results.web = false
        }
      }

      const success = Object.values(results).some(r => r === true)

      if (success) {
        this.logger.log(`✅ Notificación ${type} procesada exitosamente para ${email}`)
        return { success: true, results }
      } else {
        this.logger.warn(`⚠️ Todas las notificaciones fallaron para ${email}`)
        throw new Error('Todas las notificaciones fallaron')
      }
    } catch (error) {
      this.logger.error(`❌ Error procesando notificación ${type} para ${email}:`, error)
      throw error
    }
  }
}
