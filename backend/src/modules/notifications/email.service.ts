import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as sgMail from '@sendgrid/mail'
import { NotificationData } from './types/notification.types'

type EmailProvider = 'sendgrid' | 'gmail' | 'smtp'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter | null = null
  private emailProvider: EmailProvider = 'gmail'
  private sendgridConfigured = false

  constructor() {
    // Determinar qué proveedor usar (SendGrid es preferido para producción)
    const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase() as EmailProvider
    this.emailProvider = provider

    if (provider === 'sendgrid') {
      this.configureSendGrid()
    } else {
      this.configureSMTP()
    }
  }

  /**
   * Configura SendGrid (recomendado para producción)
   */
  private configureSendGrid() {
    const apiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER

    if (!apiKey) {
      this.logger.warn('⚠️ SendGrid no configurado (falta SENDGRID_API_KEY)')
      this.logger.warn('   Configura SENDGRID_API_KEY y SENDGRID_FROM_EMAIL en .env')
      this.logger.warn('   O cambia EMAIL_PROVIDER=gmail para usar Gmail SMTP')
      return
    }

    if (!fromEmail) {
      this.logger.warn('⚠️ SendGrid no configurado (falta SENDGRID_FROM_EMAIL)')
      this.logger.warn('   Configura SENDGRID_FROM_EMAIL en .env')
      return
    }

    try {
      sgMail.setApiKey(apiKey)
      this.sendgridConfigured = true
      this.logger.log('✅ Servicio de email configurado (SendGrid)')
      this.logger.log(`📧 Provider: SendGrid`)
      this.logger.log(`👤 From: ${fromEmail}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error configurando SendGrid: ${errorMessage}`)
      this.logger.warn('   Fallback: Intentando configurar Gmail SMTP...')
      this.configureSMTP()
    }
  }

  /**
   * Configura Gmail SMTP (fallback o si EMAIL_PROVIDER=gmail)
   */
  private configureSMTP() {
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
        // Configuración de timeouts más robusta para evitar ETIMEDOUT
        connectionTimeout: 30000, // 30 segundos para establecer conexión
        greetingTimeout: 30000, // 30 segundos para recibir saludo del servidor
        socketTimeout: 30000, // 30 segundos para operaciones de socket
        // Opciones adicionales para mejorar la conexión
        pool: true, // Usar pool de conexiones
        maxConnections: 5, // Máximo de conexiones en el pool
        maxMessages: 100, // Máximo de mensajes por conexión
        rateDelta: 1000, // Intervalo para rate limiting
        rateLimit: 5, // Máximo de mensajes por rateDelta
        // Opciones de TLS/SSL
        tls: {
          rejectUnauthorized: false, // No rechazar certificados no autorizados (útil para algunos servidores)
          ciphers: 'SSLv3', // Ciphers permitidos
        },
        // Debug (solo en desarrollo)
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      })
      this.logger.log('✅ Servicio de email configurado (Gmail SMTP)')
      this.logger.log(`📧 SMTP: ${emailConfig.host}:${emailConfig.port}`)
      this.logger.log(`👤 Usuario: ${emailConfig.auth.user}`)
    } else {
      this.logger.warn('⚠️ Servicio de email no configurado (faltan credenciales SMTP)')
      this.logger.warn('   Configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD en .env')
      this.logger.warn(
        '   O configura SendGrid: SENDGRID_API_KEY y SENDGRID_FROM_EMAIL con EMAIL_PROVIDER=sendgrid'
      )
      this.logger.warn(
        '   Para Gmail, necesitas una App Password: https://myaccount.google.com/apppasswords'
      )
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
    data?: NotificationData
  ): Promise<boolean> {
    // Validar que el email de destino sea válido
    if (!to || !to.includes('@')) {
      this.logger.error(`❌ Email de destino inválido: ${to}`)
      return false
    }

    // Usar SendGrid si está configurado
    if (this.sendgridConfigured) {
      return this.sendWithSendGrid(to, title, body, data)
    }

    // Usar SMTP (Gmail) como fallback
    if (!this.transporter) {
      this.logger.error('❌ No se puede enviar email: servicio no configurado')
      this.logger.error('   Verifica que SMTP_USER y SMTP_PASSWORD estén configurados en .env')
      this.logger.error('   O configura SendGrid: SENDGRID_API_KEY y SENDGRID_FROM_EMAIL con EMAIL_PROVIDER=sendgrid')
      return false
    }

    return this.sendWithSMTP(to, title, body, data)
  }

  /**
   * Envía email usando SendGrid (recomendado)
   */
  private async sendWithSendGrid(
    to: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 Preparando email con SendGrid para ${to}...`)

      // Si el body ya es HTML completo, usarlo directamente
      const htmlContent = body.trim().startsWith('<!DOCTYPE')
        ? body
        : this.buildEmailTemplate(title, body, data)

      // Extraer texto plano del HTML
      const textContent = body.replace(/<[^>]*>/g, '').trim() || title

      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER
      const fromName = process.env.SENDGRID_FROM_NAME || 'AMVA Digital'

      if (!fromEmail) {
        this.logger.error('❌ SENDGRID_FROM_EMAIL no configurado')
        this.logger.error('   Configura SENDGRID_FROM_EMAIL en las variables de entorno')
        // Intentar con SMTP si está disponible
        if (this.transporter) {
          this.logger.warn('⚠️ Intentando con SMTP como fallback...')
          return this.sendWithSMTP(to, title, body, data)
        }
        return false
      }

      const msg = {
        to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: title,
        html: htmlContent,
        text: textContent,
      }

      this.logger.log(`📧 Enviando email a ${to} desde ${fromEmail} (SendGrid)...`)
      
      // Agregar timeout de 30 segundos para SendGrid
      const sendPromise = sgMail.send(msg)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: SendGrid tardó más de 30 segundos')), 30000)
      })
      
      const [response] = await Promise.race([sendPromise, timeoutPromise]) as [sgMail.ClientResponse, unknown]
      
      this.logger.log(`✅ Email enviado exitosamente a ${to} (SendGrid)`)
      this.logger.log(`   Status Code: ${response.statusCode}`)
      this.logger.log(`   Message ID: ${response.headers['x-message-id'] || 'N/A'}`)
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      // Extraer información adicional del error de SendGrid
      const sendgridError = error as { response?: { body?: { errors?: unknown[] }; statusCode?: number } }
      const errorDetails = sendgridError?.response?.body?.errors || []
      const statusCode = sendgridError?.response?.statusCode

      this.logger.error(`❌ Error enviando email con SendGrid a ${to}:`, {
        message: errorMessage,
        statusCode,
        errors: errorDetails,
        stack: errorStack,
      })

      // Mensajes específicos según el tipo de error
      if (errorMessage === 'Forbidden' || statusCode === 403) {
        this.logger.error('   ⚠️ Error 403 Forbidden de SendGrid')
        this.logger.error('   Posibles causas:')
        this.logger.error('   1. El email "from" no está verificado en SendGrid')
        this.logger.error('      → Ve a SendGrid → Settings → Sender Authentication')
        this.logger.error('      → Verifica el email: ' + (process.env.SENDGRID_FROM_EMAIL || 'NO CONFIGURADO'))
        this.logger.error('   2. La API Key no tiene permisos de "Mail Send"')
        this.logger.error('      → Ve a SendGrid → Settings → API Keys')
        this.logger.error('      → Verifica que la API Key tenga permisos de "Mail Send"')
        this.logger.error('   3. La API Key es incorrecta o fue revocada')
        this.logger.error('      → Verifica SENDGRID_API_KEY en Render')
      } else if (statusCode === 401) {
        this.logger.error('   ⚠️ Error 401 Unauthorized de SendGrid')
        this.logger.error('   → La API Key es inválida o fue revocada')
        this.logger.error('   → Verifica SENDGRID_API_KEY en Render')
      } else if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
        this.logger.error('   Detalles del error:')
        errorDetails.forEach((err: unknown, index: number) => {
          const errObj = err as { message?: string; field?: string }
          this.logger.error(`   ${index + 1}. ${errObj.field || 'Error'}: ${errObj.message || 'N/A'}`)
        })
      }

      // Si SendGrid falla, intentar con SMTP como fallback
      if (this.transporter) {
        this.logger.warn('⚠️ SendGrid falló, intentando con SMTP como fallback...')
        return this.sendWithSMTP(to, title, body, data)
      }

      return false
    }
  }

  /**
   * Envía email usando SMTP (Gmail)
   */
  private async sendWithSMTP(
    to: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    try {
      this.logger.log(`📧 Preparando email con SMTP para ${to}...`)

      // Si el body ya es HTML completo (de templates centralizados), usarlo directamente
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

      this.logger.log(`📧 Enviando email a ${to} desde ${process.env.SMTP_USER} (SMTP)...`)
      
      // Agregar timeout adicional para la operación completa
      const sendPromise = this.transporter!.sendMail(mailOptions)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El envío de email tardó más de 60 segundos')), 60000)
      })
      
      const info = await Promise.race([sendPromise, timeoutPromise])
      
      this.logger.log(`✅ Email enviado exitosamente a ${to} (SMTP)`)
      this.logger.log(`   Message ID: ${info.messageId}`)
      this.logger.log(`   Response: ${info.response || 'N/A'}`)
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorCode = this.getErrorCode(error)
      const errorStack = error instanceof Error ? error.stack : undefined

      this.logger.error(`❌ Error enviando email a ${to}:`, {
        message: errorMessage,
        code: errorCode,
        command: this.getErrorProperty(error, 'command'),
        response: this.getErrorProperty(error, 'response'),
        responseCode: this.getErrorProperty(error, 'responseCode'),
        stack: errorStack,
      })

      // Mensajes de error más específicos
      if (errorCode === 'EAUTH') {
        this.logger.error('   ⚠️ Error de autenticación SMTP. Verifica SMTP_USER y SMTP_PASSWORD')
      } else if (errorCode === 'ECONNECTION') {
        this.logger.error('   ⚠️ Error de conexión SMTP. Verifica SMTP_HOST y SMTP_PORT')
      } else if (errorCode === 'ETIMEDOUT' || errorMessage.includes('Timeout')) {
        this.logger.error('   ⚠️ Timeout de conexión SMTP')
        this.logger.error('   Posibles causas:')
        this.logger.error('   - Firewall bloqueando conexión a Gmail SMTP')
        this.logger.error('   - SMTP_HOST o SMTP_PORT incorrectos')
        this.logger.error('   - Problemas de red en Render')
        this.logger.error('   - Gmail bloqueando conexiones desde Render')
        this.logger.error('   💡 Solución recomendada: Usa SendGrid configurando:')
        this.logger.error('      EMAIL_PROVIDER=sendgrid')
        this.logger.error('      SENDGRID_API_KEY=tu-api-key')
        this.logger.error('      SENDGRID_FROM_EMAIL=tu-email@dominio.com')
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
              ${
                body.trim().startsWith('<div') || body.trim().startsWith('<!DOCTYPE')
                  ? body
                  : `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">${title}</h2>
                   <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">${body}</p>
                   ${data ? this.buildDataSection(data) : ''}`
              }
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

  /**
   * Helper para obtener el código de error de forma segura
   */
  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return typeof error.code === 'string' ? error.code : undefined
    }
    return undefined
  }

  /**
   * Helper para obtener propiedades de error de forma segura
   */
  private getErrorProperty(error: unknown, property: string): unknown {
    if (error && typeof error === 'object' && property in error) {
      return (error as Record<string, unknown>)[property]
    }
    return undefined
  }

  /**
   * Helper para obtener un valor numérico de forma segura desde unknown
   */
  private getNumberValue(value: unknown): number | null {
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  /**
   * Helper para obtener un valor string de forma segura desde unknown
   */
  private getStringValue(value: unknown): string | null {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    return null
  }
}
