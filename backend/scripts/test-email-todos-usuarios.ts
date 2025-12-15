/**
 * Script para probar el envío de emails a TODOS los usuarios registrados
 * 
 * Uso:
 *   npm run test:email-todos-usuarios
 *   O directamente: ts-node scripts/test-email-todos-usuarios.ts
 * 
 * Este script:
 * 1. Busca todas las inscripciones con emails únicos
 * 2. Envía un email de prueba a cada una
 * 3. Muestra el resultado detallado de cada envío
 */

import { PrismaClient } from '@prisma/client'
import { EmailService } from '../src/modules/notifications/email.service'
import { getEmailTemplate } from '../src/modules/notifications/templates/email.templates'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Iniciando prueba masiva de emails a todos los usuarios...\n')

  try {
    // 1. Buscar todas las inscripciones con emails únicos
    console.log('📋 Buscando todas las inscripciones con emails...')
    
    const inscripciones = await prisma.inscripcion.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        convencion: {
          select: {
            titulo: true,
          },
        },
        pagos: {
          select: {
            estado: true,
            monto: true,
            numeroCuota: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (inscripciones.length === 0) {
      console.log('❌ No se encontraron inscripciones en la base de datos')
      process.exit(1)
    }

    // Obtener emails únicos
    const emailsUnicos = new Set<string>()
    const inscripcionesPorEmail = new Map<string, typeof inscripciones>()

    inscripciones.forEach((inscripcion) => {
      if (inscripcion.email && !emailsUnicos.has(inscripcion.email)) {
        emailsUnicos.add(inscripcion.email)
        inscripcionesPorEmail.set(inscripcion.email, [inscripcion])
      } else if (inscripcion.email) {
        const existentes = inscripcionesPorEmail.get(inscripcion.email) || []
        existentes.push(inscripcion)
        inscripcionesPorEmail.set(inscripcion.email, existentes)
      }
    })

    console.log(`✅ Se encontraron ${inscripciones.length} inscripción(es)`)
    console.log(`📧 Se encontraron ${emailsUnicos.size} email(s) único(s)\n`)

    // 2. Inicializar EmailService
    console.log('📧 Inicializando EmailService...')
    const emailService = new EmailService()
    console.log('✅ EmailService inicializado\n')

    // 3. Enviar email de prueba a cada usuario
    console.log('='.repeat(80))
    console.log('📤 ENVIANDO EMAILS DE PRUEBA')
    console.log('='.repeat(80) + '\n')

    const resultados: Array<{
      email: string
      nombre: string
      exito: boolean
      error?: string
    }> = []

    let contador = 0
    for (const email of emailsUnicos) {
      contador++
      const inscripcionesDelEmail = inscripcionesPorEmail.get(email) || []
      const primeraInscripcion = inscripcionesDelEmail[0]
      const nombreCompleto = `${primeraInscripcion.nombre} ${primeraInscripcion.apellido || ''}`.trim()
      
      // Buscar inscripción con pagos pendientes para enviar recordatorio
      const inscripcionConPagosPendientes = inscripcionesDelEmail.find((insc) => {
        const pagosPendientes = insc.pagos.filter((p) => p.estado === 'PENDIENTE')
        return pagosPendientes.length > 0
      })

      try {
        console.log(`[${contador}/${emailsUnicos.size}] 📧 Enviando email a: ${email}`)
        console.log(`   Nombre: ${nombreCompleto}`)
        
        let template
        let data

        if (inscripcionConPagosPendientes) {
          // Enviar email de recordatorio si tiene pagos pendientes
          const pagosPendientes = inscripcionConPagosPendientes.pagos.filter((p) => p.estado === 'PENDIENTE')
          const montoPendiente = pagosPendientes.reduce((sum, pago) => sum + Number(pago.monto), 0)
          
          console.log(`   Tipo: Recordatorio de pagos pendientes (${pagosPendientes.length} cuota(s), $${montoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`)
          
          template = getEmailTemplate('pago_recordatorio', {
            inscripcionId: inscripcionConPagosPendientes.id,
            cuotasPendientes: pagosPendientes.length,
            montoPendiente,
            convencionTitulo: inscripcionConPagosPendientes.convencion?.titulo || 'Convención',
            nombre: primeraInscripcion.nombre,
            apellido: primeraInscripcion.apellido || '',
            inscripcionNombre: nombreCompleto,
          })
          
          data = {
            type: 'pago_recordatorio',
            inscripcionId: inscripcionConPagosPendientes.id,
            cuotasPendientes: pagosPendientes.length,
            montoPendiente,
            convencionTitulo: inscripcionConPagosPendientes.convencion?.titulo || 'Convención',
            nombre: primeraInscripcion.nombre,
            apellido: primeraInscripcion.apellido || '',
            inscripcionNombre: nombreCompleto,
          }
        } else {
          // Enviar email de prueba genérico
          console.log(`   Tipo: Email de prueba`)
          
          template = getEmailTemplate('inscripcion_creada', {
            inscripcionId: primeraInscripcion.id,
            convencionTitulo: primeraInscripcion.convencion?.titulo || 'Convención',
            numeroCuotas: primeraInscripcion.pagos.length || 3,
            montoTotal: primeraInscripcion.pagos.reduce((sum, p) => sum + Number(p.monto), 0),
            origenRegistro: 'web',
            nombre: primeraInscripcion.nombre,
            apellido: primeraInscripcion.apellido || '',
            inscripcionNombre: nombreCompleto,
          })
          
          data = {
            type: 'inscripcion_creada',
            inscripcionId: primeraInscripcion.id,
            convencionTitulo: primeraInscripcion.convencion?.titulo || 'Convención',
            nombre: primeraInscripcion.nombre,
            apellido: primeraInscripcion.apellido || '',
            inscripcionNombre: nombreCompleto,
          }
        }

        const resultado = await emailService.sendNotificationEmail(
          email,
          template.title,
          template.body,
          data
        )

        if (resultado) {
          console.log(`   ✅ Email enviado exitosamente\n`)
          resultados.push({
            email,
            nombre: nombreCompleto,
            exito: true,
          })
        } else {
          console.log(`   ❌ Error al enviar email\n`)
          resultados.push({
            email,
            nombre: nombreCompleto,
            exito: false,
            error: 'EmailService retornó false',
          })
        }

        // Pequeño delay para no saturar el servidor de email
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log(`   ❌ Error: ${errorMessage}\n`)
        resultados.push({
          email,
          nombre: nombreCompleto,
          exito: false,
          error: errorMessage,
        })
      }
    }

    // 4. Mostrar resumen
    console.log('='.repeat(80))
    console.log('📊 RESUMEN DE RESULTADOS')
    console.log('='.repeat(80) + '\n')

    const exitosos = resultados.filter((r) => r.exito).length
    const fallidos = resultados.filter((r) => !r.exito).length

    console.log(`Total de emails: ${resultados.length}`)
    console.log(`✅ Exitosos: ${exitosos}`)
    console.log(`❌ Fallidos: ${fallidos}`)
    console.log(`📊 Tasa de éxito: ${((exitosos / resultados.length) * 100).toFixed(2)}%\n`)

    if (fallidos > 0) {
      console.log('='.repeat(80))
      console.log('❌ EMAILS FALLIDOS:')
      console.log('='.repeat(80) + '\n')
      resultados
        .filter((r) => !r.exito)
        .forEach((r) => {
          console.log(`   ${r.email} (${r.nombre})`)
          if (r.error) {
            console.log(`      Error: ${r.error}`)
          }
          console.log('')
        })
    }

    if (exitosos > 0) {
      console.log('='.repeat(80))
      console.log('✅ EMAILS EXITOSOS:')
      console.log('='.repeat(80) + '\n')
      resultados
        .filter((r) => r.exito)
        .forEach((r) => {
          console.log(`   ✅ ${r.email} (${r.nombre})`)
        })
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('💡 RECOMENDACIONES:')
    console.log('='.repeat(80) + '\n')
    console.log('1. Revisa la bandeja de entrada (y spam) de cada destinatario')
    console.log('2. Verifica los logs del backend para más detalles')
    console.log('3. Si hay emails fallidos, revisa la configuración de EmailService')
    console.log('4. Usa el endpoint de diagnóstico: GET /notifications/test-email/diagnostic\n')

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

