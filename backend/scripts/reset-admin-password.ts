import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  const email = process.argv[2] || 'admin@ministerio-amva.org'
  const newPassword = process.argv[3] || 'admin123'

  try {
    console.log(`\n🔐 Reseteando contraseña para: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ Usuario no encontrado: ${email}`)
      process.exit(1)
    }

    if (user.rol !== 'ADMIN') {
      console.error(`❌ El usuario ${email} no es un administrador`)
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    console.log(`✅ Contraseña actualizada exitosamente`)
    console.log(`   Email: ${email}`)
    console.log(`   Nueva contraseña: ${newPassword}`)
    console.log(`   ⚠️  IMPORTANTE: Cambia esta contraseña después del login\n`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()

