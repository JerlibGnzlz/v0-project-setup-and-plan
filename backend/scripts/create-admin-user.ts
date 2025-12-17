import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'admin@ministerio-amva.org'
    const password = 'admin123'
    const nombre = 'Administrador Principal'

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('✅ Usuario admin ya existe:')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Nombre: ${existingUser.nombre}`)
      console.log(`   Rol: ${existingUser.rol}`)
      console.log('\n💡 Si necesitas cambiar la contraseña, usa el script reset-admin-password.ts')
      return
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario admin
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol: 'ADMIN',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=10b981&color=fff&size=128&bold=true`,
      },
    })

    console.log('✅ Usuario admin creado exitosamente:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Nombre: ${adminUser.nombre}`)
    console.log(`   Rol: ${adminUser.rol}`)
    console.log(`   ID: ${adminUser.id}`)
    console.log('\n📝 Credenciales de acceso:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login')
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()











