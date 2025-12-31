/**
 * Script para verificar la configuración de Resend
 * Ejecutar con: npm run verify:resend
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno desde el archivo .env en la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') })

console.log('🔍 Verificando configuración de Resend...\n')

// Verificar variables de entorno
const emailProvider = process.env.EMAIL_PROVIDER || 'auto'
const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const resendFromName = process.env.RESEND_FROM_NAME

console.log('📋 Variables de Entorno:')
console.log(`   EMAIL_PROVIDER: ${emailProvider}`)
console.log(`   RESEND_API_KEY: ${resendApiKey ? `✅ Configurado (${resendApiKey.substring(0, 10)}...)` : '❌ NO configurado'}`)
console.log(`   RESEND_FROM_EMAIL: ${resendFromEmail || '❌ NO configurado'}`)
console.log(`   RESEND_FROM_NAME: ${resendFromName || '⚠️ No configurado (opcional)'}`)
console.log('')

// Validar formato de API Key
if (resendApiKey) {
  if (resendApiKey.startsWith('re_')) {
    console.log('✅ Formato de API Key correcto (comienza con "re_")')
  } else {
    console.log('⚠️ Formato de API Key puede ser incorrecto (debe comenzar con "re_")')
  }
  if (resendApiKey.length < 30) {
    console.log('⚠️ API Key parece muy corta (debe tener ~40-50 caracteres)')
  }
} else {
  console.log('❌ RESEND_API_KEY no está configurado')
}

console.log('')

// Verificar configuración completa
let configurado = true
const problemas: string[] = []

if (!resendApiKey) {
  configurado = false
  problemas.push('RESEND_API_KEY no está configurado')
}

if (!resendFromEmail) {
  configurado = false
  problemas.push('RESEND_FROM_EMAIL no está configurado')
}

if (resendApiKey && !resendApiKey.startsWith('re_')) {
  configurado = false
  problemas.push('RESEND_API_KEY tiene formato incorrecto (debe comenzar con "re_")')
}

// Resultado
console.log('📊 Resultado de la Verificación:')
if (configurado) {
  console.log('✅ Resend está CONFIGURADO correctamente')
  console.log('')
  console.log('📝 Para usar Resend, asegúrate de que:')
  console.log('   1. EMAIL_PROVIDER=resend (o dejar en "auto" si Resend tiene prioridad)')
  console.log('   2. RESEND_API_KEY esté configurado en Render')
  console.log('   3. RESEND_FROM_EMAIL esté verificado en Resend Dashboard')
  console.log('   4. El servicio backend esté reiniciado en Render')
  console.log('')
  console.log('🧪 Para probar:')
  console.log('   - Reinicia el servicio en Render')
  console.log('   - Revisa los logs al iniciar')
  console.log('   - Deberías ver: "✅ Servicio de email configurado (Resend)"')
} else {
  console.log('❌ Resend NO está configurado correctamente')
  console.log('')
  console.log('⚠️ Problemas encontrados:')
  problemas.forEach((problema, index) => {
    console.log(`   ${index + 1}. ${problema}`)
  })
  console.log('')
  console.log('📝 Pasos para configurar Resend:')
  console.log('   1. Crea cuenta en https://resend.com')
  console.log('   2. Verifica tu email en Resend → Emails → Add Email')
  console.log('   3. Crea API Key en Resend → API Keys → Create API Key')
  console.log('   4. Configura en Render (Environment Variables):')
  console.log('      - EMAIL_PROVIDER=resend')
  console.log('      - RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  console.log('      - RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com')
  console.log('      - RESEND_FROM_NAME=AMVA Digital')
  console.log('   5. Reinicia el servicio en Render')
  console.log('')
  console.log('📖 Guía completa: docs/CONFIGURAR_RESEND_PRODUCCION.md')
}

console.log('')
console.log('💡 Nota: Este script verifica variables de entorno locales.')
console.log('   En producción (Render), verifica las variables en Render Dashboard.')

