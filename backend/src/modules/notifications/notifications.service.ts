import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
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

  constructor(private prisma: PrismaService) {}

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
          pastorAuth: {
            include: {
              deviceTokens: {
                where: { active: true },
              },
            },
          },
        },
      })

      if (!pastor || !pastor.pastorAuth || pastor.pastorAuth.deviceTokens.length === 0) {
        this.logger.warn(`No se encontraron tokens de dispositivo para el email: ${email}`)
        return false
      }

      // Obtener todos los tokens activos
      const tokens = pastor.pastorAuth.deviceTokens.map((dt) => dt.token)

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
}

