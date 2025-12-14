import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CredencialesMinisterialesService } from './credenciales-ministeriales.service'

/**
 * Servicio para recordatorios automáticos de estado de credenciales ministeriales
 *
 * Envía notificaciones push a través de la app móvil AMVA para recordar a los usuarios
 * sobre el estado de sus credenciales (vigente, por vencer, vencida).
 *
 * Se ejecuta:
 * - Diariamente a las 9:00 AM para credenciales por vencer (≤30 días)
 * - Semanalmente los lunes a las 9:00 AM para credenciales vencidas
 * - Mensualmente el día 1 a las 9:00 AM para credenciales vigentes (recordatorio general)
 */
@Injectable()
export class CredencialesRecordatoriosService {
  private readonly logger = new Logger(CredencialesRecordatoriosService.name)

  constructor(
    private credencialesMinisterialesService: CredencialesMinisterialesService
  ) {}

  /**
   * Envía recordatorios diarios para credenciales por vencer (≤30 días)
   * Se ejecuta diariamente a las 9:00 AM
   */
  @Cron('0 9 * * *') // Diariamente a las 9:00 AM
  async handleRecordatoriosPorVencer() {
    this.logger.log('📱 Iniciando recordatorios diarios de credenciales por vencer...')

    try {
      const resultado = await this.credencialesMinisterialesService.enviarRecordatoriosEstadoCredenciales()

      // Filtrar solo las que están por vencer
      const porVencer = resultado.detalles.filter((d) => d.estado === 'por_vencer')
      const enviadosPorVencer = porVencer.filter((d) => d.exito).length
      const fallidosPorVencer = porVencer.filter((d) => !d.exito).length

      this.logger.log(
        `✅ Recordatorios por vencer completados: ${enviadosPorVencer} enviados, ${fallidosPorVencer} fallidos`
      )

      return {
        tipo: 'por_vencer',
        enviados: enviadosPorVencer,
        fallidos: fallidosPorVencer,
        total: porVencer.length,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error('❌ Error en recordatorios por vencer:', errorMessage)
      throw error
    }
  }

  /**
   * Envía recordatorios semanales para credenciales vencidas
   * Se ejecuta los lunes a las 9:00 AM
   */
  @Cron('0 9 * * 1') // Cada lunes a las 9:00 AM
  async handleRecordatoriosVencidas() {
    this.logger.log('📱 Iniciando recordatorios semanales de credenciales vencidas...')

    try {
      const resultado = await this.credencialesMinisterialesService.enviarRecordatoriosEstadoCredenciales()

      // Filtrar solo las vencidas
      const vencidas = resultado.detalles.filter((d) => d.estado === 'vencida')
      const enviadosVencidas = vencidas.filter((d) => d.exito).length
      const fallidosVencidas = vencidas.filter((d) => !d.exito).length

      this.logger.log(
        `✅ Recordatorios vencidas completados: ${enviadosVencidas} enviados, ${fallidosVencidas} fallidos`
      )

      return {
        tipo: 'vencida',
        enviados: enviadosVencidas,
        fallidos: fallidosVencidas,
        total: vencidas.length,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error('❌ Error en recordatorios vencidas:', errorMessage)
      throw error
    }
  }

  /**
   * Envía recordatorio mensual para credenciales vigentes
   * Se ejecuta el día 1 de cada mes a las 9:00 AM
   */
  @Cron('0 9 1 * *') // El día 1 de cada mes a las 9:00 AM
  async handleRecordatoriosVigentes() {
    this.logger.log('📱 Iniciando recordatorio mensual de credenciales vigentes...')

    try {
      const resultado = await this.credencialesMinisterialesService.enviarRecordatoriosEstadoCredenciales()

      // Filtrar solo las vigentes
      const vigentes = resultado.detalles.filter((d) => d.estado === 'vigente')
      const enviadosVigentes = vigentes.filter((d) => d.exito).length
      const fallidosVigentes = vigentes.filter((d) => !d.exito).length

      this.logger.log(
        `✅ Recordatorio vigentes completado: ${enviadosVigentes} enviados, ${fallidosVigentes} fallidos`
      )

      return {
        tipo: 'vigente',
        enviados: enviadosVigentes,
        fallidos: fallidosVigentes,
        total: vigentes.length,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error('❌ Error en recordatorio vigentes:', errorMessage)
      throw error
    }
  }
}

