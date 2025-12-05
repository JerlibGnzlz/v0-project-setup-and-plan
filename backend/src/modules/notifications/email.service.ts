import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Configurar Gmail SMTP
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
      this.logger.log('✅ Servicio de email configurado (Gmail SMTP)')
      this.logger.log(`📧 SMTP: ${emailConfig.host}:${emailConfig.port}`)
      this.logger.log(`👤 Usuario: ${emailConfig.auth.user}`)
    } else {
      this.logger.warn('⚠️ Servicio de email no configurado (faltan credenciales SMTP)')
      this.logger.warn('   Configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD en .env')
      this.logger.warn('   Para Gmail, necesitas una App Password: https://myaccount.google.com/apppasswords')
    }
  }

  /**
   * Envía un email de notificación
   * Si el body ya es HTML completo (contiene <!DOCTYPE), lo usa directamente
   * Si no, construye el template usando el método legacy
   */
  async sendNotificationEmail(
    to: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('❌ No se puede enviar email: servicio no configurado')
      this.logger.error('   Verifica que SMTP_USER y SMTP_PASSWORD estén configurados en .env')
      return false
    }

    // Validar que el email de destino sea válido
    if (!to || !to.includes('@')) {
      this.logger.error(`❌ Email de destino inválido: ${to}`)
      return false
    }

    try {
      this.logger.log(`📧 Preparando email para ${to}...`)
      
      // Si el body ya es HTML completo (de templates centralizados), usarlo directamente
      // Si no, construir usando el método legacy para compatibilidad
      const htmlContent = body.trim().startsWith('<!DOCTYPE') 
        ? body 
        : this.buildEmailTemplate(title, body, data)

      // Extraer texto plano del HTML para la versión de texto
      const textContent = body.replace(/<[^>]*>/g, '').trim() || title

      const mailOptions = {
        from: `"AMVA Digital" <${process.env.SMTP_USER}>`,
        to,
        subject: title,
        html: htmlContent,
        text: textContent,
      }

      this.logger.log(`📧 Enviando email a ${to} desde ${process.env.SMTP_USER}...`)
      const info = await this.transporter.sendMail(mailOptions)
      this.logger.log(`✅ Email enviado exitosamente a ${to}`)
      this.logger.log(`   Message ID: ${info.messageId}`)
      this.logger.log(`   Response: ${info.response || 'N/A'}`)
      return true
    } catch (error: any) {
      this.logger.error(`❌ Error enviando email a ${to}:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      })
      
      // Mensajes de error más específicos
      if (error.code === 'EAUTH') {
        this.logger.error('   ⚠️ Error de autenticación SMTP. Verifica SMTP_USER y SMTP_PASSWORD')
      } else if (error.code === 'ECONNECTION') {
        this.logger.error('   ⚠️ Error de conexión SMTP. Verifica SMTP_HOST y SMTP_PORT')
      } else if (error.code === 'ETIMEDOUT') {
        this.logger.error('   ⚠️ Timeout de conexión SMTP. Verifica tu conexión a internet')
      }
      
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
    } else if (tipo === 'inscripcion_recibida') {
      icon = '📝'
      color = '#3b82f6' // blue
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
              ${body.trim().startsWith('<div') || body.trim().startsWith('<!DOCTYPE')
        ? body
        : `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${title}</h2>
                   <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${body}</p>
                   ${data ? this.buildDataSection(data) : ''}`}
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
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Método de pago:</strong> ${data.metodoPago}</p>`
    }

    if (data.convencionTitulo) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${data.convencionTitulo}</p>`
    }

    if (data.numeroCuotas && data.montoPorCuota) {
      const monto = typeof data.montoPorCuota === 'number' ? data.montoPorCuota : parseFloat(data.montoPorCuota)
      html += `<p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Cuotas:</strong> ${data.numeroCuotas} cuota(s) de $${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`
    }

    html += '</div>'
    return html
  }
}

