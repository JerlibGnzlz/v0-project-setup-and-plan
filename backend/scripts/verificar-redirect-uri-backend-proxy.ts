/**
 * Script para verificar qué redirect URI está generando el backend
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') })

const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
const googleClientId = process.env.GOOGLE_CLIENT_ID

console.log('🔍 Verificación de Redirect URI para Backend Proxy\n')
console.log('='.repeat(60))
console.log('📋 Configuración Actual:')
console.log('='.repeat(60))
console.log(`BACKEND_URL: ${backendUrl}`)
console.log(`API_URL: ${process.env.API_URL || 'NO CONFIGURADO'}`)
console.log(`GOOGLE_CLIENT_ID: ${googleClientId ? googleClientId.substring(0, 30) + '...' : 'NO CONFIGURADO'}`)
console.log('')

// Construir el redirect URI que usa el backend
const callbackUrl = `${backendUrl}/api/auth/invitado/google/callback-proxy`

console.log('='.repeat(60))
console.log('🔗 Redirect URI que usa el Backend:')
console.log('='.repeat(60))
console.log(callbackUrl)
console.log('')

console.log('='.repeat(60))
console.log('✅ Acción Requerida:')
console.log('='.repeat(60))
console.log('Agrega este redirect URI en Google Cloud Console:')
console.log('')
console.log(`  ${callbackUrl}`)
console.log('')
console.log('Pasos:')
console.log('1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth')
console.log('2. Busca el cliente OAuth Web')
console.log('3. Edita el cliente')
console.log('4. En "URIs de redireccionamiento autorizados", agrega:')
console.log(`   ${callbackUrl}`)
console.log('5. Guarda los cambios')
console.log('')
console.log('⚠️  IMPORTANTE:')
console.log('- El redirect URI debe ser EXACTAMENTE igual')
console.log('- Debe incluir https:// (no http://)')
console.log('- No debe tener trailing slash (/) al final')
console.log('- No debe tener query parameters')
console.log('')

// Verificar si hay otros redirect URIs configurados
console.log('='.repeat(60))
console.log('📝 Otros Redirect URIs que podrían estar configurados:')
console.log('='.repeat(60))
console.log('Para verificar, revisa Google Cloud Console:')
console.log('https://console.cloud.google.com/apis/credentials?project=amva-auth')
console.log('')

