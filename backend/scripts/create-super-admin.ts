/**
 * Script para crear usuario SUPER_ADMIN inicial
 * 
 * Uso:
 *   ts-node scripts/create-super-admin.ts <email> <password> <nombre>
 * 
 * Ejemplo:
 *   ts-node scripts/create-super-admin.ts tech@ministerio-amva.org MiPassword123 "Técnico AMVA"
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error('❌ Uso: ts-node scripts/create-super-admin.ts <email> <password> <nombre>')
    console.error('Ejemplo: ts-node scripts/create-super-admin.ts tech@ministerio-amva.org MiPassword123 "Técnico AMVA"')
    process.exit(1)
  }

  const [email, password, nombre] = args

  try {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.error(`❌ El email ${email} ya está registrado`)
      console.error(`   Usuario existente: ${existingUser.nombre} (${existingUser.rol})`)
      process.exit(1)
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      console.error('❌ La contraseña debe tener al menos 8 caracteres')
      process.exit(1)
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generar avatar por defecto
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=10b981&color=fff&size=128&bold=true`

    // Crear usuario SUPER_ADMIN
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol: 'SUPER_ADMIN',
        avatar: defaultAvatar,
        activo: true,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    })

    console.log('✅ Usuario SUPER_ADMIN creado exitosamente:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.nombre}`)
    console.log(`   Rol: ${user.rol}`)
    console.log(`   Activo: ${user.activo ? 'Sí' : 'No'}`)
    console.log(`   Creado: ${user.createdAt.toISOString()}`)
    console.log('')
    console.log('🔐 IMPORTANTE: Guarda estas credenciales en un lugar seguro')
    console.log(`   Email: ${email}`)
    console.log(`   Contraseña: ${password}`)
    console.log('')
    console.log('🚀 Ya puedes iniciar sesión con estas credenciales')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error al crear usuario SUPER_ADMIN:', errorMessage)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()

