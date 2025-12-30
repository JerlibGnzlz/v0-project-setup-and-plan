/**
 * Script de prueba para verificar el envío de recordatorios de pagos pendientes
 * 
 * Uso:
 *   ts-node scripts/test-recordatorios-pagos.ts
 * 
 * O con npm:
 *   npm run test:recordatorios
 */

import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { InscripcionesService } from '../src/modules/inscripciones/inscripciones.service'
import { Logger } from '@nestjs/common'

async function testRecordatorios() {
  const logger = new Logger('TestRecordatorios')
  
  logger.log('🧪 ========================================')
  logger.log('🧪 TEST DE RECORDATORIOS DE PAGOS PENDIENTES')
  logger.log('🧪 ========================================')
  
  // Verificar variables de entorno
  logger.log('📋 Verificando configuración...')
  logger.log(`   EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'gmail (default)'}`)
  logger.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ Configurado' : '❌ NO CONFIGURADO'}`)
  logger.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ Configurado' : '❌ NO CONFIGURADO'}`)
  logger.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com (default)'}`)
  logger.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587 (default)'}`)
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    logger.error('❌ ERROR: SMTP_USER y SMTP_PASSWORD son requeridos')
    logger.error('   Configura estas variables de entorno antes de ejecutar el test')
    process.exit(1)
  }
  
  try {
    logger.log('🚀 Inicializando aplicación NestJS...')
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    })
    
    logger.log('✅ Aplicación inicializada')
    
    const inscripcionesService = app.get(InscripcionesService)
    
    logger.log('📧 Iniciando envío de recordatorios...')
    logger.log('   (Esto puede tardar varios segundos dependiendo de la cantidad de inscripciones)')
    
    const resultado = await inscripcionesService.enviarRecordatoriosPago()
    
    logger.log('📊 ========================================')
    logger.log('📊 RESULTADOS DEL TEST')
    logger.log('📊 ========================================')
    logger.log(`   ✅ Emails enviados: ${resultado.enviados}`)
    logger.log(`   ❌ Emails fallidos: ${resultado.fallidos}`)
    logger.log(`   📋 Total procesados: ${resultado.detalles.length}`)
    
    if (resultado.detalles.length > 0) {
      logger.log('📋 Detalles por email:')
      resultado.detalles.forEach((detalle, index) => {
        const icon = detalle.exito ? '✅' : '❌'
        logger.log(`   ${index + 1}. ${icon} ${detalle.email} - ${detalle.nombre} (${detalle.cuotasPendientes} cuotas)`)
      })
    }
    
    if (resultado.fallidos > 0) {
      logger.warn('⚠️ Algunos emails fallaron. Revisa los logs anteriores para más detalles.')
      logger.warn('   Verifica:')
      logger.warn('   - Que EMAIL_PROVIDER=gmail o EMAIL_PROVIDER=smtp')
      logger.warn('   - Que SMTP_USER y SMTP_PASSWORD sean correctos')
      logger.warn('   - Que SMTP_PASSWORD sea una App Password de Gmail (no tu contraseña normal)')
    } else if (resultado.enviados > 0) {
      logger.log('✅ Todos los emails se enviaron exitosamente!')
    } else {
      logger.warn('⚠️ No se encontraron inscripciones con pagos pendientes')
    }
    
    await app.close()
    logger.log('✅ Test completado')
    
    process.exit(resultado.fallidos > 0 ? 1 : 0)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error('❌ ERROR en el test:', {
      message: errorMessage,
      stack: errorStack,
    })
    
    logger.error('   Verifica:')
    logger.error('   - Que la base de datos esté conectada')
    logger.error('   - Que las variables de entorno estén configuradas')
    logger.error('   - Que el EmailService esté correctamente configurado')
    
    process.exit(1)
  }
}

// Ejecutar el test
testRecordatorios().catch((error: unknown) => {
  const logger = new Logger('TestRecordatorios')
  logger.error('❌ Error fatal:', error)
  process.exit(1)
})

