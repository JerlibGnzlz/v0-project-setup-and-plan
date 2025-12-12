import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CredencialPorVencerEvent } from '../notifications/events/notification.events'
import { NotificationEventType } from '../notifications/events/notification.events'
import { EstadoCredencial } from '@prisma/client'

/**
 * Scheduler para verificar credenciales por vencer y enviar notificaciones
 * Se ejecuta diariamente a las 9:00 AM
 */
@Injectable()
export class CredencialesPastoralesScheduler {
  private readonly logger = new Logger(CredencialesPastoralesScheduler.name)

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Verifica credenciales por vencer y envía notificaciones
   * Se ejecuta diariamente a las 9:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async verificarCredencialesPorVencer() {
    this.logger.log('🔍 Iniciando verificación de credenciales por vencer...')

    try {
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      // Obtener credenciales que vencen en los próximos 30 días
      const credenciales = await this.prisma.credencialPastoral.findMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gte: hoy,
            lte: en30Dias,
          },
          estado: {
            in: [EstadoCredencial.VIGENTE, EstadoCredencial.POR_VENCER],
          },
          // Solo notificar si no se ha enviado notificación en los últimos 7 días
          OR: [
            { notificacionVencimientoEnviada: false },
            {
              fechaUltimaNotificacion: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace más de 7 días
              },
            },
          ],
        },
        include: {
          pastor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
        },
      })

      this.logger.log(`📋 Encontradas ${credenciales.length} credenciales por vencer`)

      let notificacionesEnviadas = 0

      for (const credencial of credenciales) {
        if (!credencial.pastor.email) {
          this.logger.warn(
            `⚠️ Pastor ${credencial.pastor.nombre} ${credencial.pastor.apellido} no tiene email, saltando notificación`
          )
          continue
        }

        const fechaVencimiento = new Date(credencial.fechaVencimiento)
        const diasRestantes = Math.ceil(
          (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Emitir evento de notificación
        const event = new CredencialPorVencerEvent({
          email: credencial.pastor.email,
          userId: credencial.pastor.id,
          credencialId: credencial.id,
          numeroCredencial: credencial.numeroCredencial,
          fechaVencimiento: credencial.fechaVencimiento.toISOString(),
          diasRestantes,
          nombre: credencial.pastor.nombre,
          apellido: credencial.pastor.apellido,
        })

        this.eventEmitter.emit(NotificationEventType.CREDENCIAL_POR_VENCER, event)

        // Actualizar flag de notificación
        await this.prisma.credencialPastoral.update({
          where: { id: credencial.id },
          data: {
            notificacionVencimientoEnviada: true,
            fechaUltimaNotificacion: new Date(),
            estado: EstadoCredencial.POR_VENCER,
          },
        })

        notificacionesEnviadas++
        this.logger.log(
          `✅ Notificación enviada a ${credencial.pastor.email} (${diasRestantes} días restantes)`
        )
      }

      this.logger.log(
        `✅ Verificación completada: ${notificacionesEnviadas} notificaciones enviadas`
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al verificar credenciales por vencer: ${errorMessage}`)
    }
  }

  /**
   * Actualiza los estados de las credenciales basado en fechas
   * Se ejecuta diariamente a las 8:00 AM (antes de la verificación de notificaciones)
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async actualizarEstadosCredenciales() {
    this.logger.log('🔄 Iniciando actualización de estados de credenciales...')

    try {
      const hoy = new Date()
      const en30Dias = new Date()
      en30Dias.setDate(hoy.getDate() + 30)

      // Actualizar credenciales vencidas
      const vencidas = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            lt: hoy,
          },
          estado: {
            not: EstadoCredencial.VENCIDA,
          },
        },
        data: {
          estado: EstadoCredencial.VENCIDA,
        },
      })

      // Actualizar credenciales por vencer
      const porVencer = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gte: hoy,
            lte: en30Dias,
          },
          estado: {
            not: EstadoCredencial.POR_VENCER,
          },
        },
        data: {
          estado: EstadoCredencial.POR_VENCER,
        },
      })

      // Actualizar credenciales vigentes (más de 30 días)
      const vigentes = await this.prisma.credencialPastoral.updateMany({
        where: {
          activa: true,
          fechaVencimiento: {
            gt: en30Dias,
          },
          estado: {
            not: EstadoCredencial.VIGENTE,
          },
        },
        data: {
          estado: EstadoCredencial.VIGENTE,
        },
      })

      this.logger.log(
        `✅ Estados actualizados: ${vencidas.count} vencidas, ${porVencer.count} por vencer, ${vigentes.count} vigentes`
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar estados: ${errorMessage}`)
    }
  }
}

