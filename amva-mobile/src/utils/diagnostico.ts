/**
 * Utilidad para diagnosticar problemas de conexión
 */

import { Platform } from 'react-native'
import axios from 'axios'

export interface DiagnosticoResult {
  plataforma: string
  apiUrl: string
  backendReachable: boolean
  error?: string
  detalles?: any
}

export async function diagnosticarConexion(apiUrl: string): Promise<DiagnosticoResult> {
  const resultado: DiagnosticoResult = {
    plataforma: Platform.OS,
    apiUrl,
    backendReachable: false,
  }

  try {
    console.log('🔍 Iniciando diagnóstico de conexión...')
    console.log('📍 API URL:', apiUrl)
    console.log('📱 Plataforma:', Platform.OS)

    // Intentar conectar a un endpoint público
    const testUrl = `${apiUrl}/noticias/publicadas`
    console.log('🧪 Probando conexión a:', testUrl)

    const response = await axios.get(testUrl, {
      timeout: 10000, // 10 segundos
      validateStatus: () => true, // Aceptar cualquier status
    })

    console.log('✅ Respuesta recibida:', response.status)

    if (response.status === 200 || response.status === 404) {
      // 200 = éxito, 404 = endpoint no existe pero el servidor responde
      resultado.backendReachable = true
      resultado.detalles = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }
    } else {
      resultado.backendReachable = false
      resultado.error = `Status inesperado: ${response.status}`
      resultado.detalles = {
        status: response.status,
        statusText: response.statusText,
      }
    }
  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', error)

    resultado.backendReachable = false

    if (error.code === 'ECONNREFUSED') {
      resultado.error =
        'Conexión rechazada. El backend no está corriendo o no está escuchando en esa IP/puerto.'
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      resultado.error = 'No se pudo resolver el hostname. Verifica que la IP sea correcta.'
    } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      resultado.error = 'Timeout. El backend no responde. Verifica que esté corriendo y accesible.'
    } else if (error.message?.includes('Network Error')) {
      resultado.error = 'Error de red. Verifica tu conexión WiFi y que el backend esté corriendo.'
    } else {
      resultado.error = error.message || 'Error desconocido'
    }

    resultado.detalles = {
      code: error.code,
      message: error.message,
      stack: error.stack,
    }
  }

  return resultado
}

export function generarReporteDiagnostico(resultado: DiagnosticoResult): string {
  let reporte = '📊 REPORTE DE DIAGNÓSTICO\n\n'
  reporte += `📱 Plataforma: ${resultado.plataforma}\n`
  reporte += `📍 API URL: ${resultado.apiUrl}\n`
  reporte += `✅ Backend alcanzable: ${resultado.backendReachable ? 'SÍ' : 'NO'}\n\n`

  if (resultado.error) {
    reporte += `❌ Error: ${resultado.error}\n\n`
  }

  if (resultado.detalles) {
    reporte += '📋 Detalles:\n'
    reporte += JSON.stringify(resultado.detalles, null, 2)
    reporte += '\n\n'
  }

  if (!resultado.backendReachable) {
    reporte += '💡 SOLUCIONES SUGERIDAS:\n\n'
    reporte += '1. Verifica que el backend esté corriendo:\n'
    reporte += '   cd backend && npm run start:dev\n\n'
    reporte += '2. Verifica que la IP sea correcta:\n'
    reporte += '   - Linux: hostname -I\n'
    reporte += '   - Mac: ipconfig getifaddr en0\n'
    reporte += '   - Windows: ipconfig\n\n'
    reporte += '3. Verifica que el backend esté escuchando en 0.0.0.0:\n'
    reporte += '   Debe decir: "Backend running on http://localhost:4000/api"\n\n'
    reporte += '4. Verifica que el firewall no esté bloqueando el puerto 4000:\n'
    reporte += '   sudo ufw allow 4000 (Linux)\n\n'
    reporte +=
      '5. Verifica que el dispositivo móvil y la computadora estén en la misma red WiFi\n\n'
  }

  return reporte
}








