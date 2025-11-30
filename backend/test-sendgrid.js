// Script para probar SendGrid
const fs = require('fs')
const path = require('path')
const sgMail = require('@sendgrid/mail')

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

const sendGridApiKey = getEnv('SENDGRID_API_KEY', '')
const fromEmail = getEnv('SENDGRID_FROM_EMAIL', getEnv('SMTP_USER', ''))

console.log('📧 Configuración SendGrid:')
console.log(`   API Key: ${sendGridApiKey ? '***' + sendGridApiKey.slice(-4) : 'NO CONFIGURADO'}`)
console.log(`   From Email: ${fromEmail || 'NO CONFIGURADO'}`)
console.log('')

if (!sendGridApiKey) {
  console.error('❌ ERROR: SENDGRID_API_KEY no está configurado')
  console.error('   Obtén tu API Key en: https://app.sendgrid.com/settings/api_keys')
  process.exit(1)
}

if (!fromEmail) {
  console.error('❌ ERROR: SENDGRID_FROM_EMAIL no está configurado')
  console.error('   Configura SENDGRID_FROM_EMAIL en .env con un email verificado en SendGrid')
  process.exit(1)
}

// Configurar SendGrid
sgMail.setApiKey(sendGridApiKey)

// Enviar email de prueba
const msg = {
  to: 'mariacarrillocastro81@gmail.com',
  from: {
    email: fromEmail,
    name: 'AMVA Digital',
  },
  subject: '🧪 Prueba de Email - AMVA Digital (SendGrid)',
  text: 'Este es un email de prueba para verificar que SendGrid está funcionando correctamente.',
  html: `
    <h2>Prueba de Email - SendGrid</h2>
    <p>Este es un email de prueba para verificar que la configuración de SendGrid está funcionando correctamente.</p>
    <p>Si recibes este email, la configuración está correcta ✅</p>
    <p><strong>Servicio:</strong> SendGrid</p>
    <p><strong>From:</strong> ${fromEmail}</p>
  `,
}

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email enviado exitosamente!')
    console.log(`   To: mariacarrillocastro81@gmail.com`)
    console.log(`   From: ${fromEmail}`)
    console.log('')
    console.log('📬 Revisa el correo mariacarrillocastro81@gmail.com')
  })
  .catch((error) => {
    console.error('❌ Error enviando email:')
    console.error(error.response?.body || error.message)
    if (error.response?.body?.errors) {
      error.response.body.errors.forEach((err) => {
        console.error(`   - ${err.message}`)
      })
    }
    process.exit(1)
  })

