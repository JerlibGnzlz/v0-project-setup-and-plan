/**
 * Script para probar el envío de emails de recordatorio de pagos pendientes
 * 
 * Uso:
 *   npm run test:email-pago-pendiente
 *   O directamente: ts-node scripts/test-email-pago-pendiente.ts
 * 
 * Este script:
 * 1. Busca inscripciones con pagos pendientes
 * 2. Selecciona la primera inscripción encontrada
 * 3. Envía un email de recordatorio usando el EmailService
 * 4. Muestra el resultado del envío
 */

import { PrismaClient } from '@prisma/client'
import { EmailService } from '../src/modules/notifications/email.service'
import { getEmailTemplate } from '../src/modules/notifications/templates/email.templates'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Iniciando prueba de email de pago pendiente...\n')

  try {
    // 1. Buscar inscripciones con pagos pendientes
    console.log('📋 Buscando inscripciones con pagos pendientes...')
    
    const inscripcionesConPagosPendientes = await prisma.inscripcion.findMany({
      where: {
        estado: {
          in: ['pendiente', 'confirmado'], // Incluir confirmadas también por si acaso
        },
        pagos: {
          some: {
            estado: 'PENDIENTE', // Estado en mayúsculas según Prisma enum
          },
        },
      },
      include: {
        convencion: true,
        pagos: {
          where: {
            estado: 'PENDIENTE', // Estado en mayúsculas según Prisma enum
          },
        },
      },
      take: 5, // Limitar a 5 para no sobrecargar
    })

    if (inscripcionesConPagosPendientes.length === 0) {
      console.log('❌ No se encontraron inscripciones con pagos pendientes')
      console.log('   Crea una inscripción de prueba con pagos pendientes primero')
      process.exit(1)
    }

    console.log(`✅ Se encontraron ${inscripcionesConPagosPendientes.length} inscripción(es) con pagos pendientes\n`)

    // 2. Seleccionar la primera inscripción
    const inscripcion = inscripcionesConPagosPendientes[0]
    
    // Obtener la convención si no está incluida
    const convencion = inscripcion.convencion || await prisma.convencion.findUnique({
      where: { id: inscripcion.convencionId },
    })
    
    const pagosPendientes = inscripcion.pagos.filter((p) => p.estado === 'PENDIENTE')
    const montoPendiente = pagosPendientes.reduce((sum, pago) => sum + Number(pago.monto), 0)

    console.log('📧 Detalles de la inscripción seleccionada:')
    console.log(`   Nombre: ${inscripcion.nombre} ${inscripcion.apellido || ''}`)
    console.log(`   Email: ${inscripcion.email}`)
    console.log(`   Convención: ${convencion?.titulo || 'N/A'}`)
    console.log(`   Pagos pendientes: ${pagosPendientes.length}`)
    console.log(`   Monto pendiente: $${montoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`)

    // 3. Inicializar EmailService
    console.log('📧 Inicializando EmailService...')
    const emailService = new EmailService()
    console.log('✅ EmailService inicializado\n')

    // 4. Obtener template de email de recordatorio
    console.log('📝 Obteniendo template de email de recordatorio...')
    const template = getEmailTemplate('pago_recordatorio', {
      inscripcionId: inscripcion.id,
      cuotasPendientes: pagosPendientes.length,
      montoPendiente,
      convencionTitulo: convencion?.titulo || 'Convención',
      nombre: inscripcion.nombre,
      apellido: inscripcion.apellido || '',
      inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido || ''}`.trim(),
    })
    console.log(`✅ Template obtenido: "${template.title}"\n`)

    // 5. Enviar email
    console.log(`📤 Enviando email de prueba a ${inscripcion.email}...`)
    console.log('   Esto puede tardar unos segundos...\n')

    const resultado = await emailService.sendNotificationEmail(
      inscripcion.email,
      template.title,
      template.body,
      {
        type: 'pago_recordatorio',
        inscripcionId: inscripcion.id,
        cuotasPendientes: pagosPendientes.length,
        montoPendiente,
        convencionTitulo: convencion?.titulo || 'Convención',
        nombre: inscripcion.nombre,
        apellido: inscripcion.apellido || '',
        inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido || ''}`.trim(),
      }
    )

    // 6. Mostrar resultado
    console.log('\n' + '='.repeat(60))
    if (resultado) {
      console.log('✅ EMAIL ENVIADO EXITOSAMENTE')
      console.log(`   Email enviado a: ${inscripcion.email}`)
      console.log(`   Asunto: ${template.title}`)
      console.log('\n   📧 Verifica la bandeja de entrada (y spam) del destinatario')
      console.log('   📊 Revisa los logs del backend para más detalles')
    } else {
      console.log('❌ ERROR AL ENVIAR EMAIL')
      console.log(`   Email destino: ${inscripcion.email}`)
      console.log('\n   🔍 Posibles causas:')
      console.log('   1. Email no verificado en SendGrid (si usas SendGrid)')
      console.log('   2. Variables de entorno no configuradas correctamente')
      console.log('   3. Problemas de conexión con el proveedor de email')
      console.log('\n   💡 Usa el endpoint de diagnóstico:')
      console.log('      GET /notifications/test-email/diagnostic')
      console.log('\n   📖 Ver documentación:')
      console.log('      docs/VERIFICAR_EMAIL_SENDGRID.md')
      console.log('      docs/CONFIGURACION_EMAIL_PRODUCCION.md')
    }
    console.log('='.repeat(60) + '\n')

    // 7. Mostrar otras inscripciones disponibles (opcional)
    if (inscripcionesConPagosPendientes.length > 1) {
      console.log('📋 Otras inscripciones disponibles para probar:')
      for (const insc of inscripcionesConPagosPendientes.slice(1)) {
        const pendientes = insc.pagos.filter((p) => p.estado === 'PENDIENTE')
        const monto = pendientes.reduce((sum, pago) => sum + Number(pago.monto), 0)
        const index = inscripcionesConPagosPendientes.indexOf(insc)
        console.log(`   ${index + 1}. ${insc.nombre} ${insc.apellido || ''} - ${insc.email} (${pendientes.length} pagos, $${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`)
      }
      console.log('')
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('\n❌ ERROR EN LA PRUEBA:')
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
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error fatal:', errorMessage)
    process.exit(1)
  })

