# 🔍 Diagnosticar Problema de Login Admin en Producción

## 🐛 Problema Reportado

- El admin se sale al login automáticamente
- Al intentar iniciar sesión, se queda en "Iniciando sesión..."
- No redirige al dashboard después del login

## ✅ Cambios Aplicados

1. **Mejorado manejo de redirección**: Usar `window.location.href` en lugar de `router.push` para forzar recarga completa
2. **Mejorado logging**: Agregados `console.log` para debugging en producción
3. **Mejorado manejo de errores**: Mensajes más claros para errores de red
4. **Delay antes de redirigir**: Pequeño delay para asegurar que el toast se muestre

## 🔧 Verificaciones Necesarias

### 1. Verificar Variables de Entorno en Vercel

Asegúrate de que estas variables estén configuradas en Vercel:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
```

**Cómo verificar:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente
4. Debe apuntar a tu backend en Render (con `/api` al final)

### 2. Verificar que el Backend Esté Funcionando

Abre la consola del navegador (F12) y busca estos logs:

**Al cargar la página de login:**
```
[useAuth] Iniciando proceso de login...
[authApi] Enviando petición de login: { email: "..." }
```

**Si hay error de red:**
```
[apiClient] Error de red detectado
[apiClient] Mensaje: Network Error
[apiClient] API URL: https://tu-backend.onrender.com/api
```

**Si el login es exitoso:**
```
[useAuth] Respuesta del servidor recibida: { hasToken: true, hasUser: true }
[useAuth] Token y usuario guardados en localStorage
[AdminLogin] Login exitoso, redirigiendo...
```

### 3. Verificar CORS en el Backend

El backend debe permitir requests desde tu dominio de Vercel:

```typescript
// backend/src/main.ts
const allowedOrigins = [
  'https://v0-ministerio-amva.vercel.app',
  'https://tu-dominio.vercel.app',
  // ... otros orígenes
]
```

### 4. Verificar que el Token se Guarde Correctamente

Abre la consola del navegador y ejecuta:

```javascript
// Verificar token en localStorage
console.log('Token:', localStorage.getItem('auth_token'))
console.log('User:', localStorage.getItem('auth_user'))

// Verificar token en sessionStorage
console.log('Token (session):', sessionStorage.getItem('auth_token'))
console.log('User (session):', sessionStorage.getItem('auth_user'))
```

### 5. Verificar que el Backend Responda Correctamente

Prueba el endpoint de login directamente:

```bash
curl -X POST https://tu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org","password":"tu-password"}'
```

Deberías recibir:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@ministerio-amva.org",
    "nombre": "Admin",
    "rol": "admin"
  }
}
```

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Se queda en Iniciando sesión..."

**Causa**: El login está fallando silenciosamente o el backend no responde.

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Busca errores en la pestaña "Network" (petición a `/api/auth/login`)
4. Verifica que `NEXT_PUBLIC_API_URL` esté correcto en Vercel

### Problema 2: "Se sale automáticamente al login"

**Causa**: El token expiró o el `checkAuth` está fallando.

**Solución**:
1. Verifica que el token esté en `localStorage` o `sessionStorage`
2. Verifica que el backend esté respondiendo a `/api/auth/me`
3. Revisa los logs del backend en Render

### Problema 3: "Error de red" o "No se pudo conectar"

**Causa**: El backend no está accesible o hay problema de CORS.

**Solución**:
1. Verifica que el backend esté online en Render
2. Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto
3. Verifica que CORS esté configurado correctamente en el backend

### Problema 4: "401 Unauthorized"

**Causa**: Credenciales incorrectas o token inválido.

**Solución**:
1. Verifica que las credenciales sean correctas
2. Limpia `localStorage` y `sessionStorage`:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```
3. Intenta iniciar sesión nuevamente

## 📋 Checklist de Diagnóstico

- [ ] `NEXT_PUBLIC_API_URL` configurado en Vercel
- [ ] Backend online y accesible
- [ ] CORS configurado correctamente en backend
- [ ] Token se guarda en `localStorage` o `sessionStorage`
- [ ] No hay errores en la consola del navegador
- [ ] El endpoint `/api/auth/login` responde correctamente
- [ ] El endpoint `/api/auth/me` responde correctamente con token válido

## 🔍 Logs a Revisar

### En el Navegador (Consola)

```
[AdminLogin] Iniciando login...
[authApi] Enviando petición de login: { email: "..." }
[useAuth] Respuesta del servidor recibida: { hasToken: true, hasUser: true }
[useAuth] Token y usuario guardados en localStorage
[AdminLogin] Login exitoso, redirigiendo...
```

### En el Backend (Render Logs)

```
✅ Origin permitido: https://v0-ministerio-amva.vercel.app
POST /api/auth/login 200
```

## 🚀 Próximos Pasos

1. **Desplegar los cambios** en Vercel (ya están en `main`)
2. **Abrir la consola del navegador** (F12) al intentar iniciar sesión
3. **Revisar los logs** para identificar dónde falla
4. **Verificar variables de entorno** en Vercel
5. **Probar el login** nuevamente

## 📞 Si el Problema Persiste

1. Comparte los logs de la consola del navegador
2. Comparte los logs del backend en Render
3. Verifica que todas las variables de entorno estén correctas
4. Prueba el endpoint de login directamente con cURL o Postman

