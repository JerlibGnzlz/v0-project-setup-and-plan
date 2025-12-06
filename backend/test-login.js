const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    // Buscar usuarios admin
    const users = await prisma.user.findMany({
      where: { rol: 'ADMIN' },
      take: 5,
    })

    console.log('Usuarios admin encontrados:', users.length)
    users.forEach(u => {
      console.log(`- ${u.email} (${u.nombre})`)
    })

    // Si no hay usuarios, crear uno de prueba
    if (users.length === 0) {
      console.log('\nNo hay usuarios admin. Creando uno de prueba...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@amva.com',
          password: hashedPassword,
          nombre: 'Administrador',
          rol: 'ADMIN',
          avatar:
            'https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&size=128&bold=true',
        },
      })
      console.log('Usuario creado:', newUser.email)
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
