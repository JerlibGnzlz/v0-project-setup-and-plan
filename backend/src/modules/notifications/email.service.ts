import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { NotificationData } from './types/notification.types'

type EmailProvider = 'gmail' | 'smtp'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter | null = null
  private emailProvider: EmailProvider = 'gmail'

  constructor() {
    const providerEnv = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase()

    if (providerEnv === 'gmail' || providerEnv === 'smtp') {
      this.emailProvider = providerEnv
    }

    this.logger.log(`📧 Inicializando EmailService con proveedor: ${this.emailProvider}`)
    this.configureSMTP()

    if (!this.transporter) {
      this.logger.error('❌ No se pudo configurar el proveedor de email')
      this.logger.error('   Configura SMTP_USER y SMTP_PASSWORD en .env')
      this.logger.error('   Para Brevo: usa clave SMTP (xsmtpsib-), NO la API key (xkeysib-)')
    } else {
      this.logger.log('✅ EmailService configurado correctamente con SMTP')
    }
  }

  /**
   * Configura SMTP (Brevo, Gmail, etc.)
   */
  private configureSMTP(): void {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn('⚠️ SMTP no configurado (faltan SMTP_USER o SMTP_PASSWORD)')
      return
    }

    const cleanPassword = String(emailConfig.auth.pass).replace(/\s/g, '')
    if (!cleanPassword || cleanPassword.length === 0) {
      this.logger.error('❌ SMTP_PASSWORD está vacío o solo contiene espacios')
      return
    }

    try {
      const smtpConfig = {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        requireTLS: emailConfig.port === 587,
        auth: {
          user: emailConfig.auth.user,
          pass: cleanPassword,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        pool: false,
        maxConnections: 1,
        maxMessages: 1,
        rateDelta: 2000,
        rateLimit: 3,
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2',
          ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
        },
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      }

      this.transporter = nodemailer.createTransport(
        smtpConfig as unknown as nodemailer.TransportOptions
      )

      if (this.transporter) {
        this.logger.log('✅ SMTP configurado correctamente')
        this.logger.log(`📧 SMTP: ${emailConfig.host}:${emailConfig.port}`)
        this.logger.log(`👤 Usuario: ${emailConfig.auth.user}`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error creando transporter SMTP: ${errorMessage}`)
      this.transporter = null
    }
  }

  /**
   * Envía un email de notificación usando SMTP
   */
  async sendNotificationEmail(
    to: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    if (!to || !to.includes('@')) {
      this.logger.error(`❌ Email de destino inválido: ${to}`)
      return false
    }

    if (!this.transporter) {
      this.logger.error('❌ SMTP no está configurado. Verifica SMTP_USER y SMTP_PASSWORD')
      return false
    }

    return this.sendWithSMTP(to, title, body, data)
  }

  /**
   * Envía email usando SMTP
   */
  private async sendWithSMTP(
    to: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 Preparando email con SMTP para ${to}...`)

      const htmlContent = body.trim().startsWith('<!DOCTYPE')
        ? body
        : this.buildEmailTemplate(title, body, data)

      const textContent = body.replace(/<[^>]*>/g, '').trim() || title

      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      const fromName = process.env.SMTP_FROM_NAME || 'AMVA Digital'

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: title,
        html: htmlContent,
        text: textContent,
      }

      this.logger.log(`📧 Enviando email a ${to} desde ${fromEmail} (SMTP)...`)

      const sendPromise = this.transporter.sendMail(mailOptions)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El envío SMTP tardó más de 60 segundos')), 60000)
      })

      const info = await Promise.race([sendPromise, timeoutPromise])

      this.logger.log(`✅ Email enviado exitosamente a ${to} (SMTP)`)
      this.logger.log(`   Message ID: ${info.messageId}`)
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorCode = this.getErrorCode(error)

      this.logger.error(`❌ Error enviando email a ${to}:`, {
        message: errorMessage,
        code: errorCode,
      })

      if (errorCode === 'ETIMEDOUT' || String(errorMessage).includes('Timeout')) {
        this.logger.error('   ⚠️ Timeout de conexión SMTP. Prueba SMTP_PORT=2525 o verifica firewall')
      } else if (errorCode === 'EAUTH') {
        this.logger.error('   ⚠️ Error de autenticación. Verifica SMTP_USER y SMTP_PASSWORD')
        this.logger.error('   💡 Brevo: usa clave SMTP (xsmtpsib-), NO la API key (xkeysib-)')
      } else if (errorCode === 'ECONNECTION') {
        this.logger.error('   ⚠️ Error de conexión. Verifica SMTP_HOST y SMTP_PORT')
      }

      return false
    }
  }

  /**
   * Construye el template HTML del email
   */
  private buildEmailTemplate(title: string, body: string, data?: NotificationData): string {
    const tipo = data?.type || 'general'
    let icon = '📬'
    const color = '#10b981'

    if (tipo === 'pago_validado') {
      icon = '✅'
    } else if (tipo === 'inscripcion_confirmada') {
      icon = '🎉'
    } else if (tipo === 'inscripcion_recibida') {
      icon = '📝'
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
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #0a1628 0%, #0d1f35 100%); border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">AMVA Digital</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              ${body.trim().startsWith('<div') || body.trim().startsWith('<!DOCTYPE')
        ? body
        : `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${title}</h2>
                   <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${body}</p>
                   ${data ? this.buildDataSection(data) : ''}`
      }
            </td>
          </tr>
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

  private buildDataSection(data: NotificationData): string {
    if (!data) return ''

    let html =
      '<div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">'

    const numeroCuota = this.getNumberValue(data.numeroCuota)
    const cuotasTotales = this.getNumberValue(data.cuotasTotales)
    if (numeroCuota !== null && cuotasTotales !== null) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Progreso:</strong> Cuota ${numeroCuota} de ${cuotasTotales}</p>`
    }

    const cuotasPagadas = this.getNumberValue(data.cuotasPagadas)
    if (cuotasPagadas !== null && cuotasTotales !== null) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Cuotas pagadas:</strong> ${cuotasPagadas} de ${cuotasTotales}</p>`
    }

    if (data.monto) {
      const montoValue = this.getNumberValue(data.monto)
      if (montoValue !== null) {
        html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Monto:</strong> $${montoValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`
      }
    }

    const metodoPago = this.getStringValue(data.metodoPago)
    if (metodoPago) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Método de pago:</strong> ${metodoPago}</p>`
    }

    const convencionTitulo = this.getStringValue(data.convencionTitulo)
    if (convencionTitulo) {
      html += `<p style="margin: 0 0 10px; color: #1f2937; font-size: 14px;"><strong>Convención:</strong> ${convencionTitulo}</p>`
    }

    const numeroCuotas = this.getNumberValue(data.numeroCuotas)
    const montoPorCuota = this.getNumberValue(data.montoPorCuota)
    if (numeroCuotas !== null && montoPorCuota !== null) {
      html += `<p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Cuotas:</strong> ${numeroCuotas} cuota(s) de $${montoPorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`
    }

    html += '</div>'
    return html
  }

  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return typeof error.code === 'string' ? error.code : undefined
    }
    return undefined
  }

  private getNumberValue(value: unknown): number | null {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  private getStringValue(value: unknown): string | null {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    return null
  }
}
