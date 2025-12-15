/**
 * Script para verificar el estado de envío de emails
 * 
 * Uso:
 *   npm run verificar:email-enviado <email_destino>
 *   O directamente: ts-node scripts/verificar-email-enviado.ts <email_destino>
 * 
 * Este script:
 * 1. Verifica si hay inscripciones con ese email
 * 2. Muestra información sobre los últimos intentos de envío (si están en logs)
 * 3. Proporciona instrucciones para verificar manualmente
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emailDestino = process.argv[2]

  if (!emailDestino) {
    console.log('❌ Error: Debes proporcionar un email de destino')
    console.log('\nUso:')
    console.log('  npm run verificar:email-enviado <email_destino>')
    console.log('  Ejemplo: npm run verificar:email-enviado mariacarrillocastro81@gmail.com')
    process.exit(1)
  }

  console.log('🔍 Verificando estado de email para:', emailDestino)
  console.log('='.repeat(60) + '\n')

  try {
    // 1. Buscar inscripciones con ese email
    console.log('📋 Buscando inscripciones con ese email...')
    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        email: emailDestino,
      },
      include: {
        convencion: true,
        pagos: {
          orderBy: {
            numeroCuota: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (inscripciones.length === 0) {
      console.log(`❌ No se encontraron inscripciones con el email: ${emailDestino}`)
      console.log('\n💡 Verifica que el email esté correcto')
      process.exit(1)
    }

    console.log(`✅ Se encontraron ${inscripciones.length} inscripción(es)\n`)

    // 2. Mostrar información de cada inscripción
    inscripciones.forEach((inscripcion, index) => {
      console.log(`📧 Inscripción ${index + 1}:`)
      console.log(`   Nombre: ${inscripcion.nombre} ${inscripcion.apellido || ''}`)
      console.log(`   Email: ${inscripcion.email}`)
      console.log(`   Convención: ${inscripcion.convencion?.titulo || 'N/A'}`)
      console.log(`   Estado: ${inscripcion.estado}`)
      console.log(`   Fecha de inscripción: ${inscripcion.createdAt.toLocaleString('es-AR')}`)
      
      const pagosPendientes = inscripcion.pagos.filter((p) => p.estado === 'PENDIENTE')
      const pagosCompletados = inscripcion.pagos.filter((p) => p.estado === 'COMPLETADO')
      const montoPendiente = pagosPendientes.reduce((sum, pago) => sum + Number(pago.monto), 0)
      
      console.log(`   Pagos: ${pagosCompletados.length} completados, ${pagosPendientes.length} pendientes`)
      if (pagosPendientes.length > 0) {
        console.log(`   Monto pendiente: $${montoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      }
      console.log('')
    })

    // 3. Verificar historial de notificaciones (si existe)
    console.log('📬 Buscando historial de notificaciones...')
    const notificaciones = await prisma.notificationHistory.findMany({
      where: {
        email: emailDestino,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    if (notificaciones.length > 0) {
      console.log(`✅ Se encontraron ${notificaciones.length} notificación(es) reciente(s)\n`)
      notificaciones.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`)
        console.log(`      Fecha: ${notif.createdAt.toLocaleString('es-AR')}`)
        console.log(`      Leída: ${notif.read ? 'Sí' : 'No'}`)
        console.log('')
      })
    } else {
      console.log('⚠️ No se encontró historial de notificaciones en la base de datos')
      console.log('   Esto es normal si las notificaciones se envían solo por email\n')
    }

    // 4. Instrucciones para verificar manualmente
    console.log('='.repeat(60))
    console.log('📧 CÓMO VERIFICAR SI EL EMAIL LLEGÓ:')
    console.log('='.repeat(60) + '\n')
    
    console.log('1. 📬 Revisa la bandeja de entrada de:', emailDestino)
    console.log('   - Busca emails de "AMVA Digital" o "jerlibgnzlz@gmail.com"')
    console.log('   - Revisa también la carpeta de SPAM/CORREO NO DESEADO')
    console.log('   - Los emails pueden tardar unos minutos en llegar\n')
    
    console.log('2. 🔍 Busca estos asuntos:')
    inscripciones.forEach((inscripcion) => {
      const pagosPendientes = inscripcion.pagos.filter((p) => p.estado === 'PENDIENTE')
      if (pagosPendientes.length > 0) {
        console.log(`   - "⏰ Tienes Pagos Pendientes - ${inscripcion.convencion?.titulo || 'Convención'}"`)
      }
      console.log(`   - "📝 Inscripción Recibida - ${inscripcion.convencion?.titulo || 'Convención'}"`)
    })
    console.log('')
    
    console.log('3. 📊 Verifica los logs del backend:')
    console.log('   - Busca en los logs: "✅ Email enviado exitosamente a", emailDestino')
    console.log('   - Si ves "Message ID", el email fue aceptado por el servidor SMTP/SendGrid')
    console.log('   - Si ves errores, revisa la configuración de email\n')
    
    console.log('4. 🧪 Prueba enviar otro email:')
    console.log('   npm run test:email-pago-pendiente')
    console.log('   Esto enviará un email de prueba a una inscripción con pagos pendientes\n')
    
    console.log('5. 🔧 Si el email no llega, verifica:')
    console.log('   - Que el email remitente esté verificado en SendGrid (si usas SendGrid)')
    console.log('   - Que las variables de entorno estén configuradas correctamente')
    console.log('   - Que no haya errores en los logs del backend')
    console.log('   - Usa el endpoint de diagnóstico: GET /notifications/test-email/diagnostic\n')
    
    console.log('6. 📖 Documentación:')
    console.log('   - docs/VERIFICAR_EMAIL_SENDGRID.md')
    console.log('   - docs/CONFIGURACION_EMAIL_PRODUCCION.md\n')

    // 5. Información sobre el proveedor configurado
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail'
    console.log('='.repeat(60))
    console.log('⚙️ CONFIGURACIÓN ACTUAL:')
    console.log('='.repeat(60) + '\n')
    console.log(`   Proveedor: ${emailProvider}`)
    
    if (emailProvider === 'sendgrid') {
      console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '***' + process.env.SENDGRID_API_KEY.slice(-4) : 'NO CONFIGURADO'}`)
      console.log(`   SendGrid From Email: ${process.env.SENDGRID_FROM_EMAIL || 'NO CONFIGURADO'}`)
      console.log('\n   ⚠️ IMPORTANTE: El email remitente debe estar verificado en SendGrid')
      console.log('   → Ve a https://sendgrid.com → Settings → Sender Authentication')
    } else {
      console.log(`   SMTP User: ${process.env.SMTP_USER || 'NO CONFIGURADO'}`)
      console.log(`   SMTP Password: ${process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NO CONFIGURADO'}`)
      console.log('\n   ⚠️ Gmail SMTP puede bloquear conexiones desde servicios cloud')
      console.log('   → Considera usar SendGrid para producción')
    }
    console.log('')

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('\n❌ ERROR EN LA VERIFICACIÓN:')
    console.error(`   Mensaje: ${errorMessage}`)
    if (errorStack) {
      console.error(`   Stack: ${errorStack}`)
    }
    console.error('\n')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
main()
  .then(() => {
    console.log('✅ Verificación completada')
    process.exit(0)
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error fatal:', errorMessage)
    process.exit(1)
  })

