import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * Servicio para limpieza automática de notificaciones antiguas
 *
 * Ejecuta tareas programadas para mantener la base de datos limpia:
 * - Elimina notificaciones leídas más antiguas de 30 días (diariamente a las 2 AM)
 * - Mantiene las no leídas indefinidamente hasta que el usuario las marque como leídas
 */
@Injectable()
export class NotificationsCleanupService {
  private readonly logger = new Logger(NotificationsCleanupService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Limpia notificaciones leídas antiguas
   * Se ejecuta diariamente a las 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanupOldNotifications() {
    this.logger.log('🧹 Iniciando limpieza automática de notificaciones antiguas...')

    try {
      // Eliminar notificaciones leídas más antiguas de 30 días
      const daysToKeep = 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.prisma.notificationHistory.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          read: true, // Solo eliminar las leídas
        },
      })

      this.logger.log(
        `✅ Limpieza completada: Se eliminaron ${result.count} notificación(es) leída(s) anteriores al ${cutoffDate.toLocaleDateString()}`
      )

      return {
        deleted: result.count,
        cutoffDate: cutoffDate.toISOString(),
      }
    } catch (error) {
      this.logger.error('❌ Error en limpieza automática de notificaciones:', error)
      throw error
    }
  }

  /**
   * Limpia notificaciones muy antiguas (más de 90 días)
   * Se ejecuta semanalmente los domingos a las 3:00 AM
   * Elimina tanto leídas como no leídas muy antiguas
   */
  @Cron('0 3 * * 0') // Cada domingo a las 3 AM
  async handleDeepCleanup() {
    this.logger.log('🧹 Iniciando limpieza profunda de notificaciones muy antiguas...')

    try {
      // Eliminar notificaciones (leídas y no leídas) más antiguas de 90 días
      const daysToKeep = 90
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.prisma.notificationHistory.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      })

      this.logger.log(
        `✅ Limpieza profunda completada: Se eliminaron ${result.count} notificación(es) anteriores al ${cutoffDate.toLocaleDateString()}`
      )

      return {
        deleted: result.count,
        cutoffDate: cutoffDate.toISOString(),
      }
    } catch (error) {
      this.logger.error('❌ Error en limpieza profunda de notificaciones:', error)
      throw error
    }
  }
}
