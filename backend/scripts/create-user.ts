import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createUser() {
  const email = process.argv[2] || 'zurisadai@ministerio-amva.org'
  const password = process.argv[3] || 'Cambiar123!'
  const nombre = process.argv[4] || 'Zurisadai'
  const rol = (process.argv[5] || 'EDITOR') as UserRole

  try {
    console.log(`🔐 Creando usuario: ${email}`)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`⚠️  El usuario ${email} ya existe`)
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Nombre: ${existingUser.nombre}`)
      console.log(`   Rol: ${existingUser.rol}`)
      return
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generar avatar por defecto
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=10b981&color=fff&size=128&bold=true`

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol,
        avatar: defaultAvatar,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatar: true,
        activo: true,
        createdAt: true,
      },
    })

    console.log(`✅ Usuario creado exitosamente:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.nombre}`)
    console.log(`   Rol: ${user.rol}`)
    console.log(`   Avatar: ${user.avatar}`)
    console.log(`   Activo: ${user.activo}`)
    console.log(`   Creado: ${user.createdAt}`)
    console.log(`\n📧 Credenciales:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`\n⚠️  IMPORTANTE: El usuario debe cambiar estas credenciales al iniciar sesión por primera vez.`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`❌ Error al crear usuario: ${errorMessage}`)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()

