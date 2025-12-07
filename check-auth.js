// Script para verificar estado de autenticación
// Ejecutar en la consola del navegador (F12)

console.log('🔐 VERIFICACIÓN DE AUTENTICACIÓN ADMIN\n')

// Verificar localStorage
const localToken = localStorage.getItem('auth_token')
const localUser = localStorage.getItem('auth_user')

// Verificar sessionStorage
const sessionToken = sessionStorage.getItem('auth_token')
const sessionUser = sessionStorage.getItem('auth_user')

console.log('📦 localStorage:')
console.log('  Token:', localToken ? '✅ Presente' : '❌ No encontrado')
console.log('  Usuario:', localUser ? '✅ Presente' : '❌ No encontrado')

console.log('\n📦 sessionStorage:')
console.log('  Token:', sessionToken ? '✅ Presente' : '❌ No encontrado')
console.log('  Usuario:', sessionUser ? '✅ Presente' : '❌ No encontrado')

// Mostrar información del usuario si existe
if (localUser || sessionUser) {
  try {
    const user = JSON.parse(localUser || sessionUser)
    console.log('\n👤 Información del Usuario:')
    console.log('  Email:', user.email)
    console.log('  Nombre:', user.nombre)
    console.log('  Rol:', user.rol)
    console.log('  ID:', user.id)
  } catch (e) {
    console.log('\n⚠️ Error al parsear usuario:', e)
  }
}

// Verificar si hay token
const hasToken = !!(localToken || sessionToken)
const hasUser = !!(localUser || sessionUser)

console.log('\n📊 RESUMEN:')
console.log('  Estado:', hasToken && hasUser ? '✅ AUTENTICADO' : '❌ NO AUTENTICADO')
console.log('  Token válido:', hasToken ? '✅ Sí' : '❌ No')
console.log('  Usuario guardado:', hasUser ? '✅ Sí' : '❌ No')

if (hasToken && hasUser) {
  console.log('\n✅ Estás logueado como admin')
} else {
  console.log('\n❌ No estás logueado. Ve a /admin/login')
}
