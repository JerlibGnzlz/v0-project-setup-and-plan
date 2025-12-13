import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { EmailService } from './email.service'
import { getEmailTemplate } from './templates/email.templates'
import axios from 'axios'

interface ExpoPushMessage {
  to: string
  sound?: 'default'
  title: string
  body: string
  data?: any
  badge?: number
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send'

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  /**
   * Envía una notificación push a un usuario por su email
   */
  async sendNotificationToUser(
    email: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    try {
      // Buscar el pastor por email
      const pastor = await this.prisma.pastor.findUnique({
        where: { email },
        include: {
          auth: {
            include: {
              deviceTokens: {
                where: { active: true },
              },
            },
          },
        },
      })

      if (!pastor || !pastor.auth || pastor.auth.deviceTokens.length === 0) {
        this.logger.warn(`No se encontraron tokens de dispositivo para el email: ${email}`)
        return false
      }

      // Obtener todos los tokens activos
      const tokens = pastor.auth.deviceTokens.map((dt) => dt.token)

      if (tokens.length === 0) {
        this.logger.warn(`No hay tokens activos para el email: ${email}`)
        return false
      }

      // Preparar mensajes para Expo
      const messages: ExpoPushMessage[] = tokens.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
        badge: 1,
      }))

      // Enviar notificaciones a través de Expo
      const response = await axios.post(this.expoPushUrl, messages, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
      })

      if (response.data && response.data.data) {
        const results = response.data.data
        const successCount = results.filter((r: any) => r.status === 'ok').length
        const errorCount = results.filter((r: any) => r.status === 'error').length

        this.logger.log(
          `📱 Notificación enviada a ${email}: ${successCount} exitosas, ${errorCount} errores`,
        )

        // Desactivar tokens que fallaron
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'error') {
            const error = results[i].message
            // Si el token es inválido, desactivarlo
            if (error?.includes('Invalid') || error?.includes('DeviceNotRegistered')) {
              await this.prisma.deviceToken.updateMany({
                where: { token: tokens[i] },
                data: { active: false },
              })
              this.logger.warn(`Token desactivado: ${tokens[i]}`)
            }
          }
        }

        return successCount > 0
      }

      return false
    } catch (error: any) {
      this.logger.error(`Error enviando notificación a ${email}:`, error.message)
      return false
    }
  }

  /**
   * Registra un token de dispositivo para un pastor
   */
  async registerDeviceToken(
    pastorId: string,
    token: string,
    platform: 'ios' | 'android',
    deviceId?: string,
  ): Promise<void> {
    try {
      // Verificar si el token ya existe
      const existing = await this.prisma.deviceToken.findUnique({
        where: { token },
      })

      if (existing) {
        // Actualizar si ya existe
        await this.prisma.deviceToken.update({
          where: { token },
          data: {
            pastorId,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token actualizado para pastor ${pastorId}`)
      } else {
        // Crear nuevo token
        await this.prisma.deviceToken.create({
          data: {
            pastorId,
            token,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token registrado para pastor ${pastorId}`)
      }
    } catch (error: any) {
      this.logger.error(`Error registrando token:`, error.message)
      throw error
    }
  }

  /**
   * Desactiva un token de dispositivo
   */
  async deactivateDeviceToken(token: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { token },
      data: { active: false },
    })
    this.logger.log(`Token desactivado: ${token}`)
  }

  /**
   * Envía una notificación a un admin (guarda en NotificationHistory y envía email)
   * Busca el pastor por email para obtener el pastorId requerido
   */
  async sendNotificationToAdmin(
    email: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    try {
      // Buscar pastor por email para obtener pastorId
      // Si no es pastor, buscar si es admin (User) y crear un pastor temporal o usar un pastorId por defecto
      const pastor = await this.prisma.pastor.findUnique({
        where: { email },
      })

      // Si no es pastor, buscar si es admin (User)
      if (!pastor) {
        const user = await this.prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          this.logger.warn(`No se encontró usuario (pastor o admin) con email: ${email}`)
          return
        }

        // Para admins, buscar un pastor por defecto o crear una entrada sin pastorId
        // Por ahora, usaremos el email como referencia y crearemos una entrada especial
        // O mejor: buscar el primer pastor disponible para asociar la notificación
        const firstPastor = await this.prisma.pastor.findFirst({
          where: { activo: true },
        })

        if (!firstPastor) {
          this.logger.warn(`No hay pastores disponibles para asociar notificación de admin: ${email}`)
          return
        }

        // Crear notificación asociada al primer pastor (solo para estructura de BD)
        await this.prisma.notificationHistory.create({
          data: {
            pastorId: firstPastor.id,
            email,
            title,
            body,
            type: data?.type || 'info',
            data: data ? JSON.parse(JSON.stringify(data)) : null,
            read: false,
          },
        })
        this.logger.log(`📧 Notificación guardada para admin: ${email}`)
      } else {
        // Si es pastor, crear notificación normalmente
        await this.prisma.notificationHistory.create({
          data: {
            pastorId: pastor.id,
            email,
            title,
            body,
            type: data?.type || 'info',
            data: data ? JSON.parse(JSON.stringify(data)) : null,
            read: false,
          },
        })
        this.logger.log(`📧 Notificación guardada para admin: ${email}`)
      }

      // Enviar email al admin usando el template apropiado
      try {
        const notificationType = data?.type || 'nueva_inscripcion'
        const template = getEmailTemplate(notificationType, data || {})
        
        const emailSent = await this.emailService.sendNotificationEmail(
          email,
          template.title,
          template.body,
          { ...data, type: notificationType }
        )

        if (emailSent) {
          this.logger.log(`✅ Email enviado exitosamente a admin: ${email}`)
        } else {
          this.logger.warn(`⚠️ No se pudo enviar email a admin: ${email}`)
        }
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Error desconocido'
        this.logger.error(`Error enviando email a admin ${email}:`, errorMessage)
        // No lanzar error, solo loguear - la notificación ya está guardada
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error guardando notificación para admin ${email}:`, errorMessage)
      throw error
    }
  }

  /**
   * Registra un token de dispositivo (alias con email)
   */
  async registerToken(
    email: string,
    token: string,
    platform: string,
    deviceId?: string,
  ): Promise<void> {
    const pastor = await this.prisma.pastor.findUnique({
      where: { email },
      include: { auth: true },
    })

    if (!pastor || !pastor.auth) {
      throw new Error(`Pastor no encontrado para email: ${email}`)
    }

    await this.registerDeviceToken(pastor.id, token, platform as 'ios' | 'android', deviceId)
  }

  /**
   * Obtiene el historial de notificaciones para un admin
   */
  async getNotificationHistory(
    email: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{
    notifications: any[]
    total: number
    limit: number
    offset: number
  }> {
    const limit = options?.limit || 50
    const offset = options?.offset || 0

    // Obtener el total de notificaciones para este email
    const total = await this.prisma.notificationHistory.count({
      where: { email },
    })

    // Obtener las notificaciones paginadas
    const notifications = await this.prisma.notificationHistory.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return {
      notifications,
      total,
      limit,
      offset,
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async getUnreadCount(email: string): Promise<number> {
    // Buscar primero si es admin (por email en NotificationHistory)
    const adminCount = await this.prisma.notificationHistory.count({
      where: {
        email,
        read: false,
      },
    })

    if (adminCount > 0) {
      return adminCount
    }

    // Si no es admin, buscar si es pastor (por pastorId)
    const pastor = await this.prisma.pastor.findUnique({
      where: { email },
    })

    if (pastor) {
      // Los pastores no tienen NotificationHistory, retornar 0
      return 0
    }

    return 0
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string, email: string): Promise<void> {
    await this.prisma.notificationHistory.updateMany({
      where: {
        id,
        email,
      },
      data: {
        read: true,
      },
    })
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(email: string): Promise<void> {
    await this.prisma.notificationHistory.updateMany({
      where: {
        email,
        read: false,
      },
      data: {
        read: true,
      },
    })
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(id: string, email: string): Promise<void> {
    await this.prisma.notificationHistory.deleteMany({
      where: {
        id,
        email,
      },
    })
  }

  /**
   * Elimina múltiples notificaciones
   */
  async deleteNotifications(
    email: string,
    options: { ids?: string[]; deleteRead?: boolean; olderThanDays?: number },
  ): Promise<void> {
    const where: any = { email }

    if (options.ids && options.ids.length > 0) {
      where.id = { in: options.ids }
    } else {
      if (options.deleteRead) {
        where.read = true
      }

      if (options.olderThanDays) {
        const date = new Date()
        date.setDate(date.getDate() - options.olderThanDays)
        where.createdAt = { lt: date }
      }
    }

    await this.prisma.notificationHistory.deleteMany({ where })
  }
}

