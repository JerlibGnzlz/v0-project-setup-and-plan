# 🧪 Cómo Probar los Endpoints del Backend

## ✅ El Backend Está Funcionando

Si ves logs como estos en Render, significa que el backend está **funcionando correctamente**:

```
[Nest] 83 - DEBUG [Bootstrap] ✅ Request sin origin permitido
[Nest] 83 - WARN [GlobalExceptionFilter] Client Error
```

Los errores 404 que ves son **normales**:
- `Cannot GET /api` - `/api` es solo el prefijo, no un endpoint válido
- `Cannot GET /api/convenmciones` - Hay un typo, debería ser `/api/convenciones`

## 🚀 URL del Backend en Render

```
https://ministerio-backend-wdbj.onrender.com
```

## 📋 Endpoints Públicos (No Requieren Autenticación)

### 1. Convenciones

```bash
# Listar todas las convenciones
GET https://ministerio-backend-wdbj.onrender.com/api/convenciones

# Obtener convención activa
GET https://ministerio-backend-wdbj.onrender.com/api/convenciones/active

# Obtener una convención por ID
GET https://ministerio-backend-wdbj.onrender.com/api/convenciones/{id}
```

### 2. Pastores

```bash
# Listar pastores para landing
GET https://ministerio-backend-wdbj.onrender.com/api/pastores/landing

# Listar directiva
GET https://ministerio-backend-wdbj.onrender.com/api/pastores/directiva

# Listar supervisores
GET https://ministerio-backend-wdbj.onrender.com/api/pastores/supervisores
```

### 3. Noticias

```bash
# Listar noticias publicadas
GET https://ministerio-backend-wdbj.onrender.com/api/noticias/publicadas

# Listar noticias destacadas
GET https://ministerio-backend-wdbj.onrender.com/api/noticias/destacadas
```

### 4. Galería

```bash
# Listar imágenes de galería
GET https://ministerio-backend-wdbj.onrender.com/api/galeria
```

### 5. Mercado Pago Status

```bash
# Verificar estado de Mercado Pago
GET https://ministerio-backend-wdbj.onrender.com/api/mercado-pago/status
```

## 🔐 Endpoints Protegidos (Requieren JWT Token)

Estos endpoints requieren un token JWT en el header `Authorization: Bearer <token>`

### Autenticación

```bash
# Login (obtener token)
POST https://ministerio-backend-wdbj.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

# Obtener perfil (requiere token)
GET https://ministerio-backend-wdbj.onrender.com/api/auth/me
Authorization: Bearer <tu-token>
```

### Inscripciones

```bash
# Listar inscripciones (requiere token)
GET https://ministerio-backend-wdbj.onrender.com/api/inscripciones
Authorization: Bearer <tu-token>
```

### Pagos

```bash
# Listar pagos (requiere token)
GET https://ministerio-backend-wdbj.onrender.com/api/pagos
Authorization: Bearer <tu-token>
```

## 🧪 Usando el Script de Prueba

Ejecuta el script automatizado para probar todos los endpoints:

```bash
./scripts/test-endpoints.sh
```

O con una URL personalizada:

```bash
./scripts/test-endpoints.sh https://ministerio-backend-wdbj.onrender.com
```

## 🌐 Usando cURL

### Ejemplo: Probar endpoint público

```bash
curl https://ministerio-backend-wdbj.onrender.com/api/convenciones/active
```

### Ejemplo: Probar endpoint protegido

```bash
# Primero hacer login
curl -X POST https://ministerio-backend-wdbj.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Luego usar el token
curl https://ministerio-backend-wdbj.onrender.com/api/auth/me \
  -H "Authorization: Bearer <tu-token>"
```

## 🧪 Usando Postman

1. **Crear una nueva request**
2. **Seleccionar método** (GET, POST, etc.)
3. **Ingresar URL**: `https://ministerio-backend-wdbj.onrender.com/api/convenciones/active`
4. **Para endpoints protegidos**: 
   - Ve a la pestaña "Authorization"
   - Selecciona "Bearer Token"
   - Pega tu token JWT

## 🌐 Usando el Navegador

Para endpoints GET públicos, puedes probarlos directamente en el navegador:

```
https://ministerio-backend-wdbj.onrender.com/api/convenciones/active
https://ministerio-backend-wdbj.onrender.com/api/pastores/landing
https://ministerio-backend-wdbj.onrender.com/api/noticias/publicadas
```

## ✅ Verificar que el Backend Está Funcionando

### Test Rápido

```bash
# Debería responder con JSON de convenciones
curl https://ministerio-backend-wdbj.onrender.com/api/convenciones/active

# Debería responder con status de Mercado Pago
curl https://ministerio-backend-wdbj.onrender.com/api/mercado-pago/status
```

### Respuesta Esperada

Si el backend está funcionando, deberías ver:
- **Status 200** para endpoints públicos válidos
- **Status 401** para endpoints protegidos sin token
- **Status 404** para rutas que no existen

## 🐛 Troubleshooting

### Error: "Cannot GET /api"
- **Normal**: `/api` es solo el prefijo, no un endpoint válido
- **Solución**: Usa endpoints específicos como `/api/convenciones`

### Error: "Cannot GET /api/convenmciones"
- **Problema**: Typo en la URL (falta una 'i')
- **Solución**: Usa `/api/convenciones` (con 'i')

### Error: "401 Unauthorized"
- **Normal**: El endpoint requiere autenticación
- **Solución**: Obtén un token JWT haciendo login primero

### Error: "Connection refused" o timeout
- **Problema**: El backend no está corriendo o la URL es incorrecta
- **Solución**: Verifica que el servicio esté activo en Render

## 📝 Endpoints Completos

Para ver todos los endpoints disponibles, revisa los logs del backend al iniciar. Verás algo como:

```
[RouterExplorer] Mapped {/api/convenciones, GET} route
[RouterExplorer] Mapped {/api/convenciones/active, GET} route
[RouterExplorer] Mapped {/api/pastores/landing, GET} route
...
```

## 🔗 Recursos

- **Backend URL**: https://ministerio-backend-wdbj.onrender.com
- **Frontend URL**: https://v0-ministerio-amva.vercel.app
- **Render Dashboard**: https://dashboard.render.com

