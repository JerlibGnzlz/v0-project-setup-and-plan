/**
 * Script para activar una cuenta de pastor
 * Uso: npx ts-node scripts/activar-pastor.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activarPastor(email: string) {
  try {
    console.log(`🔍 Buscando pastor con email: ${email}`)

    const pastor = await prisma.pastor.findUnique({
      where: { email },
      include: {
        auth: true,
      },
    })

    if (!pastor) {
      console.error(`❌ No se encontró pastor con email: ${email}`)
      console.log('💡 Opciones:')
      console.log('   1. Crear cuenta nueva usando "Crear nueva cuenta" en la app móvil')
      console.log('   2. Usar login con Google (funciona para invitados)')
      process.exit(1)
    }

    console.log(`✅ Pastor encontrado: ${pastor.nombre} ${pastor.apellido}`)
    console.log(`   Estado actual: ${pastor.activo ? 'ACTIVO' : 'INACTIVO'}`)
    console.log(`   Tiene cuenta de autenticación: ${pastor.auth ? 'SÍ' : 'NO'}`)

    if (pastor.activo) {
      console.log('✅ El pastor ya está activo. No se necesita activar.')
      process.exit(0)
    }

    // Activar el pastor
    await prisma.pastor.update({
      where: { id: pastor.id },
      data: { activo: true },
    })

    console.log('✅ Pastor activado exitosamente')
    console.log('')
    console.log('📝 Próximos pasos:')
    if (!pastor.auth) {
      console.log('   1. Ve a la app móvil')
      console.log('   2. Haz clic en "Crear nueva cuenta"')
      console.log('   3. Completa el formulario con tu email y contraseña')
      console.log('   4. Luego podrás iniciar sesión')
    } else {
      console.log('   1. Ve a la app móvil')
      console.log('   2. Inicia sesión con tu email y contraseña')
      console.log('   3. Deberías poder entrar ahora')
    }

    process.exit(0)
  } catch (error: unknown) {
    console.error('❌ Error al activar pastor:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Obtener email del argumento de línea de comandos
const email = process.argv[2]

if (!email) {
  console.error('❌ Error: Debes proporcionar un email')
  console.log('')
  console.log('Uso: npx ts-node scripts/activar-pastor.ts <email>')
  console.log('Ejemplo: npx ts-node scripts/activar-pastor.ts jerlibgnzlz@gmail.com')
  process.exit(1)
}

void activarPastor(email)

