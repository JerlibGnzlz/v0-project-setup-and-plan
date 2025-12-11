import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as sgMail from '@sendgrid/mail'
import { Resend } from 'resend'
import { NotificationData } from './types/notification.types'

type EmailProvider = 'sendgrid' | 'gmail' | 'smtp' | 'resend'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter | null = null
  private emailProvider: EmailProvider = 'gmail'
  private sendgridConfigured = false
  private resend: Resend | null = null
  private resendConfigured = false

  constructor() {
    // Determinar qué proveedor usar (por defecto: gmail para desarrollo)
    const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase() as EmailProvider
    this.emailProvider = provider

    // Configurar SOLO el proveedor especificado, sin intentar otros
    if (provider === 'resend') {
      this.configureResend()
      // Si Resend no se configuró, intentar SendGrid como fallback
      if (!this.resendConfigured && (process.env.SENDGRID_API_KEY || process.env.SMTP_USER)) {
        this.logger.warn('⚠️ Resend no se configuró, intentando SendGrid como fallback...')
        this.configureSendGrid()
        // Si SendGrid tampoco se configuró, intentar SMTP
        if (!this.sendgridConfigured && process.env.SMTP_USER) {
          this.logger.warn('⚠️ SendGrid no se configuró, intentando SMTP como fallback...')
          this.configureSMTP()
        }
      }
    } else if (provider === 'sendgrid') {
      this.configureSendGrid()
      // Si SendGrid no se configuró, intentar SMTP como fallback
      if (!this.sendgridConfigured && process.env.SMTP_USER) {
        this.logger.warn('⚠️ SendGrid no se configuró, intentando SMTP como fallback...')
        this.configureSMTP()
      }
    } else {
      // provider === 'gmail' o 'smtp' - usar SOLO SMTP
      this.configureSMTP()
      // NO intentar configurar SendGrid o Resend si el usuario eligió SMTP explícitamente
      if (!this.transporter) {
        this.logger.error('❌ SMTP no se pudo configurar')
        this.logger.error('   Verifica que tengas configurado:')
        this.logger.error('   - SMTP_HOST (opcional, por defecto: smtp.gmail.com)')
        this.logger.error('   - SMTP_PORT (opcional, por defecto: 587)')
        this.logger.error('   - SMTP_SECURE (opcional, por defecto: false)')
        this.logger.error('   - SMTP_USER (requerido)')
        this.logger.error('   - SMTP_PASSWORD (requerido)')
        this.logger.error('   Para Gmail, necesitas una App Password: https://myaccount.google.com/apppasswords')
      }
    }
  }

  /**
   * Configura Resend (recomendado para producción)
   */
  private configureResend() {
    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!apiKey) {
      this.logger.warn('⚠️ Resend no configurado (falta RESEND_API_KEY)')
      this.logger.warn('   Configura RESEND_API_KEY y RESEND_FROM_EMAIL en .env')
      this.logger.warn('   O cambia EMAIL_PROVIDER=sendgrid para usar SendGrid')
      this.logger.warn('   O cambia EMAIL_PROVIDER=gmail para usar Gmail SMTP')
      return
    }

    if (!fromEmail) {
      this.logger.warn('⚠️ Resend no configurado (falta RESEND_FROM_EMAIL)')
      this.logger.warn('   Configura RESEND_FROM_EMAIL en .env')
      this.logger.warn('   Ejemplo: RESEND_FROM_EMAIL=noreply@tudominio.com')
      return
    }

    try {
      this.resend = new Resend(apiKey)
      this.resendConfigured = true
      this.logger.log('✅ Servicio de email configurado (Resend)')
      this.logger.log(`📧 Provider: Resend`)
      this.logger.log(`👤 From: ${fromEmail}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error configurando Resend: ${errorMessage}`)
      this.logger.warn('   Fallback: Intentando configurar SendGrid...')
      this.configureSendGrid()
    }
  }

  /**
   * Configura SendGrid (alternativa para producción)
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

      // Validar que el password no esté vacío después de limpiar
      if (!cleanPassword || cleanPassword.length === 0) {
        this.logger.error('❌ SMTP_PASSWORD está vacío o solo contiene espacios')
        this.logger.error('   Verifica que SMTP_PASSWORD tenga un valor válido en Render')
        return
      }

      try {
        // Construir configuración SMTP explícitamente
        // No tipar explícitamente para evitar problemas con tipos de nodemailer
        const smtpConfig = {
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: {
            user: emailConfig.auth.user,
            pass: cleanPassword,
          },
          // Configuración de timeouts más robusta para evitar ETIMEDOUT
          connectionTimeout: 60000, // 60 segundos para establecer conexión (aumentado)
          greetingTimeout: 60000, // 60 segundos para recibir saludo del servidor (aumentado)
          socketTimeout: 60000, // 60 segundos para operaciones de socket (aumentado)
          // Opciones adicionales para mejorar la conexión
          pool: false, // Deshabilitar pool para evitar problemas de conexión persistente
          maxConnections: 1, // Una conexión a la vez
          maxMessages: 1, // Un mensaje por conexión
          rateDelta: 2000, // Intervalo para rate limiting (aumentado)
          rateLimit: 3, // Máximo de mensajes por rateDelta (reducido)
          // Opciones de TLS/SSL mejoradas
          tls: {
            rejectUnauthorized: false, // No rechazar certificados no autorizados
            minVersion: 'TLSv1.2', // Versión mínima de TLS
            ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA', // Ciphers seguros
          },
          // Opciones de socket mejoradas
          socket: {
            keepAlive: true,
            keepAliveDelay: 10000, // 10 segundos
          },
          // Debug (solo en desarrollo)
          debug: process.env.NODE_ENV === 'development',
          logger: process.env.NODE_ENV === 'development',
        }

        // Usar type assertion para evitar problemas de tipos con nodemailer
        this.transporter = nodemailer.createTransport(smtpConfig as unknown as nodemailer.TransportOptions)

        // Verificar que el transporter se creó correctamente
        if (this.transporter) {
          this.logger.log('✅ Servicio de email configurado (Gmail SMTP)')
          this.logger.log(`📧 SMTP: ${emailConfig.host}:${emailConfig.port}`)
          this.logger.log(`👤 Usuario: ${emailConfig.auth.user}`)
          this.logger.log(`🔐 Password: ${cleanPassword.length > 0 ? '***' + cleanPassword.slice(-4) : 'NO CONFIGURADO'}`)
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.error(`❌ Error creando transporter SMTP: ${errorMessage}`)
        this.transporter = null
      }
    } else {
      const missingFields: string[] = []
      if (!emailConfig.auth.user) missingFields.push('SMTP_USER')
      if (!emailConfig.auth.pass) missingFields.push('SMTP_PASSWORD')

      this.logger.warn(`⚠️ Servicio de email no configurado (faltan: ${missingFields.join(', ')})`)
      this.logger.warn('   Configura las siguientes variables en Render:')
      this.logger.warn('   - SMTP_HOST (opcional, por defecto: smtp.gmail.com)')
      this.logger.warn('   - SMTP_PORT (opcional, por defecto: 587)')
      this.logger.warn('   - SMTP_SECURE (opcional, por defecto: false)')
      this.logger.warn('   - SMTP_USER (requerido)')
      this.logger.warn('   - SMTP_PASSWORD (requerido)')
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
    data?: NotificationData
  ): Promise<boolean> {
    // Validar que el email de destino sea válido
    if (!to || !to.includes('@')) {
      this.logger.error(`❌ Email de destino inválido: ${to}`)
      return false
    }

    // Respetar el proveedor configurado en EMAIL_PROVIDER
    // Si el usuario eligió 'gmail' o 'smtp', usar SOLO SMTP
    if (this.emailProvider === 'gmail' || this.emailProvider === 'smtp') {
      if (!this.transporter) {
        this.logger.error('❌ SMTP no está configurado')
        this.logger.error('   Verifica que tengas configurado:')
        this.logger.error('   - SMTP_USER (requerido)')
        this.logger.error('   - SMTP_PASSWORD (requerido)')
        this.logger.error('   - SMTP_HOST (opcional, por defecto: smtp.gmail.com)')
        this.logger.error('   - SMTP_PORT (opcional, por defecto: 587)')
        this.logger.error('   - SMTP_SECURE (opcional, por defecto: false)')
        return false
      }
      return this.sendWithSMTP(to, title, body, data)
    }

    // Si el proveedor es 'resend', usar Resend
    if (this.emailProvider === 'resend' && this.resendConfigured) {
      return this.sendWithResend(to, title, body, data)
    }

    // Si el proveedor es 'sendgrid', usar SendGrid
    if (this.emailProvider === 'sendgrid' && this.sendgridConfigured) {
      return this.sendWithSendGrid(to, title, body, data)
    }

    // Fallback: intentar en orden de prioridad si el proveedor configurado no está disponible
    if (this.resendConfigured) {
      this.logger.warn('⚠️ Usando Resend como fallback (proveedor configurado no disponible)')
      return this.sendWithResend(to, title, body, data)
    }

    if (this.sendgridConfigured) {
      this.logger.warn('⚠️ Usando SendGrid como fallback (proveedor configurado no disponible)')
      return this.sendWithSendGrid(to, title, body, data)
    }

    if (this.transporter) {
      this.logger.warn('⚠️ Usando SMTP como fallback (proveedor configurado no disponible)')
      return this.sendWithSMTP(to, title, body, data)
    }

    // Si ningún proveedor está disponible
    this.logger.error('❌ No se puede enviar email: ningún servicio configurado')
    this.logger.error('   Verifica que tengas configurado uno de estos:')
    this.logger.error('   - Resend: RESEND_API_KEY y RESEND_FROM_EMAIL con EMAIL_PROVIDER=resend')
    this.logger.error('   - SendGrid: SENDGRID_API_KEY y SENDGRID_FROM_EMAIL con EMAIL_PROVIDER=sendgrid')
    this.logger.error('   - SMTP: SMTP_USER y SMTP_PASSWORD con EMAIL_PROVIDER=gmail')
    return false
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

      // Obtener email "from" - DEBE estar verificado en SendGrid
      const fromEmail = process.env.SENDGRID_FROM_EMAIL
      const fromName = process.env.SENDGRID_FROM_NAME || 'AMVA Digital'

      if (!fromEmail) {
        this.logger.error('❌ SENDGRID_FROM_EMAIL no configurado')
        this.logger.error('   Configura SENDGRID_FROM_EMAIL en las variables de entorno de Render')
        this.logger.error('   IMPORTANTE: El email DEBE estar verificado en SendGrid')
        this.logger.error('   → Ve a SendGrid → Settings → Sender Authentication')
        this.logger.error('   → Verifica el email antes de usarlo')
        // Intentar con SMTP si está disponible
        if (this.transporter) {
          this.logger.warn('⚠️ Intentando con SMTP como fallback...')
          return this.sendWithSMTP(to, title, body, data)
        }
        return false
      }

      // Validar que el email "from" no sea un Gmail personal (SendGrid requiere verificación)
      if (fromEmail.includes('@gmail.com') && !fromEmail.includes('@ministerio')) {
        this.logger.warn(`⚠️ Usando email Gmail personal: ${fromEmail}`)
        this.logger.warn('   Asegúrate de que este email esté verificado en SendGrid')
        this.logger.warn('   → Ve a SendGrid → Settings → Sender Authentication')
        this.logger.warn('   → Verifica el email antes de continuar')
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

      // Verificar que el status code sea 202 (Accepted) o 200 (OK)
      // SendGrid retorna 202 cuando acepta el email para envío
      if (response.statusCode === 202 || response.statusCode === 200) {
        this.logger.log(`✅ Email enviado exitosamente a ${to} (SendGrid)`)
        this.logger.log(`   Status Code: ${response.statusCode}`)
        this.logger.log(`   Message ID: ${response.headers['x-message-id'] || 'N/A'}`)
        return true
      } else {
        // Si el status code no es 202 o 200, el email no se aceptó
        this.logger.error(`❌ SendGrid rechazó el email para ${to}`)
        this.logger.error(`   Status Code: ${response.statusCode} (esperado: 202 o 200)`)
        this.logger.error(`   El email probablemente no se envió`)
        return false
      }
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

      // Detectar error específico de créditos agotados
      const hasCreditsError = errorMessage.includes('Maximum credits exceeded') ||
        errorMessage.includes('credits exceeded') ||
        (errorDetails && Array.isArray(errorDetails) &&
          errorDetails.some((err: unknown) => {
            const errObj = err as { message?: string }
            return errObj.message?.includes('Maximum credits exceeded') ||
              errObj.message?.includes('credits exceeded')
          }))

      // Mensajes específicos según el tipo de error
      if (hasCreditsError) {
        this.logger.error('   ⚠️ ERROR: SendGrid ha agotado sus créditos gratuitos')
        this.logger.error('   → El plan gratuito de SendGrid incluye 100 emails por día')
        this.logger.error('   → Has alcanzado el límite de créditos')
        this.logger.error('   Soluciones:')
        this.logger.error('   1. Esperar hasta mañana (el límite se reinicia diariamente)')
        this.logger.error('   2. Actualizar el plan de SendGrid para obtener más créditos')
        this.logger.error('      → Ve a SendGrid → Settings → Billing')
        this.logger.error('      → Actualiza a un plan de pago')
        this.logger.error('   3. El sistema intentará usar Gmail SMTP como fallback automático')
        this.logger.warn('   🔄 Cambiando automáticamente a Gmail SMTP como fallback...')
      } else if (errorMessage === 'Forbidden' || statusCode === 403) {
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
      } else if (statusCode === 401 || errorMessage === 'Unauthorized') {
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

      // Si SendGrid falla (por cualquier razón), intentar con SMTP como fallback
      if (this.transporter) {
        if (hasCreditsError) {
          this.logger.warn('⚠️ SendGrid sin créditos, usando Gmail SMTP como fallback automático...')
        } else {
          this.logger.warn('⚠️ SendGrid falló, intentando con SMTP como fallback...')
        }
        return this.sendWithSMTP(to, title, body, data)
      } else if (hasCreditsError) {
        this.logger.error('   ❌ No hay fallback disponible (SMTP no configurado)')
        this.logger.error('   → Configura SMTP_USER y SMTP_PASSWORD en Render para usar Gmail SMTP como fallback')
      }

      return false
    }
  }

  /**
   * Envía email usando Resend (recomendado)
   */
  private async sendWithResend(
    to: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    if (!this.resend) {
      this.logger.error('❌ Resend no está inicializado')
      return false
    }

    // Obtener email "from" - DEBE estar verificado en Resend (fuera del try para usar en catch)
    const fromEmail = process.env.RESEND_FROM_EMAIL
    const fromName = process.env.RESEND_FROM_NAME || 'AMVA Digital'

    try {
      this.logger.log(`📧 Preparando email con Resend para ${to}...`)

      // Si el body ya es HTML completo, usarlo directamente
      const htmlContent = body.trim().startsWith('<!DOCTYPE')
        ? body
        : this.buildEmailTemplate(title, body, data)

      // Extraer texto plano del HTML
      const textContent = body.replace(/<[^>]*>/g, '').trim() || title

      if (!fromEmail) {
        this.logger.error('❌ RESEND_FROM_EMAIL no configurado')
        this.logger.error('   Configura RESEND_FROM_EMAIL en las variables de entorno de Render')
        this.logger.error('   IMPORTANTE: El email DEBE estar verificado en Resend')
        this.logger.error('   → Ve a Resend → Domains → Verifica tu dominio o email')
        // Intentar con SendGrid si está disponible
        if (this.sendgridConfigured) {
          this.logger.warn('⚠️ Intentando con SendGrid como fallback...')
          return this.sendWithSendGrid(to, title, body, data)
        }
        // Intentar con SMTP si está disponible
        if (this.transporter) {
          this.logger.warn('⚠️ Intentando con SMTP como fallback...')
          return this.sendWithSMTP(to, title, body, data)
        }
        return false
      }

      // Construir el email "from" con nombre y email
      const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

      this.logger.log(`📧 Enviando email a ${to} desde ${fromEmail} (Resend)...`)

      // Agregar timeout de 30 segundos para Resend
      const sendPromise = this.resend.emails.send({
        from,
        to,
        subject: title,
        html: htmlContent,
        text: textContent,
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Resend tardó más de 30 segundos')), 30000)
      })

      const result = await Promise.race([sendPromise, timeoutPromise])

      // Resend retorna { data: { id: string } } en caso de éxito
      // O { error: { ... } } en caso de error
      if (result && typeof result === 'object' && 'data' in result && result.data && 'id' in result.data) {
        this.logger.log(`✅ Email enviado exitosamente a ${to} (Resend)`)
        this.logger.log(`   Message ID: ${(result.data as { id: string }).id}`)
        return true
      } else if (result && typeof result === 'object' && 'error' in result) {
        // Resend retornó un error estructurado
        const errorData = result.error as { statusCode?: number; message?: string; name?: string }
        const errorMessage = errorData?.message || 'Error desconocido'
        const statusCode = errorData?.statusCode

        this.logger.error(`❌ Resend rechazó el email para ${to}`)
        this.logger.error(`   Status Code: ${statusCode || 'N/A'}`)
        this.logger.error(`   Error: ${errorMessage}`)

        // Lanzar error para que el catch lo maneje
        throw new Error(`Resend Error ${statusCode}: ${errorMessage}`)
      } else {
        this.logger.error(`❌ Resend rechazó el email para ${to}`)
        this.logger.error(`   Respuesta inesperada: ${JSON.stringify(result)}`)
        return false
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined

      this.logger.error(`❌ Error enviando email con Resend a ${to}:`, {
        message: errorMessage,
        stack: errorStack,
      })

      // Mensajes específicos según el tipo de error
      if (errorMessage.includes('domain is not verified') || errorMessage.includes('gmail.com') || errorMessage.includes('domain')) {
        this.logger.error('   ⚠️ Error: Dominio no verificado en Resend')
        this.logger.error('   Resend NO permite usar emails de Gmail directamente')
        this.logger.error('   Soluciones:')
        this.logger.error('   1. Verifica un dominio propio en Resend:')
        this.logger.error('      → Ve a Resend → Domains → Add Domain')
        this.logger.error('      → Configura los registros DNS que te da Resend')
        this.logger.error('      → Usa un email de ese dominio (ej: noreply@tudominio.com)')
        this.logger.error('   2. O verifica un email individual en Resend:')
        this.logger.error('      → Ve a Resend → Emails → Add Email')
        this.logger.error('      → Verifica el email que quieres usar')
        this.logger.error('   3. O cambia a SendGrid o SMTP:')
        this.logger.error('      → Cambia EMAIL_PROVIDER=sendgrid o EMAIL_PROVIDER=gmail en Render')
        this.logger.error(`   Email actual configurado: ${fromEmail || 'NO CONFIGURADO'}`)

        // Si el error es por dominio Gmail no verificado, intentar fallback inmediatamente
        this.logger.warn('   🔄 Intentando fallback automático a SendGrid o SMTP...')
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
        this.logger.error('   ⚠️ Error 403 Forbidden de Resend')
        this.logger.error('   Posibles causas:')
        this.logger.error('   1. El email "from" no está verificado en Resend')
        this.logger.error('      → Ve a Resend → Domains → Verifica tu dominio')
        this.logger.error('      → O Resend → Emails → Verifica un email individual')
        this.logger.error('      → Email configurado: ' + (fromEmail || 'NO CONFIGURADO'))
        this.logger.error('   2. La API Key no tiene permisos')
        this.logger.error('      → Ve a Resend → API Keys')
        this.logger.error('      → Verifica que la API Key tenga permisos correctos')
        this.logger.error('   3. La API Key es incorrecta o fue revocada')
        this.logger.error('      → Verifica RESEND_API_KEY en Render')
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        this.logger.error('   ⚠️ Error 401 Unauthorized de Resend')
        this.logger.error('   → La API Key es inválida o fue revocada')
        this.logger.error('   → Verifica RESEND_API_KEY en Render')
      } else if (errorMessage.includes('Timeout')) {
        this.logger.error('   ⚠️ Timeout de conexión con Resend')
        this.logger.error('   → Verifica tu conexión a internet o el estado de Resend')
      }

      // Fallback a SendGrid si está disponible
      if (this.sendgridConfigured) {
        this.logger.warn('⚠️ Resend falló, intentando con SendGrid como fallback...')
        return this.sendWithSendGrid(to, title, body, data)
      }

      // Fallback a SMTP si está disponible
      if (this.transporter) {
        this.logger.warn('⚠️ Resend falló, intentando con SMTP como fallback...')
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

      // Agregar timeout adicional para la operación completa (aumentado a 90 segundos)
      // También agregar reintentos para manejar timeouts temporales
      let lastError: unknown = null
      const maxRetries = 3
      const retryDelay = 2000 // 2 segundos entre reintentos

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            this.logger.log(`🔄 Reintento ${attempt}/${maxRetries} para ${to}...`)
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt - 1)))
          }

          const sendPromise = this.transporter!.sendMail(mailOptions)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: El envío de email tardó más de 90 segundos')), 90000)
          })

          const info = await Promise.race([sendPromise, timeoutPromise])

          // Si llegamos aquí, el email se envió exitosamente
          this.logger.log(`✅ Email enviado exitosamente a ${to} (SMTP)`)
          this.logger.log(`   Message ID: ${info.messageId}`)
          this.logger.log(`   Response: ${info.response || 'N/A'}`)
          return true
        } catch (error: unknown) {
          lastError = error
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          const errorCode = this.getErrorCode(error)

          // Si es un timeout y no es el último intento, reintentar
          if ((errorCode === 'ETIMEDOUT' || errorMessage.includes('Timeout')) && attempt < maxRetries) {
            this.logger.warn(`⚠️ Timeout en intento ${attempt}/${maxRetries} para ${to}, reintentando...`)
            continue
          }

          // Si no es timeout o es el último intento, lanzar el error
          throw error
        }
      }

      // Si llegamos aquí, todos los reintentos fallaron
      throw lastError || new Error('Error desconocido después de múltiples reintentos')
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
        this.logger.error('   ⚠️ Timeout de conexión SMTP (después de múltiples reintentos)')
        this.logger.error('   Posibles causas:')
        this.logger.error('   - Gmail bloqueando conexiones desde Render (común en servicios cloud)')
        this.logger.error('   - Firewall de Render bloqueando conexión a Gmail SMTP')
        this.logger.error('   - Problemas de red temporales')
        this.logger.error('   - Gmail requiere conexiones desde IPs conocidas')
        this.logger.error('   Soluciones:')
        this.logger.error('   1. Usar un servicio SMTP relay más confiable para producción:')
        this.logger.error('      - SendGrid (plan de pago): $15/mes para 40,000 emails')
        this.logger.error('      - Mailgun: $35/mes para 50,000 emails')
        this.logger.error('      - Postmark: $15/mes para 10,000 emails')
        this.logger.error('   2. O configurar un servidor SMTP propio')
        this.logger.error('   3. O usar Resend si tienes dominio propio (gratis hasta 3,000/mes)')
        this.logger.error('   💡 Gmail SMTP no es ideal para producción en servicios cloud como Render')
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
              ${body.trim().startsWith('<div') || body.trim().startsWith('<!DOCTYPE')
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
