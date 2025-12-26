/**
 * Script de prueba para verificar el flujo completo de solicitud de credenciales
 * 
 * Este script simula:
 * 1. Login de invitado desde la app móvil
 * 2. Creación de solicitud de credencial
 * 3. Verificación de que la solicitud se creó
 * 4. Verificación de que las notificaciones llegaron a AMVA Digital
 * 
 * Uso:
 *   npm run test:solicitud-credencial
 *   o
 *   ts-node scripts/test-solicitud-credencial.ts
 */

import axios from 'axios'

const API_BASE_URL = process.env.API_BASE_URL || 'https://ministerio-backend-wdbj.onrender.com/api'
const INVITADO_EMAIL = process.env.TEST_INVITADO_EMAIL || 'jerlibgv@gmail.com'
const INVITADO_PASSWORD = process.env.TEST_INVITADO_PASSWORD || 'test123'

interface TestResult {
  step: string
  success: boolean
  message: string
  data?: unknown
  error?: unknown
}

const results: TestResult[] = []

function logResult(step: string, success: boolean, message: string, data?: unknown, error?: unknown) {
  const result: TestResult = { step, success, message, data, error }
  results.push(result)
  
  const icon = success ? '✅' : '❌'
  console.log(`${icon} ${step}: ${message}`)
  if (data && success) {
    console.log(`   Datos:`, JSON.stringify(data, null, 2))
  }
  if (error && !success) {
    console.error(`   Error:`, error)
  }
}

async function testLoginInvitado(): Promise<{ token: string; refreshToken: string; invitadoId: string } | null> {
  try {
    console.log('\n🔐 Paso 1: Login de invitado...')
    
    const response = await axios.post(`${API_BASE_URL}/auth/invitado/login`, {
      email: INVITADO_EMAIL,
      password: INVITADO_PASSWORD,
    })

    if (response.data && response.data.token && response.data.invitado) {
      logResult(
        'Login de invitado',
        true,
        `Login exitoso para ${INVITADO_EMAIL}`,
        { invitadoId: response.data.invitado.id }
      )
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken || '',
        invitadoId: response.data.invitado.id,
      }
    }

    logResult('Login de invitado', false, 'Respuesta inválida', null, response.data)
    return null
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Login de invitado', false, `Error en login: ${errorMessage}`, null, errorData)
    return null
  }
}

async function testCrearSolicitud(
  token: string,
  invitadoId: string
): Promise<{ solicitudId: string } | null> {
  try {
    console.log('\n📝 Paso 2: Crear solicitud de credencial...')
    
    const solicitudData = {
      tipo: 'ministerial',
      dni: `TEST${Date.now()}`, // DNI único para evitar duplicados
      nombre: 'Test',
      apellido: 'Usuario',
      nacionalidad: 'Venezolano',
      motivo: 'Solicitud de prueba desde script',
    }

    const response = await axios.post(
      `${API_BASE_URL}/solicitudes-credenciales`,
      solicitudData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data && response.data.id) {
      logResult(
        'Crear solicitud',
        true,
        `Solicitud creada exitosamente`,
        { solicitudId: response.data.id, tipo: response.data.tipo }
      )
      return { solicitudId: response.data.id }
    }

    logResult('Crear solicitud', false, 'Respuesta inválida', null, response.data)
    return null
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Crear solicitud', false, `Error creando solicitud: ${errorMessage}`, null, errorData)
    return null
  }
}

async function testObtenerMisSolicitudes(
  token: string
): Promise<boolean> {
  try {
    console.log('\n📋 Paso 3: Obtener mis solicitudes...')
    
    const response = await axios.get(
      `${API_BASE_URL}/solicitudes-credenciales/mis-solicitudes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (Array.isArray(response.data)) {
      logResult(
        'Obtener mis solicitudes',
        true,
        `Se encontraron ${response.data.length} solicitud(es)`,
        { cantidad: response.data.length }
      )
      return true
    }

    logResult('Obtener mis solicitudes', false, 'Respuesta inválida', null, response.data)
    return false
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Obtener mis solicitudes', false, `Error obteniendo solicitudes: ${errorMessage}`, null, errorData)
    return false
  }
}

async function testLoginAdmin(): Promise<{ token: string; adminEmail: string } | null> {
  try {
    console.log('\n🔐 Paso 4: Login de admin (para verificar notificaciones)...')
    
    // Intentar login con un admin de prueba
    // Nota: Ajusta estos valores según tu configuración
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'admin123'

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    })

    if (response.data && response.data.token && response.data.user) {
      logResult(
        'Login de admin',
        true,
        `Login exitoso para admin ${adminEmail}`,
        { userId: response.data.user.id }
      )
      return {
        token: response.data.token,
        adminEmail: response.data.user.email,
      }
    }

    logResult('Login de admin', false, 'Respuesta inválida', null, response.data)
    return null
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Login de admin', false, `Error en login: ${errorMessage}`, null, errorData)
    return null
  }
}

async function testObtenerNotificaciones(
  adminToken: string,
  adminEmail: string,
  solicitudId: string
): Promise<boolean> {
  try {
    console.log('\n🔔 Paso 5: Verificar notificaciones en AMVA Digital...')
    
    // Esperar un poco para que las notificaciones se procesen
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = await axios.get(
      `${API_BASE_URL}/notifications/history`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        params: {
          email: adminEmail,
          limit: 10,
        },
      }
    )

    if (response.data && response.data.notifications) {
      const notifications = response.data.notifications as Array<{
        id: string
        type: string
        title: string
        data?: { solicitudId?: string }
      }>

      // Buscar notificación de solicitud de credencial
      const solicitudNotification = notifications.find(
        n => n.type === 'solicitud_credencial' && n.data?.solicitudId === solicitudId
      )

      if (solicitudNotification) {
        logResult(
          'Verificar notificaciones',
          true,
          `Notificación encontrada en AMVA Digital`,
          {
            notificationId: solicitudNotification.id,
            title: solicitudNotification.title,
            solicitudId: solicitudNotification.data?.solicitudId,
          }
        )
        return true
      } else {
        logResult(
          'Verificar notificaciones',
          false,
          `No se encontró notificación para solicitud ${solicitudId}`,
          { notificationsFound: notifications.length }
        )
        return false
      }
    }

    logResult('Verificar notificaciones', false, 'Respuesta inválida', null, response.data)
    return false
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Verificar notificaciones', false, `Error obteniendo notificaciones: ${errorMessage}`, null, errorData)
    return false
  }
}

async function testObtenerConteoNoLeidas(
  adminToken: string,
  adminEmail: string
): Promise<boolean> {
  try {
    console.log('\n📊 Paso 6: Verificar conteo de no leídas...')
    
    const response = await axios.get(
      `${API_BASE_URL}/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    )

    if (typeof response.data === 'object' && 'count' in response.data) {
      const count = response.data.count as number
      logResult(
        'Verificar conteo de no leídas',
        true,
        `Conteo de no leídas: ${count}`,
        { count }
      )
      return true
    }

    logResult('Verificar conteo de no leídas', false, 'Respuesta inválida', null, response.data)
    return false
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorData = axios.isAxiosError(error) ? error.response?.data : null
    logResult('Verificar conteo de no leídas', false, `Error obteniendo conteo: ${errorMessage}`, null, errorData)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando prueba de flujo completo de solicitud de credenciales\n')
  console.log(`📍 API Base URL: ${API_BASE_URL}`)
  console.log(`👤 Invitado Email: ${INVITADO_EMAIL}\n`)

  // Paso 1: Login de invitado
  const loginResult = await testLoginInvitado()
  if (!loginResult) {
    console.log('\n❌ No se pudo completar el login de invitado. Abortando prueba.')
    printSummary()
    process.exit(1)
  }

  const { token, invitadoId } = loginResult

  // Paso 2: Crear solicitud
  const solicitudResult = await testCrearSolicitud(token, invitadoId)
  if (!solicitudResult) {
    console.log('\n❌ No se pudo crear la solicitud. Abortando prueba.')
    printSummary()
    process.exit(1)
  }

  const { solicitudId } = solicitudResult

  // Paso 3: Obtener mis solicitudes
  await testObtenerMisSolicitudes(token)

  // Paso 4: Login de admin (opcional, para verificar notificaciones)
  const adminResult = await testLoginAdmin()
  if (adminResult) {
    const { token: adminToken, adminEmail } = adminResult

    // Paso 5: Verificar notificaciones
    await testObtenerNotificaciones(adminToken, adminEmail, solicitudId)

    // Paso 6: Verificar conteo de no leídas
    await testObtenerConteoNoLeidas(adminToken, adminEmail)
  } else {
    console.log('\n⚠️  No se pudo hacer login de admin. Saltando verificación de notificaciones.')
  }

  // Resumen final
  printSummary()
}

function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE PRUEBAS')
  console.log('='.repeat(60))

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const total = results.length

  console.log(`\n✅ Exitosas: ${successful}/${total}`)
  console.log(`❌ Fallidas: ${failed}/${total}`)

  if (failed > 0) {
    console.log('\n❌ Pruebas fallidas:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.step}: ${r.message}`)
        if (r.error) {
          console.log(`     Error: ${JSON.stringify(r.error)}`)
        }
      })
  }

  console.log('\n' + '='.repeat(60))

  if (failed === 0) {
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!')
    process.exit(0)
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los errores arriba.')
    process.exit(1)
  }
}

// Ejecutar el script
main().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})

