/**
 * Utilidad para probar la conexión al backend
 * Úsala en desarrollo para verificar que la URL del API sea accesible
 */

import { apiClient } from '../api/client'

export async function testBackendConnection(): Promise<boolean> {
  try {
    console.log('🧪 ========================================')
    console.log('🧪 DIAGNÓSTICO DE CONEXIÓN')
    console.log('🧪 ========================================')

    const baseURL = apiClient.defaults.baseURL
    console.log('📍 Base URL configurada:', baseURL)

    // Intentar una petición simple (endpoint público)
    // Usar apiClient para mantener consistencia
    const testUrl = `/noticias/publicadas`
    console.log('🔗 URL completa a probar:', baseURL + testUrl)
    console.log('⏱️  Timeout: 10 segundos')

    const startTime = Date.now()
    const response = await apiClient.get(testUrl, {
      timeout: 10000, // 10 segundos para la prueba
    })
    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('✅ ========================================')
    console.log('✅ CONEXIÓN EXITOSA!')
    console.log('✅ ========================================')
    console.log('✅ Status:', response.status)
    console.log('✅ Tiempo de respuesta:', duration + 'ms')
    console.log(
      '✅ Datos recibidos:',
      response.data
        ? 'Sí (' + (Array.isArray(response.data) ? response.data.length + ' items' : 'objeto') + ')'
        : 'No'
    )
    console.log('✅ Headers recibidos:', Object.keys(response.headers).length + ' headers')
    return true
  } catch (error: any) {
    console.error('❌ ========================================')
    console.error('❌ ERROR DE CONEXIÓN')
    console.error('❌ ========================================')
    console.error('❌ Código:', error.code)
    console.error('❌ Mensaje:', error.message)
    console.error('❌ URL intentada:', apiClient.defaults.baseURL)

    if (error.response) {
      console.error('⚠️  El servidor respondió pero con error:')
      console.error('   Status:', error.response.status)
      console.error('   Status Text:', error.response.statusText)
      console.error('   Esto significa que la conexión funciona, pero hay un error en el endpoint')
      return true // Consideramos esto como conexión exitosa
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('💡 CONEXIÓN RECHAZADA')
      console.error('   El backend no está corriendo o no está escuchando en esa IP/puerto')
      console.error('   Verifica:')
      console.error('   1. Backend corriendo: cd backend && npm run start:dev')
      console.error('   2. Backend escuchando en 0.0.0.0 (no solo localhost)')
      console.error(
        '   3. Prueba desde terminal: curl',
        apiClient.defaults.baseURL + '/noticias/publicadas'
      )
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      console.error('💡 NO SE PUEDE RESOLVER EL HOSTNAME')
      console.error('   Verifica:')
      console.error('   1. La IP en src/api/client.ts (LOCAL_IP) es correcta')
      console.error('   2. Tu IP actual: hostname -I (Linux) o ipconfig (Windows/Mac)')
      console.error('   3. El dispositivo móvil puede alcanzar esa IP')
    } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.error('💡 ERROR DE RED')
      console.error('   Posibles causas:')
      console.error('   1. Backend no está corriendo → cd backend && npm run start:dev')
      console.error('   2. Backend no escucha en 0.0.0.0 → Verifica backend/src/main.ts línea 88')
      console.error('   3. Firewall bloqueando → sudo ufw allow 4000 (Linux)')
      console.error('   4. IP incorrecta → Verifica LOCAL_IP en client.ts línea 59')
      console.error('   5. Redes diferentes → Asegúrate de estar en la misma WiFi')
      console.error('   6. Backend solo escucha en localhost → Reinicia backend')
      console.error('   7. Dispositivo físico necesita IP local (no localhost)')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('💡 TIMEOUT')
      console.error('   El backend no respondió en 10 segundos')
      console.error('   Verifica que el backend esté corriendo y accesible')
    } else {
      console.error('💡 ERROR DESCONOCIDO')
      console.error('   Detalles completos:', JSON.stringify(error, null, 2))
    }

    console.error('❌ ========================================')
    return false
  }
}
