import { Injectable, Logger, Optional, Inject, forwardRef } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { EmailService } from './email.service'
import { NotificationsGateway } from './notifications.gateway'
import * as https from 'https'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    @Optional() @Inject(forwardRef(() => NotificationsGateway)) private notificationsGateway?: NotificationsGateway,
  ) {}

  /**
   * Registra un token de dispositivo para un pastor
   */
  async registerToken(pastorEmail: string, token: string, platform: string, deviceId?: string) {
    try {
      // Buscar el PastorAuth por email
      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { email: pastorEmail },
      })

      if (!pastorAuth) {
        this.logger.warn(`No se encontró PastorAuth para email: ${pastorEmail}`)
        return null
      }

      // Verificar si el token ya existe
      const existingToken = await this.prisma.deviceToken.findUnique({
        where: { token },
      })

      if (existingToken) {
        // Actualizar si existe
        return this.prisma.deviceToken.update({
          where: { token },
          data: {
            active: true,
            platform,
            deviceId: deviceId || null,
            updatedAt: new Date(),
          },
        })
      }

      // Crear nuevo token
      return this.prisma.deviceToken.create({
        data: {
          pastorId: pastorAuth.pastorId,
          token,
          platform,
          deviceId: deviceId || null,
          active: true,
        },
      })
    } catch (error) {
      this.logger.error(`Error registrando token para ${pastorEmail}:`, error)
      throw error
    }
  }

  /**
   * Envía una notificación push a un usuario por email
   * Si no hay tokens push, envía email de respaldo
   * Guarda el historial de notificaciones
   */
  async sendNotificationToUser(email: string, title: string, body: string, data?: any) {
    try {
      // Buscar el PastorAuth por email
      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { email },
        include: { pastor: true },
      })

      if (!pastorAuth || !pastorAuth.pastor) {
        this.logger.warn(`No se encontró PastorAuth para ${email}`)
        return { success: false, message: 'Usuario no encontrado', pushSuccess: false, emailSuccess: false }
      }

      const pastorId = pastorAuth.pastorId

      // Buscar tokens activos del pastor
      const deviceTokens = await this.prisma.deviceToken.findMany({
        where: {
          pastorId,
          active: true,
        },
      })

      let pushSuccess = false
      let emailSuccess = false
      let sentVia = 'none'

      // Intentar enviar push notification
      if (deviceTokens && deviceTokens.length > 0) {
        const tokens = deviceTokens.map((dt) => dt.token)
        const results = await this.sendPushNotifications(tokens, title, body, data)
        pushSuccess = results.successCount > 0
        sentVia = pushSuccess ? 'push' : 'none'
        this.logger.log(`📱 Push a ${email}: ${results.successCount} exitosas, ${results.failureCount} fallidas`)
      } else {
        this.logger.warn(`No se encontraron tokens activos para ${email}`)
      }

      // Si no hay push o falló, enviar email de respaldo
      if (!pushSuccess) {
        emailSuccess = await this.emailService.sendNotificationEmail(email, title, body, data)
        if (emailSuccess) {
          sentVia = pushSuccess ? 'both' : 'email'
          this.logger.log(`📧 Email de respaldo enviado a ${email}`)
        } else {
          this.logger.warn(`No se pudo enviar email de respaldo a ${email}`)
        }
      }

      // Guardar en historial
      let notificationHistory = null
      try {
        notificationHistory = await this.prisma.notificationHistory.create({
          data: {
            pastorId,
            email,
            title,
            body,
            type: data?.type || 'general',
            data: data || {},
            sentVia,
            pushSuccess,
            emailSuccess,
          },
        })
      } catch (historyError) {
        this.logger.error(`Error guardando historial de notificación:`, historyError)
        // No fallar si el historial falla
      }

      // Emitir notificación en tiempo real vía WebSocket (si está disponible)
      try {
        if (notificationHistory && this.notificationsGateway) {
          await this.notificationsGateway.emitToUser(email, {
            id: notificationHistory.id,
            title,
            body,
            type: data?.type || 'general',
            data: data || {},
            createdAt: notificationHistory.createdAt,
            read: false,
          })
          // Actualizar conteo de no leídas
          await this.notificationsGateway.emitUnreadCountUpdate(email)
        }
      } catch (wsError) {
        this.logger.error(`Error emitiendo notificación vía WebSocket:`, wsError)
        // No fallar si WebSocket falla
      }

      const overallSuccess = pushSuccess || emailSuccess
      this.logger.log(`✅ Notificación procesada para ${email}: push=${pushSuccess}, email=${emailSuccess}`)

      return {
        success: overallSuccess,
        pushSuccess,
        emailSuccess,
        sentVia,
      }
    } catch (error) {
      this.logger.error(`Error enviando notificación a ${email}:`, error)
      throw error
    }
  }

  /**
   * Envía notificaciones push usando Expo Push Notification Service
   */
  private async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 }
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
      channelId: 'default', // Para Android
    }))

    try {
      const response = await this.sendToExpo(messages)
      
      let successCount = 0
      let failureCount = 0

      if (response.data) {
        response.data.forEach((result: any) => {
          if (result.status === 'ok') {
            successCount++
          } else {
            failureCount++
            this.logger.warn(`Error enviando notificación: ${result.message}`)
          }
        })
      }

      return { successCount, failureCount }
    } catch (error) {
      this.logger.error('Error enviando notificaciones a Expo:', error)
      return { successCount: 0, failureCount: tokens.length }
    }
  }

  /**
   * Envía mensajes a Expo Push Notification Service
   */
  private async sendToExpo(messages: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(messages)

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
      }

      const req = https.request(this.EXPO_PUSH_URL, options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData)
            resolve(parsed)
          } catch (error) {
            reject(new Error(`Error parseando respuesta: ${error}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(postData)
      req.end()
    })
  }

  /**
   * Obtiene el historial de notificaciones de un usuario
   */
  async getNotificationHistory(email: string, options: { limit: number; offset: number }) {
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email },
    })

    if (!pastorAuth) {
      throw new Error('Usuario no encontrado')
    }

    const notifications = await this.prisma.notificationHistory.findMany({
      where: { pastorId: pastorAuth.pastorId },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    })

    const total = await this.prisma.notificationHistory.count({
      where: { pastorId: pastorAuth.pastorId },
    })

    return {
      notifications,
      total,
      limit: options.limit,
      offset: options.offset,
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async getUnreadCount(email: string): Promise<number> {
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email },
    })

    if (!pastorAuth) {
      return 0
    }

    return this.prisma.notificationHistory.count({
      where: {
        pastorId: pastorAuth.pastorId,
        read: false,
      },
    })
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string, email: string) {
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email },
    })

    if (!pastorAuth) {
      throw new Error('Usuario no encontrado')
    }

    return this.prisma.notificationHistory.update({
      where: {
        id: notificationId,
        pastorId: pastorAuth.pastorId, // Asegurar que pertenece al usuario
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(email: string) {
    const pastorAuth = await this.prisma.pastorAuth.findUnique({
      where: { email },
    })

    if (!pastorAuth) {
      throw new Error('Usuario no encontrado')
    }

    return this.prisma.notificationHistory.updateMany({
      where: {
        pastorId: pastorAuth.pastorId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  }
}
