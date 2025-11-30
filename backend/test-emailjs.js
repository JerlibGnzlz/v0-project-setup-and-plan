// Script para probar EmailJS
const fs = require('fs')
const path = require('path')
const emailjs = require('@emailjs/nodejs')

// Leer .env manualmente
const envPath = path.join(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    // Remover comillas si las tiene
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    envVars[key] = value
  }
})

function getEnv(key, defaultValue) {
  return envVars[key] || process.env[key] || defaultValue
}

const privateKey = getEnv('EMAILJS_PRIVATE_KEY', '')
const publicKey = getEnv('EMAILJS_PUBLIC_KEY', '')
const serviceId = getEnv('EMAILJS_SERVICE_ID', '')
const templateId = getEnv('EMAILJS_TEMPLATE_ID', '')

// Para servidor, preferir Private Key
const apiKey = privateKey || publicKey

console.log('📧 Configuración EmailJS:')
console.log(`   ${privateKey ? 'Private Key' : 'Public Key'}: ${apiKey ? '***' + apiKey.slice(-4) : 'NO CONFIGURADO'}`)
console.log(`   Service ID: ${serviceId || 'NO CONFIGURADO'}`)
console.log(`   Template ID: ${templateId || 'NO CONFIGURADO'}`)
console.log('')

if (!apiKey || !serviceId || !templateId) {
  console.error('❌ ERROR: Faltan credenciales de EmailJS')
  console.error('   Configura EMAILJS_PRIVATE_KEY (o EMAILJS_PUBLIC_KEY), EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID en .env')
  console.error('   Obtén tus credenciales en: https://dashboard.emailjs.com/')
  console.error('')
  console.error('   IMPORTANTE: Para usar desde servidor, necesitas:')
  console.error('   1. Habilitar "Allow server-side API calls" en EmailJS dashboard')
  console.error('   2. Usar EMAILJS_PRIVATE_KEY en lugar de EMAILJS_PUBLIC_KEY')
  process.exit(1)
}

// Preparar datos para el template
const templateParams = {
  to_email: 'mariacarrillocastro81@gmail.com',
  to_name: 'Maria Carrillo',
  subject: '🧪 Prueba de Email - AMVA Digital (EmailJS)',
  message: 'Este es un email de prueba para verificar que EmailJS está funcionando correctamente.',
  html_content: `
    <h2>Prueba de Email - EmailJS</h2>
    <p>Este es un email de prueba para verificar que la configuración de EmailJS está funcionando correctamente.</p>
    <p>Si recibes este email, la configuración está correcta ✅</p>
    <p><strong>Servicio:</strong> EmailJS</p>
  `,
  tipo: 'test',
}

emailjs
  .send(serviceId, templateId, templateParams, {
    publicKey: apiKey, // Puede ser private o public key
  })
  .then((response) => {
    console.log('✅ Email enviado exitosamente!')
    console.log(`   Status: ${response.status}`)
    console.log(`   Text: ${response.text}`)
    console.log(`   To: mariacarrillocastro81@gmail.com`)
    console.log('')
    console.log('📬 Revisa el correo mariacarrillocastro81@gmail.com')
  })
  .catch((error) => {
    console.error('❌ Error enviando email:')
    console.error(`   Status: ${error.status || 'N/A'}`)
    console.error(`   Text: ${error.text || error.message}`)
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response)}`)
    }
    process.exit(1)
  })

