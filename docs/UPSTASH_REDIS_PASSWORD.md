# 🔑 Obtener Password de Redis de Upstash

## ⚠️ Diferencia Importante

Upstash proporciona **dos tipos de conexión**:

1. **REST API** (lo que tienes):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - ❌ **NO funciona con Bull/Redis directo**

2. **Redis Directo** (lo que necesitas):
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` ← **Este es el que necesitas**

## 🔍 Cómo Obtener el Password de Redis

### Opción 1: Desde el Dashboard de Upstash

1. **Ve a**: https://console.upstash.com/
2. **Inicia sesión** en tu cuenta
3. **Selecciona tu base de datos Redis**: `striking-filly-6757`
4. **En la página de detalles**, busca la sección **"Redis"** (no "REST API")
5. **Verás**:
   - **Endpoint**: `striking-filly-6757.upstash.io`
   - **Port**: `6379`
   - **Password**: `AXXXXX...` ← **Este es el que necesitas**

6. **Si no ves el password**:
   - Haz clic en **"Show"** o **"Reveal"** junto al password
   - O busca en la sección **"Details"** → **"Redis"**

### Opción 2: El REST_TOKEN NO es el Password

El `UPSTASH_REDIS_REST_TOKEN` que tienes es para la REST API, **NO es el password de Redis**.

El password de Redis suele ser más largo y comienza con `A` seguido de una cadena larga.

## ⚙️ Configuración Correcta en Render

Una vez que tengas el **password de Redis** (no el REST token), configura en Render:

```env
REDIS_HOST=striking-filly-6757.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXXXXX... (el password de Redis, NO el REST token)
REDIS_DB=0
```

## 🔍 Dónde Encontrar el Password en Upstash

### En el Dashboard Web:

1. Ve a: https://console.upstash.com/
2. Selecciona tu base de datos
3. En la página de detalles, verás **dos secciones**:

   **Sección "REST API"** (lo que ya tienes):
   ```
   REST URL: https://striking-filly-6757.upstash.io
   REST Token: ARplAAImcDE0MGQ5Zjc1ZmI5NmM0YWQ2OGEyODVhMmM3OGEzZjcxZHAxNjc1Nw
   ```

   **Sección "Redis"** (lo que necesitas):
   ```
   Endpoint: striking-filly-6757.upstash.io
   Port: 6379
   Password: AeJhZXN0LTEuYW1hem9uYXdzLmVsYXN0aWNhY2hlLmNvbQAzNzY0NzQ4NzY2MDAwMDAwMDA
   ```

### Si No Ves la Sección "Redis":

1. Haz clic en **"Details"** o **"Show Details"**
2. Busca la pestaña o sección **"Redis"** (no "REST API")
3. El password puede estar oculto, haz clic en **"Show"** o **"Reveal"**

## 📝 Ejemplo de Configuración Completa

Una vez que tengas el password de Redis, en Render deberías tener:

```env
# Redis para Bull Queue (conexión directa)
REDIS_HOST=striking-filly-6757.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AeJhZXN0LTEuYW1hem9uYXdzLmVsYXN0aWNhY2hlLmNvbQAzNzY0NzQ4NzY2MDAwMDAwMDA
REDIS_DB=0
```

**NOTA**: Reemplaza el password de ejemplo con el password real que obtengas de Upstash.

## ✅ Verificar que Funciona

Después de configurar, revisa los logs en Render:

```
✅ Redis configurado - Habilitando cola de notificaciones con Bull
✅ Cola de notificaciones configurada (con Redis)
```

## 🚨 Si No Puedes Encontrar el Password

1. **Verifica que estés en la sección correcta**: Busca "Redis" no "REST API"
2. **Intenta crear una nueva base de datos**: A veces es más fácil ver el password al crearla
3. **Contacta soporte de Upstash**: Si realmente no puedes encontrarlo

## 💡 Alternativa: Usar REDIS_URL

Si tienes el password, también puedes usar una sola variable:

```env
REDIS_URL=redis://default:TU_PASSWORD_DE_REDIS@striking-filly-6757.upstash.io:6379
```

**IMPORTANTE**: Usa el password de Redis (no el REST token).

