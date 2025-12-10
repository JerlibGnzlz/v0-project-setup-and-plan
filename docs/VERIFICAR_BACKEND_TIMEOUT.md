# 🔍 Verificar Backend con Timeout

## 🐛 Problema

El login está dando timeout después de 10 segundos. El backend no está respondiendo.

## ✅ Verificaciones Necesarias

### 1. Verificar que el Backend Esté Online

Abre en tu navegador:
```
https://ministerio-backend-wdbj.onrender.com/api
```

Deberías ver un mensaje o un 404 (pero NO un error de conexión).

### 2. Probar el Endpoint de Login Directamente

Abre la consola del navegador y ejecuta:

```javascript
fetch('https://ministerio-backend-wdbj.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@ministerio-amva.org',
    password: 'tu-password'
  })
})
.then(response => {
  console.log('Status:', response.status)
  return response.json()
})
.then(data => {
  console.log('Response:', data)
})
.catch(error => {
  console.error('Error:', error)
})
```

### 3. Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que `NEXT_PUBLIC_API_URL` esté configurado como:
   ```
   https://ministerio-backend-wdbj.onrender.com/api
   ```
   (Con `/api` al final)

### 4. Verificar Logs del Backend en Render

1. Ve a tu servicio en Render
2. Abre la pestaña "Logs"
3. Busca errores o mensajes relacionados con `/auth/login`
4. Verifica que el backend esté recibiendo las peticiones

### 5. Verificar que el Backend Esté Respondiendo

Prueba con cURL desde tu terminal:

```bash
curl -X POST https://ministerio-backend-wdbj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org","password":"tu-password"}' \
  -v
```

El `-v` mostrará información detallada de la conexión.

## 🔧 Posibles Causas

### Causa 1: Backend Caído o No Responde

**Síntoma**: Timeout después de 10 segundos, no hay respuesta.

**Solución**:
1. Verifica que el servicio esté "Live" en Render
2. Reinicia el servicio si es necesario
3. Revisa los logs del backend

### Causa 2: URL Incorrecta

**Síntoma**: Timeout, pero el backend está funcionando.

**Solución**:
1. Verifica que `NEXT_PUBLIC_API_URL` en Vercel sea:
   ```
   https://ministerio-backend-wdbj.onrender.com/api
   ```
2. Asegúrate de que termine con `/api`

### Causa 3: Problema de Red/CORS

**Síntoma**: Timeout, pero el backend responde a otras peticiones.

**Solución**:
1. Revisa los logs del backend para ver si recibe la petición
2. Verifica la configuración de CORS en `backend/src/main.ts`
3. Asegúrate de que `FRONTEND_URL` esté configurado en Render

### Causa 4: Backend Tardando Demasiado

**Síntoma**: El backend responde pero tarda más de 10 segundos.

**Solución**:
1. Revisa los logs del backend para ver qué está tardando
2. Verifica que la base de datos esté respondiendo
3. Considera aumentar el timeout (aunque 10 segundos debería ser suficiente)

## 📋 Checklist de Diagnóstico

- [ ] Backend está "Live" en Render
- [ ] `NEXT_PUBLIC_API_URL` configurado correctamente en Vercel
- [ ] Backend responde a peticiones directas (cURL o fetch)
- [ ] No hay errores en los logs del backend
- [ ] CORS configurado correctamente
- [ ] `FRONTEND_URL` configurado en Render

## 🚀 Próximos Pasos

1. **Verifica que el backend esté online** en Render
2. **Prueba el endpoint directamente** con fetch o cURL
3. **Revisa los logs del backend** para ver si recibe la petición
4. **Verifica las variables de entorno** en Vercel y Render

## 📞 Si el Problema Persiste

1. Comparte los logs del backend en Render
2. Comparte el resultado de probar el endpoint directamente
3. Verifica que todas las variables de entorno estén correctas

