# Despliegue de Endpoints de Invitado

## Problema

Los endpoints de invitado están dando error 404 en producción:
- `POST /api/auth/invitado/refresh` → 404 Not Found
- `GET /api/inscripciones/my` → 404 Not Found

## Causa

El backend en Render.com no tiene estos endpoints desplegados aún. Los cambios están en el código pero necesitan ser desplegados.

## Solución

### Opción 1: Despliegue Automático (Recomendado)

Render.com debería detectar automáticamente los cambios en el repositorio y desplegar. Verifica:

1. Ve a [Render.com Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio de backend
3. Ve a la pestaña "Events" o "Deploys"
4. Verifica que haya un deploy reciente después del último commit

### Opción 2: Despliegue Manual

Si el despliegue automático no funciona:

1. Ve a [Render.com Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio de backend
3. Haz clic en "Manual Deploy" → "Deploy latest commit"
4. Espera a que termine el despliegue (puede tomar 5-10 minutos)

### Opción 3: Verificar Endpoints Después del Despliegue

Una vez desplegado, puedes verificar que los endpoints estén disponibles:

```bash
# Ejecutar el script de verificación
cd backend
./scripts/verificar-endpoints.sh

# O verificar manualmente
curl -X POST https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"test"}'
```

**Respuesta esperada:**
- Si el endpoint existe: `401 Unauthorized` o `400 Bad Request` (porque el token es inválido, pero el endpoint existe)
- Si el endpoint NO existe: `404 Not Found`

## Endpoints que Deben Estar Disponibles

### Autenticación de Invitados
- ✅ `POST /api/auth/invitado/login` - Login de invitado
- ✅ `POST /api/auth/invitado/register` - Registro de invitado
- ✅ `POST /api/auth/invitado/refresh` - **Refresh token (NUEVO)**
- ✅ `POST /api/auth/invitado/google/mobile` - Login con Google
- ✅ `GET /api/auth/invitado/me` - Obtener perfil del invitado

### Inscripciones
- ✅ `GET /api/inscripciones/my` - **Mis inscripciones (NUEVO)**

### Credenciales
- ✅ `GET /api/credenciales-ministeriales/mis-credenciales` - Mis credenciales ministeriales
- ✅ `GET /api/credenciales-capellania/mis-credenciales` - Mis credenciales de capellanía

## Verificación en Código

Los endpoints están correctamente configurados en:

- **Controller**: `backend/src/modules/auth/invitado-auth.controller.ts` (línea 79)
- **Service**: `backend/src/modules/auth/invitado-auth.service.ts` (línea 262)
- **Module**: `backend/src/modules/auth/auth.module.ts` (línea 28)

## Commits Relevantes

- `0d01d76` - feat: Agregar endpoint de refresh token para invitados
- `815da43` - feat: Agregar endpoint GET /inscripciones/my para invitados

## Próximos Pasos

1. ✅ Verificar que Render.com esté desplegando automáticamente
2. ✅ Si no, hacer despliegue manual
3. ✅ Verificar endpoints con el script de verificación
4. ✅ Probar desde la app móvil

## Notas

- El despliegue en Render.com puede tomar 5-10 minutos
- Los endpoints protegidos darán `401 Unauthorized` sin token (esto es correcto)
- Si después del despliegue sigue dando 404, verificar los logs de Render.com

