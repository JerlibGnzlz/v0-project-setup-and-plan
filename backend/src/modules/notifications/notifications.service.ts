import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { EmailService } from './email.service'
import { getEmailTemplate } from './templates/email.templates'
import { NotificationsGateway } from './notifications.gateway'
import axios from 'axios'
import type { Prisma } from '@prisma/client'
import type { NotificationType } from './types/notification.types'

interface ExpoPushMessage {
  to: string
  sound?: 'default'
  title: string
  body: string
  data?: Record<string, unknown>
  badge?: number
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error'
    id?: string
    message?: string
  }>
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send'

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway
  ) { }

  /**
   * Envía un email directamente a un usuario (sin buscar si es pastor o no)
   * Útil para enviar emails a participantes de convenciones (Invitado)
   */
  async sendEmailToUser(
    email: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 [NotificationsService] ========================================`)
      this.logger.log(`📧 [NotificationsService] Enviando email a ${email}`)
      this.logger.log(`📧 [NotificationsService] Título: ${title}`)
      this.logger.log(`📧 [NotificationsService] Body length: ${body.length} caracteres`)
      this.logger.log(`📧 [NotificationsService] Email Provider: ${process.env.EMAIL_PROVIDER || 'smtp'}`)
      this.logger.log(`📧 [NotificationsService] SMTP configurado: ${process.env.SMTP_USER ? 'Sí' : 'No'}`)

      const emailSent = await this.emailService.sendNotificationEmail(
        email,
        title,
        body,
        data || {}
      )

      if (emailSent) {
        this.logger.log(`✅ [NotificationsService] Email enviado exitosamente a ${email}`)
        this.logger.log(`📧 [NotificationsService] ========================================`)
        return true
      } else {
        this.logger.error(`❌ [NotificationsService] No se pudo enviar email a ${email}`)
        this.logger.error(`📧 [NotificationsService] Verifica los logs de EmailService para más detalles`)
        this.logger.error(`📧 [NotificationsService] ========================================`)
        return false
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`❌ [NotificationsService] Error enviando email a ${email}:`, {
        message: errorMessage,
        stack: errorStack,
      })
      this.logger.error(`📧 [NotificationsService] ========================================`)
      return false
    }
  }

  /**
   * Envía un email a un invitado
   */
  async sendEmailToInvitado(
    email: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    return this.sendEmailToUser(email, title, body, data)
  }

  /**
   * Envía un email a un admin (alias de sendEmailToUser)
   */
  async sendEmailToAdmin(
    email: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    return this.sendEmailToUser(email, title, body, data)
  }

  /**
   * Envía una notificación push a un invitado por su ID
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
        badge: 1,
      }

      const response = await axios.post(this.expoPushUrl, [message], {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
      })

      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
        const success = results[0]?.status === 'ok'

        if (success) {
          this.logger.log(`📱 Push notification enviada exitosamente`)
        } else {
          this.logger.warn(`⚠️ Error enviando push notification: ${results[0]?.message}`)
        }

        return success
      }

      return false
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error enviando push notification:`, errorMessage)
      return false
    }
  }

  /**
   * Envía una notificación push a un usuario por su email
   */
  async sendNotificationToUser(
    email: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
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

      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
        const successCount = results.filter((r) => r.status === 'ok').length
        const errorCount = results.filter((r) => r.status === 'error').length

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error enviando notificación a ${email}:`, errorMessage)
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error registrando token:`, errorMessage)
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
   * Si es admin (User), usa el primer pastor disponible como "sistema" para NotificationHistory
   */
  async sendNotificationToAdmin(
    email: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    try {
      this.logger.log(`📧 Enviando notificación a admin: ${email}`)

      // 1. Verificar si es admin (User)
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          nombre: true,
        },
      })

      // 2. Verificar si es pastor
      const pastor = await this.prisma.pastor.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
        },
      })

      // 3. Determinar pastorId para NotificationHistory
      let pastorIdForNotification: string | null = null

      if (pastor) {
        // Si es pastor, usar su propio ID
        pastorIdForNotification = pastor.id
        this.logger.log(`✅ Admin es pastor, usando pastorId: ${pastorIdForNotification}`)
      } else if (user) {
        // Si es admin pero no pastor, buscar un pastor "sistema" para asociar la notificación
        const systemPastor = await this.prisma.pastor.findFirst({
          where: { activo: true },
          select: { id: true },
        })

        if (!systemPastor) {
          this.logger.warn(`⚠️ No hay pastores disponibles para asociar notificación de admin: ${email}`)
          this.logger.log(`📧 Notificación para admin ${email} no se guardará en NotificationHistory (no hay pastores)`)

          // Enviar solo email y WebSocket si es posible
          try {
            await this.sendEmailToAdmin(email, title, body, data)
          } catch (emailError: unknown) {
            const emailErrorMessage = emailError instanceof Error ? emailError.message : 'Error desconocido'
            this.logger.warn(`No se pudo enviar email a admin ${email}: ${emailErrorMessage}`)
          }

          // Intentar emitir WebSocket aunque no se guarde en BD
          if (this.notificationsGateway) {
            try {
              await this.notificationsGateway.emitToUser(email, {
                id: `temp-${Date.now()}`,
                title,
                body,
                type: (data?.type && typeof data.type === 'string' ? data.type : 'info') as string,
                data: data || {},
                read: false,
                createdAt: new Date().toISOString(),
              })
              this.logger.log(`📡 WebSocket emitido para admin ${email} (sin guardar en BD)`)
            } catch (wsError: unknown) {
              const wsErrorMessage = wsError instanceof Error ? wsError.message : 'Error desconocido'
              this.logger.warn(`⚠️ Error emitiendo WebSocket para admin ${email}: ${wsErrorMessage}`)
            }
          }

          return
        }

        pastorIdForNotification = systemPastor.id
        this.logger.log(`✅ Admin no es pastor, usando pastorId sistema: ${pastorIdForNotification}`)
      } else {
        // No es ni admin ni pastor
        this.logger.warn(`⚠️ No se encontró usuario (pastor o admin) con email: ${email}`)
        return
      }

      // 4. Guardar notificación en NotificationHistory
      let notificationId: string
      try {
        const notification = await this.prisma.notificationHistory.create({
          data: {
            pastorId: pastorIdForNotification,
            email,
            title,
            body,
            type: (data?.type && typeof data.type === 'string' ? data.type : 'info') as string,
            data: data ? JSON.parse(JSON.stringify(data)) : null,
            read: false,
          },
        })
        notificationId = notification.id
        this.logger.log(`✅ Notificación guardada en NotificationHistory: ${notificationId} para admin ${email}`)
      } catch (dbError: unknown) {
        const dbErrorMessage = dbError instanceof Error ? dbError.message : 'Error desconocido'
        const dbErrorStack = dbError instanceof Error ? dbError.stack : undefined
        this.logger.error(`❌ Error guardando notificación en BD para admin ${email}: ${dbErrorMessage}`)
        if (dbErrorStack) {
          this.logger.error(`Stack trace: ${dbErrorStack}`)
        }

        // Intentar enviar solo email y WebSocket
        try {
          await this.sendEmailToAdmin(email, title, body, data)
        } catch (emailError: unknown) {
          const emailErrorMessage = emailError instanceof Error ? emailError.message : 'Error desconocido'
          this.logger.warn(`No se pudo enviar email a admin ${email}: ${emailErrorMessage}`)
        }

        // Intentar emitir WebSocket aunque no se guarde en BD
        if (this.notificationsGateway) {
          try {
            await this.notificationsGateway.emitToUser(email, {
              id: `temp-${Date.now()}`,
              title,
              body,
              type: (data?.type && typeof data.type === 'string' ? data.type : 'info') as string,
              data: data || {},
              read: false,
              createdAt: new Date().toISOString(),
            })
            this.logger.log(`📡 WebSocket emitido para admin ${email} (sin guardar en BD)`)
          } catch (wsError: unknown) {
            const wsErrorMessage = wsError instanceof Error ? wsError.message : 'Error desconocido'
            this.logger.warn(`⚠️ Error emitiendo WebSocket para admin ${email}: ${wsErrorMessage}`)
          }
        }

        return
      }

      // 5. Emitir evento WebSocket para actualización en tiempo real (no bloquear si falla)
      if (this.notificationsGateway) {
        try {
          await this.notificationsGateway.emitToUser(email, {
            id: notificationId,
            title,
            body,
            type: (data?.type && typeof data.type === 'string' ? data.type : 'info') as string,
            data: data || {},
            read: false,
            createdAt: new Date().toISOString(),
          })
          await this.notificationsGateway.emitUnreadCountUpdate(email)
          this.logger.log(`📡 WebSocket emitido para admin ${email}`)
        } catch (wsError: unknown) {
          const wsErrorMessage = wsError instanceof Error ? wsError.message : 'Error desconocido'
          const wsErrorStack = wsError instanceof Error ? wsError.stack : undefined
          this.logger.warn(`⚠️ Error emitiendo WebSocket para admin ${email}: ${wsErrorMessage}`)
          if (wsErrorStack) {
            this.logger.warn(`Stack trace: ${wsErrorStack}`)
          }
          // No lanzar error, solo loggear - la notificación ya fue guardada
        }
      } else {
        this.logger.warn(`⚠️ NotificationsGateway no disponible para admin ${email}`)
      }

      // Enviar push notification al admin si tiene tokens registrados
      try {
        const user = await this.prisma.user.findUnique({
          where: { email },
          include: {
            deviceTokens: {
              where: { active: true },
            },
          },
        })

        if (user && user.deviceTokens.length > 0) {
          const tokens = user.deviceTokens.map((dt) => dt.token)
          const messages: ExpoPushMessage[] = tokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body: body.replace(/<[^>]*>/g, ''), // Texto plano para push
            data: data || {},
            badge: 1,
          }))

          const response = await axios.post(this.expoPushUrl, messages, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
            },
          })

          if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
            const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
            const successCount = results.filter((r) => r.status === 'ok').length
            const errorCount = results.filter((r) => r.status === 'error').length

            this.logger.log(
              `📱 Push notification enviada a admin ${email}: ${successCount} exitosas, ${errorCount} errores`,
            )

            // Desactivar tokens que fallaron
            for (let i = 0; i < results.length; i++) {
              if (results[i].status === 'error') {
                const error = results[i].message
                if (error?.includes('Invalid') || error?.includes('DeviceNotRegistered')) {
                  await this.prisma.adminDeviceToken.updateMany({
                    where: { token: tokens[i] },
                    data: { active: false },
                  })
                  this.logger.warn(`Token de admin desactivado: ${tokens[i]}`)
                }
              }
            }
          }
        }
      } catch (pushError: unknown) {
        const errorMessage = pushError instanceof Error ? pushError.message : 'Error desconocido'
        this.logger.warn(`Error enviando push notification a admin ${email}:`, errorMessage)
        // No lanzar error, solo loguear - continuar con email
      }

      // Enviar email al admin usando el template apropiado (como fallback o complemento)
      try {
        const notificationType = (data?.type && typeof data.type === 'string' ? data.type : 'nueva_inscripcion') as NotificationType
        const template = getEmailTemplate(notificationType, data || {})

        const emailSent = await this.emailService.sendNotificationEmail(
          email,
          template.title,
          template.body,
          { ...data, type: notificationType } as Record<string, unknown>
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
   * Busca primero si es admin, luego si es pastor
   */
  async registerToken(
    email: string,
    token: string,
    platform: string,
    deviceId?: string,
  ): Promise<void> {
    // Primero intentar como admin
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      await this.registerAdminDeviceToken(user.id, token, platform as 'ios' | 'android', deviceId)
      return
    }

    // Si no es admin, intentar como pastor
    const pastor = await this.prisma.pastor.findUnique({
      where: { email },
      include: { auth: true },
    })

    if (pastor && pastor.auth) {
      await this.registerDeviceToken(pastor.id, token, platform as 'ios' | 'android', deviceId)
      return
    }

    // Si no es pastor, intentar como invitado
    const invitado = await this.prisma.invitado.findUnique({
      where: { email },
      include: { auth: true },
    })

    if (invitado && invitado.auth) {
      await this.registerInvitadoDeviceToken(invitado.id, token, platform as 'ios' | 'android', deviceId)
      return
    }

    throw new Error(`Usuario no encontrado para email: ${email}`)
  }

  /**
   * Registra un token de dispositivo para un invitado
   */
  async registerInvitadoDeviceToken(
    invitadoId: string,
    token: string,
    platform: 'ios' | 'android',
    deviceId?: string,
  ): Promise<void> {
    try {
      // Verificar si el token ya existe
      const existing = await this.prisma.invitadoDeviceToken.findUnique({
        where: { token },
      })

      if (existing) {
        // Actualizar si ya existe
        await this.prisma.invitadoDeviceToken.update({
          where: { token },
          data: {
            invitadoId,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token de invitado actualizado para invitado ${invitadoId}`)
      } else {
        // Crear nuevo token
        await this.prisma.invitadoDeviceToken.create({
          data: {
            invitadoId,
            token,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token registrado para invitado ${invitadoId}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error registrando token de invitado:`, errorMessage)
      throw error
    }
  }

  /**
   * Registra un token de dispositivo para un admin
   */
  async registerAdminDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
    deviceId?: string,
  ): Promise<void> {
    try {
      // Verificar si el token ya existe
      const existing = await this.prisma.adminDeviceToken.findUnique({
        where: { token },
      })

      if (existing) {
        // Actualizar si ya existe
        await this.prisma.adminDeviceToken.update({
          where: { token },
          data: {
            userId,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token de admin actualizado para usuario ${userId}`)
      } else {
        // Crear nuevo token
        await this.prisma.adminDeviceToken.create({
          data: {
            userId,
            token,
            platform,
            deviceId,
            active: true,
          },
        })
        this.logger.log(`Token de admin registrado para usuario ${userId}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error registrando token de admin:`, errorMessage)
      throw error
    }
  }

  /**
   * Obtiene el historial de notificaciones para un admin
   */
  async getNotificationHistory(
    email: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{
    notifications: Array<{
      id: string
      pastorId: string
      email: string
      title: string
      body: string
      type: string
      data: Prisma.JsonValue
      sentVia: string
      pushSuccess: boolean
      emailSuccess: boolean
      read: boolean
      readAt: Date | null
      createdAt: Date
    }>
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
    const where: Prisma.NotificationHistoryWhereInput = { email }

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

  /**
   * Envía una notificación push a un invitado por su email o invitadoId
   */
  async sendPushNotificationToInvitado(
    emailOrId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      // Buscar invitado por email o ID
      const invitado = await this.prisma.invitado.findFirst({
        where: {
          OR: [{ email: emailOrId }, { id: emailOrId }],
        },
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

      if (!invitado || !invitado.auth || invitado.auth.deviceTokens.length === 0) {
        this.logger.warn(`No se encontraron tokens de dispositivo para el invitado: ${emailOrId}`)
        return false
      }

      // Obtener todos los tokens activos
      const tokens = invitado.auth.deviceTokens.map((dt) => dt.token)

      if (tokens.length === 0) {
        this.logger.warn(`No hay tokens activos para el invitado: ${emailOrId}`)
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

      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
        const successCount = results.filter((r) => r.status === 'ok').length
        const errorCount = results.filter((r) => r.status === 'error').length

        this.logger.log(
          `📱 Notificación enviada a invitado ${emailOrId}: ${successCount} exitosas, ${errorCount} errores`,
        )

        // Desactivar tokens que fallaron
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'error') {
            const error = results[i].message
            // Si el token es inválido, desactivarlo
            if (error?.includes('Invalid') || error?.includes('DeviceNotRegistered')) {
              await this.prisma.invitadoDeviceToken.updateMany({
                where: { token: tokens[i] },
                data: { active: false },
              })
              this.logger.warn(`Token de invitado desactivado: ${tokens[i]}`)
            }
          }
        }

        return successCount > 0
      }

      return false
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error enviando notificación push a invitado ${emailOrId}:`, errorMessage)
      return false
    }
  }

  /**
   * Envía una notificación push de prueba a un usuario específico por documento
   * Útil para debugging y pruebas
   */
  async sendTestPushNotificationByDocumento(
    documento: string,
  ): Promise<{
    encontrado: boolean
    credencial?: {
      id: string
      tipo: 'ministerial' | 'capellania'
      documento: string
      nombre: string
      apellido: string
      fechaVencimiento: Date
      invitadoId: string | null
    }
    invitado?: {
      id: string
      email: string
      nombre: string
      apellido: string
      tieneAuth: boolean
      tokensActivos: number
      tokens: Array<{ token: string; platform: string; active: boolean }>
    }
    enviado: boolean
    error?: string
  }> {
    try {
      this.logger.log(`🔍 Buscando credencial con documento: ${documento}`)

      // Buscar credencial ministerial
      let credencial = await this.prisma.credencialMinisterial.findUnique({
        where: { documento },
        include: {
          invitado: {
            include: {
              auth: {
                include: {
                  deviceTokens: {
                    where: { active: true },
                  },
                },
              },
            },
          },
        },
      })

      let tipoCredencial: 'ministerial' | 'capellania' = 'ministerial'

      // Si no se encuentra, buscar en capellanía
      if (!credencial) {
        const credencialCapellania = await this.prisma.credencialCapellania.findUnique({
          where: { documento },
          include: {
            invitado: {
              include: {
                auth: {
                  include: {
                    deviceTokens: {
                      where: { active: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (credencialCapellania) {
          credencial = credencialCapellania as unknown as typeof credencial
          tipoCredencial = 'capellania'
        }
      }

      if (!credencial) {
        this.logger.warn(`❌ No se encontró credencial con documento: ${documento}`)
        return {
          encontrado: false,
          enviado: false,
          error: 'Credencial no encontrada',
        }
      }

      this.logger.log(`✅ Credencial encontrada: ${credencial.id} (${tipoCredencial})`)

      // Verificar si tiene invitadoId
      if (!credencial.invitadoId) {
        this.logger.warn(`⚠️ Credencial no tiene invitadoId asignado`)

        // Intentar buscar invitado por documento en inscripciones
        const inscripcion = await this.prisma.inscripcion.findFirst({
          where: {
            dni: documento,
            invitadoId: { not: null },
          },
          include: {
            invitado: {
              include: {
                auth: {
                  include: {
                    deviceTokens: {
                      where: { active: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (inscripcion?.invitado) {
          // Asignar invitadoId
          if (tipoCredencial === 'ministerial') {
            await this.prisma.credencialMinisterial.update({
              where: { id: credencial.id },
              data: { invitadoId: inscripcion.invitado.id },
            })
          } else {
            await this.prisma.credencialCapellania.update({
              where: { id: credencial.id },
              data: { invitadoId: inscripcion.invitado.id },
            })
          }
          credencial.invitadoId = inscripcion.invitado.id
          credencial.invitado = inscripcion.invitado
          this.logger.log(`✅ Asignado invitadoId ${inscripcion.invitado.id} a credencial`)
        } else {
          return {
            encontrado: true,
            credencial: {
              id: credencial.id,
              tipo: tipoCredencial,
              documento: credencial.documento,
              nombre: credencial.nombre,
              apellido: credencial.apellido,
              fechaVencimiento: credencial.fechaVencimiento,
              invitadoId: null,
            },
            enviado: false,
            error: 'Credencial no tiene invitadoId y no se encontró invitado por documento',
          }
        }
      }

      // Verificar invitado
      if (!credencial.invitado) {
        return {
          encontrado: true,
          credencial: {
            id: credencial.id,
            tipo: tipoCredencial,
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaVencimiento: credencial.fechaVencimiento,
            invitadoId: credencial.invitadoId || null,
          },
          enviado: false,
          error: 'Invitado no encontrado',
        }
      }

      const invitado = credencial.invitado
      const tokensActivos = invitado.auth?.deviceTokens || []
      const tieneTokens = tokensActivos.length > 0

      this.logger.log(
        `📱 Invitado encontrado: ${invitado.email}, tokens activos: ${tokensActivos.length}`,
      )

      if (!tieneTokens) {
        return {
          encontrado: true,
          credencial: {
            id: credencial.id,
            tipo: tipoCredencial,
            documento: credencial.documento,
            nombre: credencial.nombre,
            apellido: credencial.apellido,
            fechaVencimiento: credencial.fechaVencimiento,
            invitadoId: credencial.invitadoId || null,
          },
          invitado: {
            id: invitado.id,
            email: invitado.email,
            nombre: invitado.nombre,
            apellido: invitado.apellido,
            tieneAuth: !!invitado.auth,
            tokensActivos: 0,
            tokens: [],
          },
          enviado: false,
          error: 'El usuario no tiene tokens de dispositivo activos. Debe abrir la app móvil e iniciar sesión.',
        }
      }

      // Enviar notificación de prueba usando los tokens ya cargados
      const titulo = '🔔 Notificación de Prueba - Credencial Vencida'
      const mensaje = `Hola ${invitado.nombre}, esta es una notificación de prueba. Tu credencial ${tipoCredencial === 'ministerial' ? 'ministerial' : 'de capellanía'} está vencida.`

      // Usar los tokens ya cargados en lugar de hacer otra consulta
      const tokens = tokensActivos.map((dt) => dt.token)
      let exito = false

      if (tokens.length > 0) {
        // Preparar mensajes para Expo
        const messages: ExpoPushMessage[] = tokens.map((token) => ({
          to: token,
          sound: 'default',
          title: titulo,
          body: mensaje,
          data: {
            type: 'credencial_vencida',
            credencialId: credencial.id,
            tipoCredencial,
            test: true,
          },
          badge: 1,
        }))

        try {
          // Enviar notificaciones a través de Expo
          const response = await axios.post(this.expoPushUrl, messages, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate',
            },
          })

          if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
            const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
            const successCount = results.filter((r) => r.status === 'ok').length
            const errorCount = results.filter((r) => r.status === 'error').length

            this.logger.log(
              `📱 Notificación de prueba enviada a invitado ${invitado.email}: ${successCount} exitosas, ${errorCount} errores`,
            )

            // Desactivar tokens que fallaron
            for (let i = 0; i < results.length; i++) {
              if (results[i].status === 'error') {
                const error = results[i].message
                if (error?.includes('Invalid') || error?.includes('DeviceNotRegistered')) {
                  await this.prisma.invitadoDeviceToken.updateMany({
                    where: { token: tokens[i] },
                    data: { active: false },
                  })
                  this.logger.warn(`Token de invitado desactivado: ${tokens[i]}`)
                }
              }
            }

            exito = successCount > 0
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          this.logger.error(`Error enviando notificación push de prueba a invitado ${invitado.email}:`, errorMessage)
          exito = false
        }
      }

      return {
        encontrado: true,
        credencial: {
          id: credencial.id,
          tipo: tipoCredencial,
          documento: credencial.documento,
          nombre: credencial.nombre,
          apellido: credencial.apellido,
          fechaVencimiento: credencial.fechaVencimiento,
          invitadoId: credencial.invitadoId || null,
        },
        invitado: {
          id: invitado.id,
          email: invitado.email,
          nombre: invitado.nombre,
          apellido: invitado.apellido,
          tieneAuth: !!invitado.auth,
          tokensActivos: tokensActivos.length,
          tokens: tokensActivos.map((dt) => ({
            token: dt.token.substring(0, 20) + '...',
            platform: dt.platform,
            active: dt.active,
          })),
        },
        enviado: exito,
        error: exito ? undefined : 'Error al enviar notificación',
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en sendTestPushNotificationByDocumento:`, errorMessage)
      return {
        encontrado: false,
        enviado: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Envía notificaciones push masivas a usuarios con credenciales vencidas o por vencer
   */
  async sendPushNotificationsCredencialesVencidas(
    tipo: 'vencidas' | 'por_vencer' | 'ambas',
  ): Promise<{
    enviadas: number
    errores: number
    detalles: Array<{ email: string; nombre: string; estado: string; exito: boolean; error?: string }>
  }> {
    try {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const en30Dias = new Date()
      en30Dias.setDate(en30Dias.getDate() + 30)
      en30Dias.setHours(23, 59, 59, 999)

      const usuarios: Array<{
        email: string
        nombre: string
        apellido: string
        invitadoId: string
        estado: 'vencida' | 'por_vencer'
        tipoCredencial: 'ministerial' | 'capellania'
        diasRestantes: number
        tokens: string[] // Tokens activos del invitado
      }> = []

      // Buscar credenciales ministeriales
      // Primero buscar todas las credenciales activas para debugging
      const totalCredencialesMinisteriales = await this.prisma.credencialMinisterial.count({
        where: { activa: true },
      })
      const credencialesConInvitado = await this.prisma.credencialMinisterial.count({
        where: { activa: true, invitadoId: { not: null } },
      })

      this.logger.log(
        `🔍 Total credenciales ministeriales activas: ${totalCredencialesMinisteriales}, con invitadoId: ${credencialesConInvitado}`,
      )

      // Buscar credenciales que cumplan los criterios de fecha (con o sin invitadoId)
      const credencialesMinisterialesSinFiltro = await this.prisma.credencialMinisterial.findMany({
        where: {
          activa: true,
          ...(tipo === 'vencidas'
            ? { fechaVencimiento: { lt: hoy } }
            : tipo === 'por_vencer'
              ? { fechaVencimiento: { gte: hoy, lte: en30Dias } }
              : {
                OR: [{ fechaVencimiento: { lt: hoy } }, { fechaVencimiento: { gte: hoy, lte: en30Dias } }],
              }),
        },
        include: {
          invitado: {
            include: {
              auth: {
                include: {
                  deviceTokens: {
                    where: { active: true },
                  },
                },
              },
            },
          },
        },
      })

      // Intentar asignar invitadoId a credenciales que no lo tienen
      let credencialesActualizadas = 0
      for (const credencial of credencialesMinisterialesSinFiltro) {
        if (!credencial.invitadoId && credencial.documento) {
          // Buscar invitado por documento en inscripciones
          const inscripcion = await this.prisma.inscripcion.findFirst({
            where: {
              dni: credencial.documento,
              invitadoId: { not: null },
            },
            include: {
              invitado: {
                include: {
                  auth: {
                    include: {
                      deviceTokens: {
                        where: { active: true },
                      },
                    },
                  },
                },
              },
            },
          })

          if (inscripcion?.invitado) {
            // Asignar invitadoId a la credencial
            await this.prisma.credencialMinisterial.update({
              where: { id: credencial.id },
              data: { invitadoId: inscripcion.invitado.id },
            })
            credencial.invitadoId = inscripcion.invitado.id
            credencial.invitado = inscripcion.invitado
            credencialesActualizadas++
            this.logger.log(
              `✅ Asignado invitadoId ${inscripcion.invitado.id} a credencial ministerial ${credencial.id} (documento: ${credencial.documento})`,
            )
          }
        }
      }

      if (credencialesActualizadas > 0) {
        this.logger.log(`✅ Actualizadas ${credencialesActualizadas} credenciales ministeriales con invitadoId`)
      }

      // Filtrar solo las que tienen invitadoId
      const credencialesMinisteriales = credencialesMinisterialesSinFiltro.filter(
        (c) => c.invitadoId !== null,
      )

      this.logger.log(
        `🔍 Credenciales ministeriales encontradas con filtros (${tipo}): ${credencialesMinisteriales.length}`,
      )

      for (const credencial of credencialesMinisteriales) {
        if (credencial.invitado) {
          const diasRestantes = Math.ceil(
            (credencial.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
          )
          const estado = diasRestantes < 0 ? 'vencida' : 'por_vencer'

          if (tipo === 'ambas' || (tipo === 'vencidas' && estado === 'vencida') || (tipo === 'por_vencer' && estado === 'por_vencer')) {
            const tokens = credencial.invitado.auth?.deviceTokens?.map((dt) => dt.token) || []
            usuarios.push({
              email: credencial.invitado.email,
              nombre: credencial.invitado.nombre,
              apellido: credencial.invitado.apellido,
              invitadoId: credencial.invitado.id,
              estado,
              tipoCredencial: 'ministerial',
              diasRestantes: Math.abs(diasRestantes),
              tokens,
            })
          }
        }
      }

      // Buscar credenciales de capellanía
      const totalCredencialesCapellania = await this.prisma.credencialCapellania.count({
        where: { activa: true },
      })
      const credencialesCapellaniaConInvitado = await this.prisma.credencialCapellania.count({
        where: { activa: true, invitadoId: { not: null } },
      })

      this.logger.log(
        `🔍 Total credenciales capellanía activas: ${totalCredencialesCapellania}, con invitadoId: ${credencialesCapellaniaConInvitado}`,
      )

      // Buscar credenciales que cumplan los criterios de fecha (con o sin invitadoId)
      const credencialesCapellaniaSinFiltro = await this.prisma.credencialCapellania.findMany({
        where: {
          activa: true,
          ...(tipo === 'vencidas'
            ? { fechaVencimiento: { lt: hoy } }
            : tipo === 'por_vencer'
              ? { fechaVencimiento: { gte: hoy, lte: en30Dias } }
              : {
                OR: [{ fechaVencimiento: { lt: hoy } }, { fechaVencimiento: { gte: hoy, lte: en30Dias } }],
              }),
        },
        include: {
          invitado: {
            include: {
              auth: {
                include: {
                  deviceTokens: {
                    where: { active: true },
                  },
                },
              },
            },
          },
        },
      })

      // Intentar asignar invitadoId a credenciales que no lo tienen
      let credencialesCapellaniaActualizadas = 0
      for (const credencial of credencialesCapellaniaSinFiltro) {
        if (!credencial.invitadoId && credencial.documento) {
          // Buscar invitado por documento en inscripciones
          const inscripcion = await this.prisma.inscripcion.findFirst({
            where: {
              dni: credencial.documento,
              invitadoId: { not: null },
            },
            include: {
              invitado: {
                include: {
                  auth: {
                    include: {
                      deviceTokens: {
                        where: { active: true },
                      },
                    },
                  },
                },
              },
            },
          })

          if (inscripcion?.invitado) {
            // Asignar invitadoId a la credencial
            await this.prisma.credencialCapellania.update({
              where: { id: credencial.id },
              data: { invitadoId: inscripcion.invitado.id },
            })
            credencial.invitadoId = inscripcion.invitado.id
            credencial.invitado = inscripcion.invitado
            credencialesCapellaniaActualizadas++
            this.logger.log(
              `✅ Asignado invitadoId ${inscripcion.invitado.id} a credencial capellanía ${credencial.id} (documento: ${credencial.documento})`,
            )
          }
        }
      }

      if (credencialesCapellaniaActualizadas > 0) {
        this.logger.log(`✅ Actualizadas ${credencialesCapellaniaActualizadas} credenciales capellanía con invitadoId`)
      }

      // Filtrar solo las que tienen invitadoId
      const credencialesCapellania = credencialesCapellaniaSinFiltro.filter(
        (c) => c.invitadoId !== null,
      )

      this.logger.log(
        `🔍 Credenciales capellanía encontradas con filtros (${tipo}): ${credencialesCapellania.length}`,
      )

      for (const credencial of credencialesCapellania) {
        if (credencial.invitado) {
          const diasRestantes = Math.ceil(
            (credencial.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
          )
          const estado = diasRestantes < 0 ? 'vencida' : 'por_vencer'

          if (tipo === 'ambas' || (tipo === 'vencidas' && estado === 'vencida') || (tipo === 'por_vencer' && estado === 'por_vencer')) {
            // Evitar duplicados si ya está en la lista
            const existe = usuarios.find(u => u.email === credencial.invitado?.email && u.tipoCredencial === 'capellania')
            if (!existe) {
              const tokens = credencial.invitado.auth?.deviceTokens?.map((dt) => dt.token) || []
              usuarios.push({
                email: credencial.invitado.email,
                nombre: credencial.invitado.nombre,
                apellido: credencial.invitado.apellido,
                invitadoId: credencial.invitado.id,
                estado,
                tipoCredencial: 'capellania',
                diasRestantes: Math.abs(diasRestantes),
                tokens,
              })
            }
          }
        }
      }

      // Eliminar duplicados por email (si un usuario tiene múltiples credenciales)
      const usuariosUnicos = Array.from(
        new Map(usuarios.map(u => [u.email, u])).values()
      )

      this.logger.log(
        `📱 Usuarios encontrados antes de eliminar duplicados: ${usuarios.length}, después: ${usuariosUnicos.length}`,
      )
      this.logger.log(`📱 Enviando notificaciones push a ${usuariosUnicos.length} usuarios con credenciales ${tipo}`)

      if (usuariosUnicos.length === 0) {
        this.logger.warn(
          `⚠️ No se encontraron usuarios con credenciales ${tipo}. Verifica que las credenciales tengan invitadoId y cumplan los criterios de fecha.`,
        )
        return {
          enviadas: 0,
          errores: 0,
          detalles: [],
        }
      }

      const detalles: Array<{ email: string; nombre: string; estado: string; exito: boolean; error?: string }> = []
      let enviadas = 0
      let errores = 0

      // Enviar notificaciones a cada usuario usando los tokens ya cargados
      for (const usuario of usuariosUnicos) {
        try {
          const estadoTexto = usuario.estado === 'vencida' ? 'vencida' : 'por vencer'
          const diasTexto = usuario.estado === 'vencida'
            ? `hace ${usuario.diasRestantes} días`
            : `en ${usuario.diasRestantes} días`

          const titulo = `Credencial ${estadoTexto.charAt(0).toUpperCase() + estadoTexto.slice(1)}`
          const mensaje = `Tu credencial ${usuario.tipoCredencial === 'ministerial' ? 'ministerial' : 'de capellanía'} está ${estadoTexto} (vence ${diasTexto}). Por favor, renueva tu credencial.`

          // Usar los tokens ya cargados en lugar de hacer otra consulta
          const tokens = usuario.tokens || []
          let exito = false

          if (tokens.length === 0) {
            this.logger.warn(`No se encontraron tokens activos para ${usuario.email}`)
            errores++
            detalles.push({
              email: usuario.email,
              nombre: `${usuario.nombre} ${usuario.apellido}`,
              estado: estadoTexto,
              exito: false,
              error: 'No se encontraron tokens de dispositivo activos. El usuario debe abrir la app móvil e iniciar sesión.',
            })
            continue
          }

          // Preparar mensajes para Expo
          const messages: ExpoPushMessage[] = tokens.map((token) => ({
            to: token,
            sound: 'default',
            title: titulo,
            body: mensaje,
            data: {
              type: 'credencial_vencida',
              estado: usuario.estado,
              tipoCredencial: usuario.tipoCredencial,
              diasRestantes: usuario.diasRestantes,
            },
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

          if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
            const results = response.data.data as Array<{ status: 'ok' | 'error'; id?: string; message?: string }>
            const successCount = results.filter((r) => r.status === 'ok').length
            const errorCount = results.filter((r) => r.status === 'error').length

            this.logger.log(
              `📱 Notificación enviada a ${usuario.email}: ${successCount} exitosas, ${errorCount} errores`,
            )

            // Desactivar tokens que fallaron
            for (let i = 0; i < results.length; i++) {
              if (results[i].status === 'error') {
                const error = results[i].message
                if (error?.includes('Invalid') || error?.includes('DeviceNotRegistered')) {
                  await this.prisma.invitadoDeviceToken.updateMany({
                    where: { token: tokens[i] },
                    data: { active: false },
                  })
                  this.logger.warn(`Token de invitado desactivado: ${tokens[i]}`)
                }
              }
            }

            exito = successCount > 0
          }

          if (exito) {
            enviadas++
            detalles.push({
              email: usuario.email,
              nombre: `${usuario.nombre} ${usuario.apellido}`,
              estado: estadoTexto,
              exito: true,
            })
          } else {
            errores++
            detalles.push({
              email: usuario.email,
              nombre: `${usuario.nombre} ${usuario.apellido}`,
              estado: estadoTexto,
              exito: false,
              error: 'Error al enviar notificación push',
            })
          }
        } catch (error: unknown) {
          errores++
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          detalles.push({
            email: usuario.email,
            nombre: `${usuario.nombre} ${usuario.apellido}`,
            estado: usuario.estado,
            exito: false,
            error: errorMessage,
          })
          this.logger.error(`Error enviando notificación a ${usuario.email}:`, errorMessage)
        }
      }

      this.logger.log(`✅ Notificaciones enviadas: ${enviadas} exitosas, ${errores} errores`)

      return {
        enviadas,
        errores,
        detalles,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error enviando notificaciones push masivas:`, errorMessage)
      throw error
    }
  }
}

