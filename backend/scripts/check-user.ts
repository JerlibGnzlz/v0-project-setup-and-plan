import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  const email = process.argv[2]

  if (!email) {
    console.log('❌ Por favor proporciona un email')
    console.log('Uso: npm run check:user <email>')
    process.exit(1)
  }

  try {
    console.log(`🔍 Buscando usuario: ${email}\n`)

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatar: true,
        activo: true,
        ultimoLogin: true,
        loginCount: true,
        ultimaIp: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`)
      console.log('\n💡 Puedes crear el usuario con:')
      console.log(`   npm run create:user ${email} <password> <nombre> <rol>`)
      return
    }

    console.log('✅ Usuario encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.nombre}`)
    console.log(`   Rol: ${user.rol}`)
    console.log(`   Activo: ${user.activo ? '✅ Sí' : '❌ No'}`)
    console.log(`   Avatar: ${user.avatar || 'No tiene'}`)
    console.log(`   Último login: ${user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleString() : 'Nunca'}`)
    console.log(`   Contador de logins: ${user.loginCount}`)
    console.log(`   Última IP: ${user.ultimaIp || 'N/A'}`)
    console.log(`   Creado: ${new Date(user.createdAt).toLocaleString()}`)
    console.log(`   Actualizado: ${new Date(user.updatedAt).toLocaleString()}`)
    
    const tieneCredencialesPorDefecto = user.email.endsWith('@ministerio-amva.org')
    if (tieneCredencialesPorDefecto) {
      console.log('\n⚠️  Este usuario tiene credenciales por defecto')
      console.log('   Debe cambiar su email y contraseña al iniciar sesión por primera vez')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`❌ Error al buscar usuario: ${errorMessage}`)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()

