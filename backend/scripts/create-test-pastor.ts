/**
 * Script para crear un pastor de prueba con cuenta de autenticación
 * Uso: npx ts-node scripts/create-test-pastor.ts
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creando pastor de prueba...')

  // Datos del pastor de prueba
  const email = 'pastor.test@ministerio.org'
  const password = 'Test1234' // Mínimo 8 caracteres, mayúscula, minúscula, número
  const nombre = 'Pastor'
  const apellido = 'Prueba'

  try {
    // 1. Verificar si el pastor ya existe
    let pastor = await prisma.pastor.findUnique({
      where: { email },
    })

    if (!pastor) {
      // 2. Crear el pastor si no existe
      pastor = await prisma.pastor.create({
        data: {
          nombre,
          apellido,
          email,
          telefono: '+54 11 0000-0000',
          tipo: 'PASTOR',
          cargo: 'Pastor de Prueba',
          sede: 'Buenos Aires',
          activo: true,
        },
      })
      console.log('✅ Pastor creado:', pastor.email)
    } else {
      console.log('ℹ️  Pastor ya existe:', pastor.email)
    }

    // 3. Verificar si ya tiene cuenta de autenticación
    const existingAuth = await prisma.pastorAuth.findUnique({
      where: { email },
    })

    if (existingAuth) {
      console.log('⚠️  Ya existe una cuenta de autenticación para este email')
      console.log('   Puedes hacer login con:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      return
    }

    // 4. Crear cuenta de autenticación
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.pastorAuth.create({
      data: {
        pastorId: pastor.id,
        email: pastor.email!,
        password: hashedPassword,
        emailVerificado: true,
      },
    })

    console.log('✅ Cuenta de autenticación creada')
    console.log('\n📱 Datos para login en la app móvil:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Email:    ${email}`)
    console.log(`   Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✅ Listo! Ya puedes hacer login en la app móvil')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()





