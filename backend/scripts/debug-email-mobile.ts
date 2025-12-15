/**
 * Script para debuggear por qué los emails no llegan desde AMVA Digital
 * 
 * Uso:
 *   npm run debug:email-mobile
 * 
 * Este script:
 * 1. Verifica la configuración de EmailService
 * 2. Verifica que NotificationsService esté disponible
 * 3. Simula una inscripción desde mobile y muestra logs detallados
 * 4. Identifica posibles problemas de inyección de dependencias
 */

import { PrismaClient } from '@prisma/client'
import { PrismaService } from '../src/prisma/prisma.service'
import { EmailService } from '../src/modules/notifications/email.service'
import { NotificationsService } from '../src/modules/notifications/notifications.service'
import { InscripcionesService } from '../src/modules/inscripciones/inscripciones.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { AuditService } from '../src/common/services/audit.service'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debug: Por qué los emails no llegan desde AMVA Digital\n')
  console.log('='.repeat(80) + '\n')

  try {
    // 1. Verificar configuración de EmailService
    console.log('1️⃣ Verificando EmailService...')
    const emailService = new EmailService()
    console.log('   ✅ EmailService inicializado\n')

    // 2. Verificar PrismaService
    console.log('2️⃣ Verificando PrismaService...')
    const prismaService = new PrismaService()
    console.log('   ✅ PrismaService inicializado\n')

    // 3. Verificar NotificationsService
    console.log('3️⃣ Verificando NotificationsService...')
    const notificationsService = new NotificationsService(prismaService, emailService)
    console.log('   ✅ NotificationsService inicializado\n')

    // 4. Verificar InscripcionesService con NotificationsService
    console.log('4️⃣ Verificando InscripcionesService con NotificationsService...')
    const eventEmitter = new EventEmitter2()
    const auditService = new AuditService(prismaService)
    
    const inscripcionesService = new InscripcionesService(
      prismaService,
      eventEmitter,
      auditService,
      notificationsService // ← Inyectar NotificationsService explícitamente
    )
    
    // Verificar que notificationsService esté disponible
    const notificationsServiceAvailable = (inscripcionesService as unknown as { notificationsService?: NotificationsService }).notificationsService !== undefined
    console.log(`   NotificationsService disponible: ${notificationsServiceAvailable ? '✅ SÍ' : '❌ NO'}`)
    
    if (!notificationsServiceAvailable) {
      console.log('\n   ⚠️ PROBLEMA ENCONTRADO: NotificationsService no está disponible')
      console.log('   Esto significa que los emails NO se enviarán')
      console.log('   Posibles causas:')
      console.log('   1. Problema de inyección de dependencias circular')
      console.log('   2. NotificationsModule no está importado correctamente')
      console.log('   3. forwardRef() no está funcionando correctamente\n')
    } else {
      console.log('   ✅ NotificationsService está disponible\n')
    }

    // 5. Buscar convención activa
    console.log('5️⃣ Buscando convención activa...')
    const convencion = await prisma.convencion.findFirst({
      where: { activa: true },
      orderBy: { fechaInicio: 'desc' },
    })

    if (!convencion) {
      console.log('   ❌ No se encontró convención activa\n')
      process.exit(1)
    }
    console.log(`   ✅ Convención encontrada: ${convencion.titulo}\n`)

    // 6. Simular inscripción desde mobile
    console.log('6️⃣ Simulando inscripción desde AMVA Digital (mobile)...\n')
    
    const emailPrueba = `debug-mobile-${Date.now()}@ejemplo.com`
    const inscripcionData = {
      convencionId: convencion.id,
      nombre: 'Debug',
      apellido: 'Mobile Test',
      email: emailPrueba,
      telefono: '+5491234567890',
      sede: 'Sede Debug',
      tipoInscripcion: 'pastor',
      numeroCuotas: 3,
      origenRegistro: 'mobile' as const,
      notas: 'Debug: Verificando por qué no llegan emails desde mobile',
    }

    console.log('📝 Datos:')
    console.log(`   Email: ${emailPrueba}`)
    console.log(`   Origen: mobile\n`)

    console.log('📤 Creando inscripción y verificando envío de email...\n')
    console.log('='.repeat(80))
    console.log('LOGS DEL BACKEND (busca estos mensajes):')
    console.log('='.repeat(80) + '\n')
    console.log('✅ Si ves: "✅ Email de inscripción enviado exitosamente" → El email SE ENVIÓ')
    console.log('❌ Si ves: "❌ NotificationsService no disponible" → Problema de inyección')
    console.log('❌ Si ves: "❌ No se pudo enviar email" → Problema de EmailService')
    console.log('❌ Si NO ves ningún log de email → El código no se está ejecutando\n')
    console.log('='.repeat(80) + '\n')

    const inscripcionCreada = await inscripcionesService.createInscripcion(inscripcionData)

    console.log('\n' + '='.repeat(80))
    console.log('📊 RESULTADO:')
    console.log('='.repeat(80) + '\n')
    console.log(`   Inscripción creada: ${inscripcionCreada.id}`)
    console.log(`   Email: ${inscripcionCreada.email}`)
    console.log(`   Origen: ${inscripcionCreada.origenRegistro}\n`)

    console.log('🔍 REVISA LOS LOGS ARRIBA para ver si el email se envió o hubo errores\n')

    // 7. Limpiar
    console.log('🧹 Limpiando inscripción de prueba...')
    await prisma.inscripcion.delete({
      where: { id: inscripcionCreada.id },
    })
    console.log('✅ Limpieza completada\n')

    // 8. Recomendaciones
    console.log('='.repeat(80))
    console.log('💡 RECOMENDACIONES:')
    console.log('='.repeat(80) + '\n')
    console.log('1. Revisa los logs del backend en producción cuando se crea una inscripción desde mobile')
    console.log('2. Busca estos mensajes específicos:')
    console.log('   - "📧 Preparando email de confirmación para..."')
    console.log('   - "✅ Email de inscripción enviado exitosamente"')
    console.log('   - "❌ NotificationsService no disponible"')
    console.log('   - "❌ No se pudo enviar email"')
    console.log('\n3. Si ves "NotificationsService no disponible":')
    console.log('   - Verifica que NotificationsModule esté importado en InscripcionesModule')
    console.log('   - Verifica que forwardRef() esté funcionando correctamente')
    console.log('   - Reinicia el servidor en producción\n')
    console.log('4. Si NO ves ningún log de email:')
    console.log('   - El código no se está ejecutando')
    console.log('   - Verifica que la app móvil esté enviando origenRegistro: "mobile"')
    console.log('   - Verifica que el endpoint POST /api/inscripciones esté funcionando\n')

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('\n❌ ERROR EN EL DEBUG:')
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

main()
  .then(() => {
    console.log('✅ Debug completado')
    process.exit(0)
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error fatal:', errorMessage)
    process.exit(1)
  })

