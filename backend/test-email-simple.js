// Script simple para probar el envío de email
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

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

// Función para obtener variable de entorno
function getEnv(key, defaultValue) {
  return envVars[key] || process.env[key] || defaultValue
}

const emailConfig = {
  host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
  port: parseInt(getEnv('SMTP_PORT', '587')),
  secure: getEnv('SMTP_SECURE', 'false') === 'true',
  auth: {
    user: getEnv('SMTP_USER', ''),
    pass: (getEnv('SMTP_PASSWORD', '') || '').replace(/\s/g, ''),
  },
}

console.log('📧 Configuración SMTP:')
console.log(`   Host: ${emailConfig.host}`)
console.log(`   Port: ${emailConfig.port}`)
console.log(`   User: ${emailConfig.auth.user}`)
console.log(`   Password: ${emailConfig.auth.pass ? '***' + emailConfig.auth.pass.slice(-4) : 'NO CONFIGURADO'}`)
console.log('')

if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.error('❌ ERROR: SMTP_USER o SMTP_PASSWORD no están configurados')
  process.exit(1)
}

const transporter = nodemailer.createTransport(emailConfig)

// Probar conexión
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Error verificando conexión SMTP:')
    console.error(error)
    process.exit(1)
  } else {
    console.log('✅ Conexión SMTP verificada correctamente')
    console.log('')
    
    // Enviar email de prueba
    const mailOptions = {
      from: `"AMVA Digital" <${emailConfig.auth.user}>`,
      to: 'mariacarrillocastro81@gmail.com',
      subject: '🧪 Prueba de Email - AMVA Digital',
      html: `
        <h2>Prueba de Email</h2>
        <p>Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.</p>
        <p>Si recibes este email, la configuración está correcta ✅</p>
      `,
      text: 'Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.',
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('❌ Error enviando email:')
        console.error(error)
        process.exit(1)
      } else {
        console.log('✅ Email enviado exitosamente!')
        console.log(`   Message ID: ${info.messageId}`)
        console.log(`   Response: ${info.response}`)
        console.log('')
        console.log('📬 Revisa el correo mariacarrillocastro81@gmail.com')
      }
    })
  }
})

