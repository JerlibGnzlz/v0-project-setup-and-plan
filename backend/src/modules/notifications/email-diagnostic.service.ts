import { Injectable, Logger } from '@nestjs/common'
import { EmailService } from './email.service'

/**
 * Servicio de diagnóstico para verificar la configuración de email
 */
@Injectable()
export class EmailDiagnosticService {
  private readonly logger = new Logger(EmailDiagnosticService.name)

  constructor(private emailService: EmailService) {}

  /**
   * Verifica la configuración de email y muestra un diagnóstico completo
   */
  async diagnosticarConfiguracion(): Promise<{
    provider: string
    configured: boolean
    variables: {
      EMAIL_PROVIDER?: string
      SENDGRID_API_KEY?: string
      SENDGRID_FROM_EMAIL?: string
      RESEND_API_KEY?: string
      RESEND_FROM_EMAIL?: string
      SMTP_USER?: string
      SMTP_PASSWORD?: string
      SMTP_HOST?: string
      SMTP_PORT?: string
    }
    recomendaciones: string[]
  }> {
    const provider = process.env.EMAIL_PROVIDER || 'gmail'
    const recomendaciones: string[] = []

    // Verificar variables según el proveedor
    if (provider === 'sendgrid') {
      if (!process.env.SENDGRID_API_KEY) {
        recomendaciones.push('❌ SENDGRID_API_KEY no está configurado')
      }
      if (!process.env.SENDGRID_FROM_EMAIL) {
        recomendaciones.push('❌ SENDGRID_FROM_EMAIL no está configurado')
      }
      if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
        recomendaciones.push('✅ SendGrid está configurado correctamente')
      }
    } else if (provider === 'resend') {
      if (!process.env.RESEND_API_KEY) {
        recomendaciones.push('❌ RESEND_API_KEY no está configurado')
      }
      if (!process.env.RESEND_FROM_EMAIL) {
        recomendaciones.push('❌ RESEND_FROM_EMAIL no está configurado')
      }
      if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
        recomendaciones.push('✅ Resend está configurado correctamente')
      }
    } else {
      // gmail o smtp
      if (!process.env.SMTP_USER) {
        recomendaciones.push('❌ SMTP_USER no está configurado')
      }
      if (!process.env.SMTP_PASSWORD) {
        recomendaciones.push('❌ SMTP_PASSWORD no está configurado')
      }
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        recomendaciones.push('✅ SMTP está configurado correctamente')
      }
    }

    const configured =
      (provider === 'sendgrid' && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) ||
      (provider === 'resend' && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) ||
      (provider === 'gmail' && process.env.SMTP_USER && process.env.SMTP_PASSWORD) ||
      (provider === 'smtp' && process.env.SMTP_USER && process.env.SMTP_PASSWORD)

    return {
      provider,
      configured: !!configured,
      variables: {
        EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'gmail (default)',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '***' + process.env.SENDGRID_API_KEY.slice(-4) : 'NO CONFIGURADO',
        SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'NO CONFIGURADO',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-4) : 'NO CONFIGURADO',
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'NO CONFIGURADO',
        SMTP_USER: process.env.SMTP_USER || 'NO CONFIGURADO',
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NO CONFIGURADO',
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com (default)',
        SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      },
      recomendaciones,
    }
  }

  /**
   * Prueba el envío de un email de prueba
   */
  async probarEnvio(email: string): Promise<{
    exito: boolean
    mensaje: string
    detalles?: unknown
  }> {
    try {
      this.logger.log(`🧪 Probando envío de email a ${email}...`)

      const resultado = await this.emailService.sendNotificationEmail(
        email,
        '🧪 Prueba de Email - AMVA Digital',
        '<p>Este es un email de prueba para verificar que la configuración de email está funcionando correctamente.</p><p>Si recibes este email, la configuración está correcta ✅</p>',
        {
          type: 'test',
          message: 'Email de prueba enviado correctamente',
        }
      )

      if (resultado) {
        return {
          exito: true,
          mensaje: `✅ Email de prueba enviado exitosamente a ${email}`,
        }
      } else {
        return {
          exito: false,
          mensaje: `❌ No se pudo enviar el email de prueba a ${email}. Verifica la configuración.`,
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return {
        exito: false,
        mensaje: `❌ Error enviando email de prueba: ${errorMessage}`,
        detalles: error,
      }
    }
  }
}

