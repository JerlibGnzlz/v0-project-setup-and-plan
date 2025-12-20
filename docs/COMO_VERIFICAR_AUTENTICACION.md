# 🔐 Cómo Verificar si Estás Logueado como Admin

## Método 1: Verificar en la Consola del Navegador (Más Rápido)

1. **Abre la consola del navegador:**
   - Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux)
   - O `Cmd+Option+I` (Mac)
   - Ve a la pestaña "Console"

2. **Ejecuta este código:**
```javascript
// Verificar localStorage
const localToken = localStorage.getItem('auth_token')
const localUser = localStorage.getItem('auth_user')

// Verificar sessionStorage
const sessionToken = sessionStorage.getItem('auth_token')
const sessionUser = sessionStorage.getItem('auth_user')

console.log('🔐 ESTADO DE AUTENTICACIÓN:')
console.log('Token (localStorage):', localToken ? '✅ Presente' : '❌ No encontrado')
console.log('Token (sessionStorage):', sessionToken ? '✅ Presente' : '❌ No encontrado')

if (localUser || sessionUser) {
  const user = JSON.parse(localUser || sessionUser)
  console.log('\n👤 Usuario:')
  console.log('  Email:', user.email)
  console.log('  Nombre:', user.nombre)
  console.log('  Rol:', user.rol)
}

const isAuthenticated = !!(localToken || sessionToken) && !!(localUser || sessionUser)
console.log('\n📊 Estado:', isAuthenticated ? '✅ AUTENTICADO' : '❌ NO AUTENTICADO')
```

## Método 2: Verificar Visualmente en la Interfaz

1. **Ve a cualquier página del admin:**
   - `/admin` (Dashboard)
   - `/admin/pagos`
   - `/admin/inscripciones`
   - etc.

2. **Si estás autenticado, verás:**
   - ✅ El sidebar con todas las opciones
   - ✅ Tu nombre/email en el header (arriba a la derecha)
   - ✅ La campanita de notificaciones
   - ✅ El botón de logout

3. **Si NO estás autenticado:**
   - ❌ Serás redirigido automáticamente a `/admin/login`
   - ❌ Verás la página de login

## Método 3: Verificar en las DevTools (Application Tab)

1. **Abre DevTools** (`F12`)
2. **Ve a la pestaña "Application"** (o "Almacenamiento" en Firefox)
3. **En el menú lateral, busca:**
   - **Local Storage** → `http://localhost:3000` (o tu dominio)
   - **Session Storage** → `http://localhost:3000`

4. **Busca estas claves:**
   - `auth_token` → Debe tener un valor (token JWT)
   - `auth_user` → Debe tener un objeto JSON con tu información

## Método 4: Verificar el Token JWT

Si quieres verificar que el token es válido:

```javascript
// En la consola del navegador
const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

if (token) {
  // Decodificar el token (solo para verificar, no para autenticación)
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token expira en:', new Date(payload.exp * 1000))
  console.log('Usuario ID:', payload.sub)
  console.log('Token válido hasta:', new Date(payload.exp * 1000).toLocaleString())
} else {
  console.log('❌ No hay token')
}
```

## Solución de Problemas

### Si no estás autenticado:

1. **Ve a `/admin/login`**
2. **Ingresa tus credenciales:**
   - Email de admin
   - Contraseña
3. **Marca "Recordarme"** si quieres que la sesión persista
4. **Haz clic en "Iniciar Sesión"**

### Si el token expiró:

1. **Cierra sesión** (botón logout)
2. **Vuelve a iniciar sesión**

### Si hay problemas con el storage:

1. **Limpia el storage:**
```javascript
// En la consola del navegador
localStorage.clear()
sessionStorage.clear()
location.reload()
```

2. **Vuelve a iniciar sesión**

## Verificar Estado en el Código

El estado de autenticación se guarda en:
- **Zustand Store**: `lib/hooks/use-auth.ts`
- **localStorage/sessionStorage**: Depende de si marcaste "Recordarme"

El layout del admin (`app/admin/layout.tsx`) verifica automáticamente la autenticación y redirige a `/admin/login` si no estás autenticado.

---

**Última actualización:** Diciembre 2024















