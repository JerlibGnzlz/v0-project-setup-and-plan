import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function ensureAdmin() {
  const email = process.argv[2] || 'tecnico@gmail.com'
  const password = process.argv[3] || 'Jm151619!'
  const nombre = process.argv[4] || 'TECNICO-AMVA'

  try {
    console.log(`🔍 Verificando/creando administrador: ${email}\n`)

    // Buscar usuario existente
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        password: true,
      },
    })

    if (user) {
      console.log('✅ Usuario encontrado:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Nombre: ${user.nombre}`)
      console.log(`   Rol: ${user.rol}`)
      console.log(`   Activo: ${user.activo ? '✅ Sí' : '❌ No'}`)

      // Verificar si está activo, si no, activarlo
      if (user.activo === false) {
        console.log('\n⚠️  Usuario está desactivado. Activando...')
        await prisma.user.update({
          where: { id: user.id },
          data: { activo: true },
        })
        console.log('✅ Usuario activado')
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log('\n⚠️  La contraseña proporcionada no coincide con la almacenada.')
        console.log('💡 Actualizando contraseña...')
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        })
        console.log('✅ Contraseña actualizada')
      } else {
        console.log('\n✅ Contraseña correcta')
      }

      // Asegurar que el rol sea ADMIN
      if (user.rol !== 'ADMIN') {
        console.log(`\n⚠️  Usuario tiene rol ${user.rol}. Cambiando a ADMIN...`)
        await prisma.user.update({
          where: { id: user.id },
          data: { rol: 'ADMIN' },
        })
        console.log('✅ Rol cambiado a ADMIN')
      }

      console.log('\n📧 Credenciales de acceso:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      console.log('\n✅ Usuario listo para iniciar sesión')
    } else {
      console.log('❌ Usuario no encontrado. Creando nuevo administrador...\n')

      // Crear hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10)

      // Generar avatar por defecto
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=10b981&color=fff&size=128&bold=true`

      // Crear usuario
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          rol: 'ADMIN',
          avatar: defaultAvatar,
          activo: true,
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

      console.log('✅ Administrador creado exitosamente:')
      console.log(`   ID: ${newUser.id}`)
      console.log(`   Email: ${newUser.email}`)
      console.log(`   Nombre: ${newUser.nombre}`)
      console.log(`   Rol: ${newUser.rol}`)
      console.log(`   Activo: ${newUser.activo ? '✅ Sí' : '❌ No'}`)
      console.log(`   Avatar: ${newUser.avatar}`)
      console.log(`   Creado: ${newUser.createdAt.toLocaleString()}`)

      console.log('\n📧 Credenciales de acceso:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${password}`)
      console.log('\n✅ Usuario listo para iniciar sesión')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`❌ Error: ${errorMessage}`)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

ensureAdmin()

