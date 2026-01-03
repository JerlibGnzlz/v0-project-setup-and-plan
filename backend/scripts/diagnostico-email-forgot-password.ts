/**
 * Script de diagnóstico para verificar el envío de emails de recuperación de contraseña
 * 
 * Uso:
 *   npx ts-node backend/scripts/diagnostico-email-forgot-password.ts <email>
 * 
 * Ejemplo:
 *   npx ts-node backend/scripts/diagnostico-email-forgot-password.ts jerlibgnzlz@gmail.com
 */

import { PrismaClient } from '@prisma/client'
import { EmailService } from '../src/modules/notifications/email.service'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Error: Debes proporcionar un email como argumento')
    console.error('   Uso: npx ts-node backend/scripts/diagnostico-email-forgot-password.ts <email>')
    process.exit(1)
  }

  console.log('🔍 DIAGNÓSTICO DE EMAIL - FORGOT PASSWORD')
  console.log('=' .repeat(60))
  console.log(`📧 Email a verificar: ${email}`)
  console.log('')

  // 1. Verificar que el usuario existe
  console.log('1️⃣ Verificando usuario en la base de datos...')
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error(`❌ Usuario con email ${email} NO encontrado en la base de datos`)
    console.error('   Verifica que el email sea correcto')
    await prisma.$disconnect()
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${user.nombre} (${user.email})`)
  console.log('')

  // 2. Verificar configuración de variables de entorno
  console.log('2️⃣ Verificando configuración de variables de entorno...')
  const emailProvider = process.env.EMAIL_PROVIDER || 'auto'
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  console.log(`   EMAIL_PROVIDER: ${emailProvider}`)
  console.log(`   SENDGRID_API_KEY: ${sendgridApiKey ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`   SENDGRID_FROM_EMAIL: ${sendgridFromEmail || '❌ No configurado'}`)
  console.log(`   RESEND_API_KEY: ${resendApiKey ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`   RESEND_FROM_EMAIL: ${resendFromEmail || '❌ No configurado'}`)
  console.log(`   SMTP_USER: ${smtpUser || '❌ No configurado'}`)
  console.log(`   SMTP_PASSWORD: ${smtpPassword ? '✅ Configurado' : '❌ No configurado'}`)
  console.log(`   FRONTEND_URL: ${frontendUrl}`)
  console.log('')

  // 3. Inicializar EmailService
  console.log('3️⃣ Inicializando EmailService...')
  const emailService = new EmailService()
  console.log('✅ EmailService inicializado')
  console.log('')

  // 4. Construir email de prueba (simulando forgotPassword)
  console.log('4️⃣ Construyendo email de prueba...')
  const token = 'test-token-' + Date.now()
  const resetUrl = `${frontendUrl}/admin/reset-password?token=${token}`

  const emailBody = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #0a1628; margin-bottom: 20px;">Recuperación de Contraseña</h2>
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
        Hola <strong>${user.nombre}</strong>,
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
        Recibimos una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este email.
      </p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Restablecer Contraseña
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
        Este link expirará en 1 hora. Si no funciona, copia y pega este enlace en tu navegador:
      </p>
      <p style="color: #9ca3af; font-size: 11px; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
  `

  console.log(`✅ Email construido (${emailBody.length} caracteres)`)
  console.log(`   URL de reset: ${resetUrl}`)
  console.log('')

  // 5. Intentar enviar email
  console.log('5️⃣ Intentando enviar email...')
  console.log('   (Esto puede tardar unos segundos...)')
  console.log('')

  try {
    const emailSent = await emailService.sendNotificationEmail(
      email,
      'Recuperación de Contraseña - AMVA Digital (PRUEBA)',
      emailBody,
      { type: 'password_reset', userId: user.id }
    )

    if (emailSent) {
      console.log('✅ EMAIL ENVIADO EXITOSAMENTE')
      console.log('')
      console.log('📋 PRÓXIMOS PASOS:')
      console.log('   1. Revisa tu bandeja de entrada de Gmail')
      console.log('   2. Si no lo ves, revisa la carpeta de SPAM')
      console.log('   3. Si aún no lo ves, espera unos minutos (puede tardar)')
      console.log('   4. Verifica que el email "from" esté verificado en SendGrid/Resend')
      console.log('')
      console.log('💡 CONSEJOS:')
      console.log('   - Si está en SPAM, marca como "No es spam"')
      console.log('   - Si usas SendGrid, verifica el email en SendGrid Dashboard')
      console.log('   - Si usas Resend, verifica el email en Resend Dashboard')
      console.log('   - Si usas Gmail SMTP, puede estar bloqueado desde servicios cloud')
    } else {
      console.error('❌ NO SE PUDO ENVIAR EL EMAIL')
      console.error('')
      console.error('🔍 POSIBLES CAUSAS:')
      console.error('   1. Proveedor de email no configurado correctamente')
      console.error('   2. API Key inválida o revocada')
      console.error('   3. Email "from" no verificado en SendGrid/Resend')
      console.error('   4. Gmail SMTP bloqueado desde servicios cloud (común)')
      console.error('')
      console.error('💡 SOLUCIONES:')
      console.error('   1. Verifica las variables de entorno en Render/Vercel')
      console.error('   2. Verifica que el email "from" esté verificado')
      console.error('   3. Usa SendGrid o Resend en lugar de Gmail SMTP')
      console.error('   4. Revisa los logs del servidor para más detalles')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ ERROR AL ENVIAR EMAIL:')
    console.error(`   ${errorMessage}`)
    if (error instanceof Error && error.stack) {
      console.error('')
      console.error('Stack trace:')
      console.error(error.stack)
    }
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('✅ Diagnóstico completado')

  await prisma.$disconnect()
}

main()
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error fatal:', errorMessage)
    process.exit(1)
  })

