import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function eliminarPastorAdmin() {
  try {
    console.log('🔍 Buscando "Administrador Principal" en la tabla de pastores...')

    // Buscar por nombre o email
    const pastoresAdmin = await prisma.pastor.findMany({
      where: {
        OR: [
          { nombre: { contains: 'Administrador Principal', mode: 'insensitive' } },
          { email: { contains: 'admin-admin@ministerio-amva.org', mode: 'insensitive' } },
          { email: { contains: 'admin@amva.org', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    })

    if (pastoresAdmin.length === 0) {
      console.log('✅ No se encontraron pastores con nombre o email de administrador')
      
      // Listar todos los pastores para debugging
      const todosPastores = await prisma.pastor.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
        },
        take: 10,
      })
      
      console.log('\n📋 Primeros 10 pastores en la base de datos:')
      todosPastores.forEach(p => {
        console.log(`   - ${p.nombre} ${p.apellido} (${p.email || 'sin email'})`)
      })
      
      return
    }

    console.log(`⚠️  Encontrados ${pastoresAdmin.length} pastor(es) con nombre o email de administrador:`)
    pastoresAdmin.forEach(p => {
      console.log(`   - ${p.nombre} ${p.apellido} (${p.email || 'sin email'})`)
    })

    // Eliminar los pastores encontrados
    for (const pastor of pastoresAdmin) {
      await prisma.pastor.delete({
        where: { id: pastor.id },
      })
      console.log(`✅ Eliminado: ${pastor.nombre} ${pastor.apellido} (${pastor.email || 'sin email'})`)
    }

    console.log(`\n✅ Proceso completado. Se eliminaron ${pastoresAdmin.length} registro(s).`)
  } catch (error) {
    console.error('❌ Error al eliminar pastor administrador:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

eliminarPastorAdmin()
  .then(() => {
    console.log('✅ Script ejecutado exitosamente')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

