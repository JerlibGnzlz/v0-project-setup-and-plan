#!/usr/bin/env ts-node

/**
 * Script de diagnóstico para Google OAuth
 * Verifica la configuración y estado de Google OAuth en el backend
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') })

console.log('🔍 DIAGNÓSTICO DE GOOGLE OAUTH\n')
console.log('=' .repeat(60))

// 1. Verificar variables de entorno
console.log('\n1️⃣ VERIFICANDO VARIABLES DE ENTORNO\n')

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL
const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'

console.log(`GOOGLE_CLIENT_ID: ${googleClientId ? `✅ Configurado (${googleClientId.substring(0, 30)}...)` : '❌ NO CONFIGURADO'}`)
console.log(`GOOGLE_CLIENT_SECRET: ${googleClientSecret ? `✅ Configurado (${googleClientSecret.length} caracteres)` : '❌ NO CONFIGURADO'}`)
console.log(`GOOGLE_CALLBACK_URL: ${googleCallbackUrl || '⚠️  No configurado (usará valor por defecto)'}`)
console.log(`BACKEND_URL: ${backendUrl}`)

// Construir callback URL completo
const callbackPath = googleCallbackUrl || '/api/auth/invitado/google/callback'
const fullCallbackUrl = callbackPath.startsWith('http')
  ? callbackPath
  : `${backendUrl}${callbackPath}`

console.log(`\nCallback URL completo: ${fullCallbackUrl}`)

// 2. Verificar formato de Client ID
console.log('\n2️⃣ VERIFICANDO FORMATO DE CLIENT ID\n')

if (googleClientId) {
  const isValidFormat = googleClientId.includes('.apps.googleusercontent.com')
  console.log(`Formato válido: ${isValidFormat ? '✅' : '❌'}`)
  
  if (!isValidFormat) {
    console.log('⚠️  El Client ID debe terminar en .apps.googleusercontent.com')
  }
  
  // Detectar tipo de Client ID
  if (googleClientId.includes('-c2e1gcjn06mg857rcvprns01fu8pduat')) {
    console.log('Tipo: Android Client ID (para app móvil)')
  } else if (googleClientId.includes('-slllh10l32onum338rg1776g8itekvco')) {
    console.log('Tipo: Web Client ID (para web)')
  } else {
    console.log('Tipo: Desconocido')
  }
} else {
  console.log('❌ No se puede verificar formato sin Client ID')
}

// 3. Verificar endpoints
console.log('\n3️⃣ VERIFICANDO ENDPOINTS\n')

const endpoints = {
  'Inicio Google OAuth': `${backendUrl}/api/auth/invitado/google`,
  'Callback Google OAuth': `${backendUrl}/api/auth/invitado/google/callback`,
  'Google Auth Mobile': `${backendUrl}/api/auth/invitado/google/mobile`,
}

for (const [name, url] of Object.entries(endpoints)) {
  console.log(`${name}: ${url}`)
}

// 4. Verificar configuración de Google Cloud Console
console.log('\n4️⃣ CHECKLIST DE GOOGLE CLOUD CONSOLE\n')

console.log('Verifica en Google Cloud Console:')
console.log('  □ OAuth consent screen está publicado')
console.log('  □ Authorized redirect URIs incluye:', fullCallbackUrl)
console.log('  □ Authorized JavaScript origins incluye:', backendUrl)
console.log('  □ Para Android: SHA-1 del keystore está configurado')
console.log('  □ Para Android: Package name es: org.vidaabundante.app')

// 5. Verificar app.json de móvil
console.log('\n5️⃣ VERIFICANDO CONFIGURACIÓN MÓVIL\n')

const appJsonPath = path.join(__dirname, '../../amva-mobile/app.json')
try {
  const appJson = require(appJsonPath)
  const mobileGoogleClientId = appJson?.expo?.extra?.googleClientId
  const mobileAndroidClientId = appJson?.expo?.extra?.googleAndroidClientId
  
  console.log(`Google Client ID (móvil): ${mobileGoogleClientId ? '✅ Configurado' : '❌ NO CONFIGURADO'}`)
  console.log(`Android Client ID (móvil): ${mobileAndroidClientId ? '✅ Configurado' : '❌ NO CONFIGURADO'}`)
  
  if (mobileGoogleClientId && googleClientId) {
    const coinciden = mobileGoogleClientId === googleClientId || mobileAndroidClientId === googleClientId
    console.log(`Coincidencia con backend: ${coinciden ? '✅' : '⚠️  Puede causar problemas'}`)
  }
} catch (error) {
  console.log('⚠️  No se pudo leer app.json de móvil')
}

// 6. Resumen y recomendaciones
console.log('\n6️⃣ RESUMEN Y RECOMENDACIONES\n')

const problemas: string[] = []

if (!googleClientId) {
  problemas.push('❌ GOOGLE_CLIENT_ID no está configurado')
}

if (!googleClientSecret) {
  problemas.push('❌ GOOGLE_CLIENT_SECRET no está configurado')
}

if (googleClientId && !googleClientId.includes('.apps.googleusercontent.com')) {
  problemas.push('⚠️  GOOGLE_CLIENT_ID tiene formato inválido')
}

if (problemas.length === 0) {
  console.log('✅ Configuración básica parece correcta')
  console.log('\nSi Google OAuth aún no funciona, verifica:')
  console.log('  1. Que las credenciales en Google Cloud Console sean válidas')
  console.log('  2. Que el callback URL esté autorizado en Google Cloud Console')
  console.log('  3. Que el OAuth consent screen esté publicado')
  console.log('  4. Para móvil: que el SHA-1 del keystore esté configurado')
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS:\n')
  problemas.forEach(p => console.log(`  ${p}`))
  console.log('\n📝 PASOS PARA RESOLVER:')
  console.log('  1. Ve a Google Cloud Console → Credentials')
  console.log('  2. Crea o verifica OAuth 2.0 Client ID')
  console.log('  3. Copia GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET')
  console.log('  4. Configúralos en las variables de entorno del backend')
  console.log('  5. Verifica que el callback URL esté autorizado')
}

console.log('\n' + '='.repeat(60))
console.log('\n📚 Documentación:')
console.log('  - docs/GOOGLE_OAUTH_SETUP.md')
console.log('  - docs/VERIFICAR_GOOGLE_CALLBACK_URLS.md')
console.log('  - amva-mobile/docs/GOOGLE_SIGNIN_NATIVE_SETUP.md')


