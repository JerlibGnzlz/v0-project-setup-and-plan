import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Configurar transporter de email
    // En producción, usar variables de entorno para credenciales
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    // Solo crear transporter si hay credenciales configuradas
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      // Remover espacios del password (Gmail App Passwords pueden tener espacios)
      const cleanPassword = emailConfig.auth.pass.replace(/\s/g, '')
      
      this.transporter = nodemailer.createTransport({
        ...emailConfig,
        auth: {
          ...emailConfig.auth,
          pass: cleanPassword,
        },
      })
      this.logger.log('✅ Servicio de email configurado')
      this.logger.log(`📧 SMTP: ${emailConfig.host}:${emailConfig.port}`)
      this.logger.log(`👤 Usuario: ${emailConfig.auth.user}`)
    } else {
      this.logger.warn('⚠️ Servicio de email no configurado (faltan credenciales SMTP)')
      this.logger.warn('   Configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD en .env')
    }
  }

  /**
   * Envía un email de notificación
   */
  async sendNotificationEmail(
    to: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('No se puede enviar email: servicio no configurado')
      return false
    }

    try {
      // Construir HTML del email
      const htmlContent = this.buildEmailTemplate(title, body, data)

      const mailOptions = {
        from: `"AMVA Digital" <${process.env.SMTP_USER}>`,
        to,
        subject: title,
        html: htmlContent,
        text: body, // Versión de texto plano
      }

      const info = await this.transporter.sendMail(mailOptions)
      this.logger.log(`✅ Email enviado a ${to}: ${info.messageId}`)
      return true
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error)
      return false
    }
  }

  /**
   * Construye el template HTML del email
   */
  private buildEmailTemplate(title: string, body: string, data?: any): string {
    const tipo = data?.type || 'general'
    let icon = '📬'
    let color = '#10b981' // emerald

    if (tipo === 'pago_validado') {
      icon = '✅'
      color = '#10b981'
    } else if (tipo === 'inscripcion_confirmada') {
      icon = '🎉'
      color = '#f59e0b' // amber
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #0a1628 0%, #0d1f35 100%); border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">AMVA Digital</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${title}</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${body}</p>
              ${data ? this.buildDataSection(data) : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Asociación Misionera Vida Abundante<br>
                <a href="https://vidaabundante.org" style="color: ${color}; text-decoration: none;">vidaabundante.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  /**
   * Construye sección de datos adicionales en el email
   */
  private buildDataSection(data: any): string {
    if (!data) return ''

    let html = '<div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">'

    if (data.numeroCuota && data.cuotasTotales) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Progreso:</strong> Cuota ${data.numeroCuota} de ${data.cuotasTotales}</p>`
    }

    if (data.cuotasPagadas && data.cuotasTotales) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Cuotas pagadas:</strong> ${data.cuotasPagadas} de ${data.cuotasTotales}</p>`
    }

    if (data.monto) {
      const monto = typeof data.monto === 'number' ? data.monto : parseFloat(data.monto)
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Monto:</strong> $${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`
    }

    if (data.metodoPago) {
      html += `<p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Método de pago:</strong> ${data.metodoPago}</p>`
    }

    html += '</div>'
    return html
  }
}

