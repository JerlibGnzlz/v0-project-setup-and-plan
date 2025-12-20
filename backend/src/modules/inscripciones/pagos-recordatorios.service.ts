import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { PagoRecordatorioEvent, NotificationEventType } from '../notifications/types/notification.types'
import { EventEmitter2 } from '@nestjs/event-emitter'

/**
 * Servicio para enviar recordatorios de pagos pendientes
 * Se ejecuta diariamente a las 9:00 AM
 */
@Injectable()
export class PagosRecordatoriosService {
  private readonly logger = new Logger(PagosRecordatoriosService.name)

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Envía recordatorios de pagos pendientes diariamente a las 9:00 AM
   */
  @Cron('0 9 * * *') // Diariamente a las 9:00 AM
  async enviarRecordatoriosPagosPendientes() {
    this.logger.log('🔔 Iniciando envío de recordatorios de pagos pendientes...')

    try {
      // Buscar inscripciones activas con pagos pendientes
      const inscripcionesConPagosPendientes = await this.prisma.inscripcion.findMany({
        where: {
          // Solo inscripciones activas (no canceladas)
          estado: {
            not: 'CANCELADA',
          },
          // Con pagos pendientes
          pagos: {
            some: {
              estado: 'PENDIENTE',
            },
          },
        },
        include: {
          convencion: true,
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
          pagos: {
            where: {
              estado: 'PENDIENTE',
            },
            orderBy: {
              numeroCuota: 'asc',
            },
          },
        },
      })

      this.logger.log(`📋 Encontradas ${inscripcionesConPagosPendientes.length} inscripciones con pagos pendientes`)

      let totalEnviados = 0
      let totalErrores = 0

      for (const inscripcion of inscripcionesConPagosPendientes) {
        try {
          // Obtener información de pagos pendientes
          const pagosPendientes = inscripcion.pagos.filter((p) => p.estado === 'PENDIENTE')
          const totalPendiente = pagosPendientes.reduce((sum, pago) => sum + Number(pago.monto), 0)
          const montoFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(totalPendiente)

          // Preparar mensaje
          const titulo = '⏰ Recordatorio de Pago Pendiente'
          const mensaje = `Tienes ${pagosPendientes.length} pago${pagosPendientes.length > 1 ? 's' : ''} pendiente${pagosPendientes.length > 1 ? 's' : ''} por un total de ${montoFormateado} para "${inscripcion.convencion.titulo}". Por favor, sube tu comprobante de pago.`

          // Enviar push notification si tiene tokens registrados
          if (inscripcion.invitado?.auth?.deviceTokens && inscripcion.invitado.auth.deviceTokens.length > 0) {
            let successCount = 0
            let errorCount = 0

            for (const deviceToken of inscripcion.invitado.auth.deviceTokens) {
              try {
                const sent = await this.notificationsService.sendPushNotification(
                  deviceToken.token,
                  titulo,
                  mensaje,
                  {
                    type: 'pago_recordatorio',
                    inscripcionId: inscripcion.id,
                    convencionId: inscripcion.convencion.id,
                    convencionTitulo: inscripcion.convencion.titulo,
                    pagosPendientes: pagosPendientes.length,
                    montoTotalPendiente: totalPendiente,
                    pagosPendientesIds: pagosPendientes.map((p) => p.id),
                  }
                )

                if (sent) {
                  successCount++
                } else {
                  errorCount++
                }
              } catch (tokenError) {
                errorCount++
                this.logger.warn(`Error enviando push a token ${deviceToken.token}:`, tokenError)
              }
            }

            if (successCount > 0) {
              totalEnviados++
              this.logger.log(
                `📱 Recordatorio enviado a ${inscripcion.email}: ${successCount} exitosas, ${errorCount} errores`
              )
            }
          }

          // Enviar email de recordatorio también
          try {
            const event = new PagoRecordatorioEvent({
              email: inscripcion.email,
              inscripcionId: inscripcion.id,
              convencionTitulo: inscripcion.convencion.titulo,
              pagosPendientes: pagosPendientes.length,
              montoTotalPendiente: totalPendiente,
              nombre: inscripcion.nombre,
              apellido: inscripcion.apellido || '',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_RECORDATORIO, event)
          } catch (eventError) {
            this.logger.warn(`Error emitiendo evento de recordatorio para ${inscripcion.email}:`, eventError)
          }
        } catch (error) {
          totalErrores++
          this.logger.error(`Error procesando recordatorio para inscripción ${inscripcion.id}:`, error)
        }
      }

      this.logger.log(
        `✅ Proceso de recordatorios completado: ${totalEnviados} enviados, ${totalErrores} errores`
      )
    } catch (error) {
      this.logger.error('❌ Error en el proceso de recordatorios de pagos pendientes:', error)
    }
  }

  /**
   * Método manual para ejecutar recordatorios (útil para testing)
   */
  async ejecutarRecordatoriosManual() {
    this.logger.log('🔔 Ejecutando recordatorios manualmente...')
    await this.enviarRecordatoriosPagosPendientes()
  }
}

