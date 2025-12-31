import { Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function diagnosticoEmail() {
  const logger = new Logger('DiagnosticoEmail')
  
  logger.log('🔍 ========================================')
  logger.log('🔍 DIAGNÓSTICO DE CONFIGURACIÓN DE EMAIL')
  logger.log('🔍 ========================================')
  logger.log('')
  
  // Verificar variables de entorno
  const emailProvider = process.env.EMAIL_PROVIDER || 'auto'
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = process.env.SMTP_PORT || '587'
  
  logger.log('📋 Variables de Entorno Detectadas:')
  logger.log(`   EMAIL_PROVIDER: ${emailProvider}`)
  logger.log('')
  
  logger.log('📧 SendGrid:')
  logger.log(`   SENDGRID_API_KEY: ${sendgridApiKey ? '✅ Configurado' : '❌ NO configurado'}`)
  logger.log(`   SENDGRID_FROM_EMAIL: ${sendgridFromEmail ? '✅ Configurado' : '❌ NO configurado'}`)
  if (sendgridApiKey && sendgridFromEmail) {
    logger.log('   ✅ SendGrid está completamente configurado')
  } else if (sendgridApiKey || sendgridFromEmail) {
    logger.log('   ⚠️ SendGrid está parcialmente configurado')
    if (!sendgridApiKey) logger.log('      ❌ Falta: SENDGRID_API_KEY')
    if (!sendgridFromEmail) logger.log('      ❌ Falta: SENDGRID_FROM_EMAIL')
  } else {
    logger.log('   ❌ SendGrid NO está configurado')
  }
  logger.log('')
  
  logger.log('📧 Resend:')
  logger.log(`   RESEND_API_KEY: ${resendApiKey ? '✅ Configurado' : '❌ NO configurado'}`)
  logger.log(`   RESEND_FROM_EMAIL: ${resendFromEmail ? '✅ Configurado' : '❌ NO configurado'}`)
  if (resendApiKey && resendFromEmail) {
    logger.log('   ✅ Resend está completamente configurado')
  } else if (resendApiKey || resendFromEmail) {
    logger.log('   ⚠️ Resend está parcialmente configurado')
    if (!resendApiKey) logger.log('      ❌ Falta: RESEND_API_KEY')
    if (!resendFromEmail) logger.log('      ❌ Falta: RESEND_FROM_EMAIL')
  } else {
    logger.log('   ❌ Resend NO está configurado')
  }
  logger.log('')
  
  logger.log('📧 Gmail SMTP:')
  logger.log(`   SMTP_USER: ${smtpUser ? '✅ Configurado' : '❌ NO configurado'}`)
  logger.log(`   SMTP_PASSWORD: ${smtpPassword ? '✅ Configurado' : '❌ NO configurado'}`)
  logger.log(`   SMTP_HOST: ${smtpHost}`)
  logger.log(`   SMTP_PORT: ${smtpPort}`)
  if (smtpUser && smtpPassword) {
    logger.log('   ✅ Gmail SMTP está completamente configurado')
  } else if (smtpUser || smtpPassword) {
    logger.log('   ⚠️ Gmail SMTP está parcialmente configurado')
    if (!smtpUser) logger.log('      ❌ Falta: SMTP_USER')
    if (!smtpPassword) logger.log('      ❌ Falta: SMTP_PASSWORD')
  } else {
    logger.log('   ❌ Gmail SMTP NO está configurado')
  }
  logger.log('')
  
  // Determinar qué proveedor se usará
  logger.log('🎯 Proveedor que se Usará:')
  let proveedorActivo = 'NINGUNO'
  let problemas: string[] = []
  
  if (emailProvider === 'sendgrid' || emailProvider === 'auto') {
    if (sendgridApiKey && sendgridFromEmail) {
      proveedorActivo = 'SendGrid'
      logger.log('   ✅ SendGrid será usado')
    } else if (emailProvider === 'sendgrid') {
      problemas.push('EMAIL_PROVIDER=sendgrid pero SendGrid no está completamente configurado')
    }
  }
  
  if (proveedorActivo === 'NINGUNO' && (emailProvider === 'resend' || emailProvider === 'auto')) {
    if (resendApiKey && resendFromEmail) {
      proveedorActivo = 'Resend'
      logger.log('   ✅ Resend será usado')
    } else if (emailProvider === 'resend') {
      problemas.push('EMAIL_PROVIDER=resend pero Resend no está completamente configurado')
    }
  }
  
  if (proveedorActivo === 'NINGUNO' && (emailProvider === 'gmail' || emailProvider === 'smtp' || emailProvider === 'auto')) {
    if (smtpUser && smtpPassword) {
      proveedorActivo = 'Gmail SMTP'
      logger.log('   ⚠️ Gmail SMTP será usado (puede tener problemas desde Render)')
      logger.log('   💡 RECOMENDACIÓN: Configura SendGrid o Resend para producción')
    } else if (emailProvider === 'gmail' || emailProvider === 'smtp') {
      problemas.push('EMAIL_PROVIDER=gmail/smtp pero SMTP no está completamente configurado')
    }
  }
  
  if (proveedorActivo === 'NINGUNO') {
    logger.log('   ❌ NINGÚN proveedor está completamente configurado')
    logger.log('')
    logger.log('❌ ========================================')
    logger.log('❌ PROBLEMA: NO SE PUEDEN ENVIAR EMAILS')
    logger.log('❌ ========================================')
    logger.log('')
    logger.log('📝 SOLUCIÓN: Configura al menos UN proveedor completo')
    logger.log('')
    logger.log('Opción 1: Configurar Resend (Recomendado)')
    logger.log('   1. Ve a https://resend.com')
    logger.log('   2. Crea cuenta e inicia sesión')
    logger.log('   3. Ve a API Keys → Create API Key')
    logger.log('   4. Copia la API Key')
    logger.log('   5. Verifica tu email en Resend → Emails → Add Email')
    logger.log('   6. Configura en Render (Environment Variables):')
    logger.log('      EMAIL_PROVIDER=resend')
    logger.log('      RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    logger.log('      RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com')
    logger.log('      RESEND_FROM_NAME=AMVA Digital')
    logger.log('')
    logger.log('Opción 2: Configurar SendGrid')
    logger.log('   1. Ve a https://sendgrid.com')
    logger.log('   2. Crea cuenta e inicia sesión')
    logger.log('   3. Ve a Settings → Sender Authentication → Verify Single Sender')
    logger.log('   4. Verifica tu email')
    logger.log('   5. Ve a Settings → API Keys → Create API Key')
    logger.log('   6. Configura en Render:')
    logger.log('      EMAIL_PROVIDER=sendgrid')
    logger.log('      SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    logger.log('      SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com')
    logger.log('')
    logger.log('Opción 3: Completar Gmail SMTP (NO recomendado para producción)')
    logger.log('   1. Ve a https://myaccount.google.com/apppasswords')
    logger.log('   2. Genera una App Password para Gmail')
    logger.log('   3. Configura en Render:')
    logger.log('      EMAIL_PROVIDER=gmail')
    logger.log('      SMTP_USER=jerlibgnzlz@gmail.com')
    logger.log('      SMTP_PASSWORD=tu_app_password_de_16_caracteres')
    logger.log('      SMTP_HOST=smtp.gmail.com')
    logger.log('      SMTP_PORT=587')
    logger.log('')
    logger.log('   ⚠️ ADVERTENCIA: Gmail SMTP puede fallar desde Render')
    logger.log('   💡 RECOMENDACIÓN: Usa SendGrid o Resend en producción')
  } else {
    logger.log('')
    logger.log('✅ ========================================')
    logger.log('✅ CONFIGURACIÓN CORRECTA')
    logger.log('✅ ========================================')
    logger.log('')
    logger.log(`✅ Proveedor activo: ${proveedorActivo}`)
    logger.log('')
    
    if (proveedorActivo === 'Gmail SMTP') {
      logger.log('⚠️ ADVERTENCIA: Estás usando Gmail SMTP')
      logger.log('   Gmail SMTP puede tener problemas desde servicios cloud (Render)')
      logger.log('   💡 RECOMENDACIÓN: Configura SendGrid o Resend para producción')
      logger.log('')
    }
    
    if (proveedorActivo === 'Resend') {
      logger.log('💡 IMPORTANTE: Verifica que tu email esté verificado en Resend')
      logger.log('   1. Ve a https://resend.com')
      logger.log('   2. Ve a Emails o Domains')
      logger.log('   3. Verifica que jerlibgnzlz@gmail.com esté verificado')
      logger.log('   4. Si no está verificado, haz clic en "Add Email" y verifica')
      logger.log('')
    }
    
    if (proveedorActivo === 'SendGrid') {
      logger.log('💡 IMPORTANTE: Verifica que tu email esté verificado en SendGrid')
      logger.log('   1. Ve a https://sendgrid.com')
      logger.log('   2. Ve a Settings → Sender Authentication')
      logger.log('   3. Verifica que jerlibgnzlz@gmail.com esté verificado')
      logger.log('')
    }
  }
  
  if (problemas.length > 0) {
    logger.log('')
    logger.log('⚠️ PROBLEMAS DETECTADOS:')
    problemas.forEach((problema, index) => {
      logger.log(`   ${index + 1}. ${problema}`)
    })
    logger.log('')
  }
  
  logger.log('📖 Guías disponibles:')
  logger.log('   - docs/CONFIGURAR_RESEND_PRODUCCION.md')
  logger.log('   - docs/CONFIGURAR_SENDGRID_RAPIDO.md')
  logger.log('   - docs/CONFIGURAR_RECORDATORIOS_NODEMAILER.md')
  logger.log('')
}

diagnosticoEmail()

