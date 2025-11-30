import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import axios from 'axios'

const prisma = new PrismaClient()
const API_URL = 'http://localhost:4000/api'

async function testLoginFlow() {
  console.log('🔍 PROBANDO FLUJO DE LOGIN COMPLETO\n')
  console.log('=' .repeat(60))
  
  try {
    // PASO 1: Verificar usuario en base de datos
    console.log('\n📊 PASO 1: Verificando usuario en base de datos...')
    const user = await prisma.user.findUnique({
      where: { email: 'admin@ministerio-amva.org' },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        password: true,
      },
    })

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos')
      console.log('💡 Ejecuta: pnpm ts-node scripts/create-admin-user.ts')
      return
    }

    console.log('✅ Usuario encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.nombre}`)
    console.log(`   Rol: ${user.rol}`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)

    // PASO 2: Verificar contraseña
    console.log('\n🔐 PASO 2: Verificando contraseña...')
    const testPassword = 'admin123'
    const isPasswordValid = await bcrypt.compare(testPassword, user.password)
    console.log(`   Contraseña a probar: ${testPassword}`)
    console.log(`   Resultado: ${isPasswordValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`)

    if (!isPasswordValid) {
      console.log('❌ La contraseña no coincide')
      return
    }

    // PASO 3: Probar endpoint del backend
    console.log('\n🌐 PASO 3: Probando endpoint del backend...')
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: testPassword,
      }, {
        timeout: 5000,
      })

      console.log('✅ Login exitoso en el backend:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Tiene token: ${!!response.data.access_token}`)
      console.log(`   Tiene user: ${!!response.data.user}`)
      if (response.data.user) {
        console.log(`   User email: ${response.data.user.email}`)
        console.log(`   User nombre: ${response.data.user.nombre}`)
      }
      console.log(`   Token (primeros 20 chars): ${response.data.access_token?.substring(0, 20)}...`)

      // PASO 4: Verificar token con /auth/me
      console.log('\n🔑 PASO 4: Verificando token con /auth/me...')
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
          timeout: 5000,
        })
        console.log('✅ Token válido:')
        console.log(`   Status: ${meResponse.status}`)
        console.log(`   User: ${JSON.stringify(meResponse.data, null, 2)}`)
      } catch (meError: any) {
        console.log('❌ Error al validar token:')
        console.log(`   Status: ${meError.response?.status}`)
        console.log(`   Message: ${meError.response?.data?.message || meError.message}`)
      }

    } catch (apiError: any) {
      console.log('❌ Error en el endpoint del backend:')
      if (apiError.code === 'ECONNREFUSED') {
        console.log('   ⚠️  El backend no está corriendo en http://localhost:4000')
        console.log('   💡 Inicia el backend con: cd backend && pnpm start:dev')
      } else {
        console.log(`   Status: ${apiError.response?.status}`)
        console.log(`   Message: ${apiError.response?.data?.message || apiError.message}`)
        console.log(`   Data: ${JSON.stringify(apiError.response?.data, null, 2)}`)
      }
    }

  } catch (error: any) {
    console.error('❌ Error general:', error.message)
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Prueba completada\n')
}

testLoginFlow()

