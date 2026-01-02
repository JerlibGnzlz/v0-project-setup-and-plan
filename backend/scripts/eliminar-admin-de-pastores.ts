import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function eliminarAdminDePastores() {
  try {
    console.log('🔍 Buscando administradores en la tabla de pastores...')

    // Obtener todos los emails de usuarios administrativos
    const adminUsers = await prisma.user.findMany({
      select: { email: true },
    })
    const adminEmails = adminUsers.map(u => u.email).filter((email): email is string => !!email)

    console.log(`📧 Emails de administradores encontrados: ${adminEmails.join(', ')}`)

    if (adminEmails.length === 0) {
      console.log('✅ No hay usuarios administrativos en la base de datos')
      return
    }

    // Buscar pastores cuyo email coincida con administradores
    const pastoresAdmin = await prisma.pastor.findMany({
      where: {
        email: {
          in: adminEmails,
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    })

    if (pastoresAdmin.length === 0) {
      console.log('✅ No se encontraron pastores con emails de administradores')
      return
    }

    console.log(`⚠️  Encontrados ${pastoresAdmin.length} pastor(es) con emails de administradores:`)
    pastoresAdmin.forEach(p => {
      console.log(`   - ${p.nombre} ${p.apellido} (${p.email})`)
    })

    // Eliminar los pastores encontrados
    for (const pastor of pastoresAdmin) {
      await prisma.pastor.delete({
        where: { id: pastor.id },
      })
      console.log(`✅ Eliminado: ${pastor.nombre} ${pastor.apellido} (${pastor.email})`)
    }

    console.log(`\n✅ Proceso completado. Se eliminaron ${pastoresAdmin.length} registro(s).`)
  } catch (error) {
    console.error('❌ Error al eliminar administradores de pastores:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

eliminarAdminDePastores()
  .then(() => {
    console.log('✅ Script ejecutado exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

