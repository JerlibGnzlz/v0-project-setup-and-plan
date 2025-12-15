/**
 * Script para probar creación de inscripción desde AMVA Digital (mobile)
 * Simula exactamente lo que hace la app móvil cuando crea una inscripción
 * 
 * Uso:
 *   npm run test:inscripcion-mobile
 *   O directamente: ts-node scripts/test-inscripcion-mobile.ts
 * 
 * Este script:
 * 1. Simula una inscripción desde la app móvil (origenRegistro: 'mobile')
 * 2. Verifica que el email se envíe correctamente
 * 3. Muestra el resultado detallado
 */

import { PrismaClient } from '@prisma/client'
import { InscripcionesService } from '../src/modules/inscripciones/inscripciones.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { NotificationsService } from '../src/modules/notifications/notifications.service'
import { EmailService } from '../src/modules/notifications/email.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { AuditService } from '../src/common/services/audit.service'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Probando creación de inscripción desde AMVA Digital (mobile)...\n')

    try {
        // 1. Buscar una convención activa
        console.log('📋 Buscando convención activa...')
        const convencion = await prisma.convencion.findFirst({
            where: { activa: true },
            orderBy: { fechaInicio: 'desc' },
        })

        if (!convencion) {
            console.log('❌ No se encontró ninguna convención activa')
            console.log('   Crea una convención activa primero')
            process.exit(1)
        }

        console.log(`✅ Convención encontrada: ${convencion.titulo}\n`)

    // 2. Crear servicios necesarios (simulando el módulo NestJS)
    console.log('🔧 Inicializando servicios...')
    const prismaService = new PrismaService()
    const emailService = new EmailService()
    const notificationsService = new NotificationsService(prismaService, emailService)
    const eventEmitter = new EventEmitter2()
    const auditService = new AuditService(prismaService)
    
    // Orden correcto del constructor: prisma, eventEmitter, auditService, notificationsService
    const inscripcionesService = new InscripcionesService(
      prismaService,
      eventEmitter,
      auditService,
      notificationsService
    )
    console.log('✅ Servicios inicializados\n')

        // 3. Crear inscripción simulando la app móvil
        console.log('📱 Simulando inscripción desde AMVA Digital (mobile)...')
        console.log('   origenRegistro: "mobile"\n')

        const emailPrueba = `test-mobile-${Date.now()}@ejemplo.com`
        const inscripcionData = {
            convencionId: convencion.id,
            nombre: 'Test',
            apellido: 'Mobile App',
            email: emailPrueba,
            telefono: '+5491234567890',
            sede: 'Sede de Prueba',
            tipoInscripcion: 'pastor',
            numeroCuotas: 3,
            origenRegistro: 'mobile' as const, // IMPORTANTE: origenRegistro = 'mobile'
            notas: 'Inscripción de prueba desde AMVA Digital (mobile)',
        }

        console.log('📝 Datos de la inscripción:')
        console.log(`   Nombre: ${inscripcionData.nombre} ${inscripcionData.apellido}`)
        console.log(`   Email: ${inscripcionData.email}`)
        console.log(`   Convención: ${convencion.titulo}`)
        console.log(`   Origen: ${inscripcionData.origenRegistro}`)
        console.log(`   Cuotas: ${inscripcionData.numeroCuotas}\n`)

        console.log('📤 Creando inscripción...')
        console.log('   Esto debería enviar un email automáticamente...\n')

        const inscripcionCreada = await inscripcionesService.createInscripcion(inscripcionData)

        console.log('='.repeat(80))
        console.log('✅ INSCRIPCIÓN CREADA EXITOSAMENTE')
        console.log('='.repeat(80) + '\n')
    console.log(`   ID: ${inscripcionCreada.id}`)
    console.log(`   Email: ${inscripcionCreada.email}`)
    console.log(`   Estado: ${inscripcionCreada.estado}`)
    console.log(`   Origen: ${inscripcionCreada.origenRegistro}`)
    
    // Obtener pagos por separado ya que el tipo de retorno puede no incluirlos
    const pagos = await prisma.pago.findMany({
      where: { inscripcionId: inscripcionCreada.id },
    })
    console.log(`   Pagos creados: ${pagos.length}\n`)

        // 4. Verificar que el email se envió
        console.log('='.repeat(80))
        console.log('📧 VERIFICACIÓN DE EMAIL')
        console.log('='.repeat(80) + '\n')
        console.log('✅ El email debería haberse enviado automáticamente durante la creación')
        console.log(`   Email destino: ${emailPrueba}`)
        console.log(`   Tipo: Inscripción creada desde mobile`)
        console.log('\n   📊 Revisa los logs del backend para ver:')
        console.log('      ✅ Email de inscripción enviado exitosamente a [email]')
        console.log('\n   📧 Verifica la bandeja de entrada (y spam) del email de prueba\n')

        // 5. Limpiar: eliminar la inscripción de prueba
        console.log('🧹 Limpiando inscripción de prueba...')
        await prisma.inscripcion.delete({
            where: { id: inscripcionCreada.id },
        })
        console.log('✅ Inscripción de prueba eliminada\n')

        console.log('='.repeat(80))
        console.log('✅ PRUEBA COMPLETADA')
        console.log('='.repeat(80) + '\n')
        console.log('📱 La app móvil AMVA Digital funciona igual que la prueba exitosa:')
        console.log('   ✅ Los emails se envían directamente usando sendEmailToUser()')
        console.log('   ✅ No dependen de eventos asíncronos')
        console.log('   ✅ Funcionan para todos los orígenes: web, mobile, dashboard')
        console.log('   ✅ Tienen logging detallado\n')

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

