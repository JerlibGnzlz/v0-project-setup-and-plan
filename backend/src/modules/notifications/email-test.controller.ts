import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { EmailService } from './email.service'
import { EmailDiagnosticService } from './email-diagnostic.service'
import { Logger } from '@nestjs/common'

@Controller('notifications/test-email')
export class EmailTestController {
  private readonly logger = new Logger(EmailTestController.name)

  constructor(
    private emailService: EmailService,
    private emailDiagnostic: EmailDiagnosticService
  ) {}

  /**
   * Endpoint para diagnosticar la configuración de email
   */
  @Get('diagnostic')
  @UseGuards(JwtAuthGuard)
  async diagnosticar() {
    try {
      const diagnostico = await this.emailDiagnostic.diagnosticarConfiguracion()
      return diagnostico
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error('Error en diagnóstico de email:', errorMessage)
      throw error
    }
  }

  /**
   * Endpoint para probar el envío de un email
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async testEmail(@Body() body: { to: string }) {
    try {
      // Primero diagnosticar la configuración
      const diagnostico = await this.emailDiagnostic.diagnosticarConfiguracion()
      
      if (!diagnostico.configured) {
        return {
          success: false,
          message: '❌ Email no está configurado correctamente',
          diagnostico,
          recomendaciones: diagnostico.recomendaciones,
        }
      }

      // Intentar enviar el email de prueba
      const resultado = await this.emailDiagnostic.probarEnvio(body.to)

      return {
        success: resultado.exito,
        message: resultado.mensaje,
        diagnostico,
        detalles: resultado.detalles,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorString = error instanceof Error ? error.toString() : String(error)
      this.logger.error('Error en test de email:', errorMessage)
      return {
        success: false,
        message: errorMessage,
        error: errorString,
      }
    }
  }
}
