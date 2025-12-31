import { Logger } from '@nestjs/common'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function verificarEmailResend() {
  const logger = new Logger('VerificarEmailResend')
  
  logger.log('🔍 Verificando estado del email en Resend...')
  logger.log('')
  
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'jerlibgnzlz@gmail.com'
  
  if (!resendApiKey) {
    logger.error('❌ RESEND_API_KEY no está configurado')
    logger.error('   Configura RESEND_API_KEY en backend/.env o en Render')
    process.exit(1)
  }
  
  logger.log('📋 Configuración:')
  logger.log(`   RESEND_API_KEY: ${resendApiKey.substring(0, 10)}...${resendApiKey.substring(resendApiKey.length - 4)}`)
  logger.log(`   RESEND_FROM_EMAIL: ${resendFromEmail}`)
  logger.log('')
  
  try {
    const resend = new Resend(resendApiKey)
    
    logger.log('📧 Intentando enviar email de prueba...')
    logger.log(`   From: ${resendFromEmail}`)
    logger.log(`   To: ${resendFromEmail}`)
    logger.log('')
    
    const result = await resend.emails.send({
      from: resendFromEmail,
      to: resendFromEmail,
      subject: 'Test - Verificación de Email Resend',
      html: '<p>Este es un email de prueba para verificar que tu email está verificado en Resend.</p>',
      text: 'Este es un email de prueba para verificar que tu email está verificado en Resend.',
    })
    
    if (result && typeof result === 'object' && 'data' in result && result.data && 'id' in result.data) {
      logger.log('✅ ========================================')
      logger.log('✅ EMAIL VERIFICADO Y FUNCIONANDO')
      logger.log('✅ ========================================')
      logger.log('')
      logger.log(`✅ Email enviado exitosamente!`)
      logger.log(`   Message ID: ${(result.data as { id: string }).id}`)
      logger.log(`   From: ${resendFromEmail}`)
      logger.log(`   To: ${resendFromEmail}`)
      logger.log('')
      logger.log('✅ Tu email está verificado en Resend y funcionando correctamente.')
      logger.log('✅ Puedes usar el botón de recordatorios sin problemas.')
      logger.log('')
      process.exit(0)
    } else if (result && typeof result === 'object' && 'error' in result) {
      const errorData = result.error as { statusCode?: number; message?: string; name?: string }
      const errorMessage = errorData?.message || 'Error desconocido'
      const statusCode = errorData?.statusCode
      
      logger.error('❌ ========================================')
      logger.error('❌ ERROR AL ENVIAR EMAIL')
      logger.error('❌ ========================================')
      logger.error('')
      logger.error(`❌ Status Code: ${statusCode || 'N/A'}`)
      logger.error(`❌ Error: ${errorMessage}`)
      logger.error('')
      
      if (errorMessage.includes('domain is not verified') || errorMessage.includes('gmail.com') || errorMessage.includes('domain')) {
        logger.error('⚠️ PROBLEMA: El email NO está verificado en Resend')
        logger.error('')
        logger.error('📝 SOLUCIÓN: Verifica tu email en Resend Dashboard')
        logger.error('')
        logger.error('Pasos para verificar:')
        logger.error('   1. Ve a https://resend.com')
        logger.error('   2. Inicia sesión')
        logger.error('   3. Ve a "Domains" en el menú lateral')
        logger.error('   4. Busca un botón o enlace que diga "Verify Email" o "Add Email"')
        logger.error('   5. Ingresa: jerlibgnzlz@gmail.com')
        logger.error('   6. Revisa tu Gmail y verifica el email')
        logger.error('')
        logger.error('O intenta:')
        logger.error('   - Settings → Sender Authentication → Add Email')
        logger.error('   - O busca "Verify Email" en cualquier sección')
        logger.error('')
      } else if (statusCode === 403 || errorMessage.includes('Forbidden')) {
        logger.error('⚠️ Error 403: El email no está verificado o no tienes permisos')
        logger.error('   Verifica tu email en Resend Dashboard')
        logger.error('')
      } else if (statusCode === 401 || errorMessage.includes('Unauthorized')) {
        logger.error('⚠️ Error 401: La API Key es inválida')
        logger.error('   Verifica RESEND_API_KEY en Render')
        logger.error('')
      }
      
      process.exit(1)
    } else {
      logger.error('❌ Respuesta inesperada de Resend:', JSON.stringify(result))
      process.exit(1)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error('❌ ========================================')
    logger.error('❌ ERROR AL VERIFICAR EMAIL')
    logger.error('❌ ========================================')
    logger.error('')
    logger.error(`❌ Error: ${errorMessage}`)
    if (errorStack) {
      logger.error(`❌ Stack: ${errorStack}`)
    }
    logger.error('')
    
    if (errorMessage.includes('domain is not verified') || errorMessage.includes('gmail.com')) {
      logger.error('⚠️ El email NO está verificado en Resend')
      logger.error('   Ve a Resend Dashboard → Domains → Verify Email')
      logger.error('')
    }
    
    process.exit(1)
  }
}

verificarEmailResend()

