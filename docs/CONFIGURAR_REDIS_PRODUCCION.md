# 🔴 Configurar Redis/Bull para Producción

## 📋 ¿Qué es Redis y por qué usarlo?

**Redis** es una base de datos en memoria que se usa como cola de mensajes para procesar notificaciones de forma asíncrona.

**Bull** es una librería de Node.js que usa Redis para crear colas de trabajos.

### Ventajas de usar Redis/Bull:

✅ **Procesamiento asíncrono**: Las notificaciones se procesan en segundo plano  
✅ **Reintentos automáticos**: Si falla un email, se reintenta automáticamente  
✅ **Escalabilidad**: Puede manejar miles de notificaciones sin bloquear el servidor  
✅ **Monitoreo**: Puedes ver el estado de las colas y trabajos  
✅ **Confiabilidad**: Los trabajos no se pierden si el servidor se reinicia  

## 🚀 Opciones para Configurar Redis en Producción

### Opción 1: Redis Cloud (Recomendado - Gratis hasta 30MB)

**Ventajas:**
- ✅ Gratis hasta 30MB (suficiente para colas)
- ✅ Fácil de configurar
- ✅ No requiere servidor propio
- ✅ Alta disponibilidad

**Pasos:**

1. **Crear cuenta en Redis Cloud**:
   - Ve a: https://redis.com/try-free/
   - Crea una cuenta gratuita
   - Selecciona el plan "Free" (30MB)

2. **Crear una base de datos**:
   - Haz clic en "New Database"
   - Selecciona:
     - **Cloud Provider**: AWS, GCP, o Azure (el más cercano a tu región)
     - **Region**: Elige la región más cercana a Render
     - **Name**: `amva-notifications` (o el nombre que prefieras)
   - Haz clic en "Activate"

3. **Obtener credenciales**:
   - Una vez creada, verás:
     - **Public endpoint**: `redis-xxxxx.cloud.redislabs.com:12345`
     - **Password**: (se muestra solo una vez, cópialo)

4. **Configurar en Render**:
   - Ve a: Render Dashboard → Tu servicio → Environment
   - Agrega estas variables:

```env
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=tu-password-de-redis-cloud
REDIS_DB=0
```

**O usando REDIS_URL (alternativa):**

```env
REDIS_URL=redis://:tu-password@redis-xxxxx.cloud.redislabs.com:12345
```

### Opción 2: Upstash Redis (Recomendado - Gratis hasta 10K comandos/día)

**Ventajas:**
- ✅ Gratis hasta 10,000 comandos por día
- ✅ Muy fácil de configurar
- ✅ Serverless (no requiere mantenimiento)
- ✅ Excelente para producción pequeña/mediana

**Pasos:**

1. **Crear cuenta en Upstash**:
   - Ve a: https://upstash.com/
   - Crea una cuenta gratuita
   - Haz clic en "Create Database"

2. **Crear base de datos**:
   - **Name**: `amva-notifications`
   - **Type**: Regional (o Global si necesitas múltiples regiones)
   - **Region**: Elige la más cercana a Render
   - Haz clic en "Create"

3. **Obtener credenciales**:
   - Una vez creada, verás:
     - **Endpoint**: `xxxxx.upstash.io`
     - **Port**: `6379` (o el que muestre)
     - **Password**: (se muestra solo una vez)

4. **Configurar en Render**:

```env
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-password-de-upstash
REDIS_DB=0
```

**O usando REDIS_URL:**

```env
REDIS_URL=redis://default:tu-password@xxxxx.upstash.io:6379
```

### Opción 3: Render Redis (Integrado con Render)

**Ventajas:**
- ✅ Integrado con Render
- ✅ Fácil de configurar
- ✅ Mismo dashboard

**Desventajas:**
- ⚠️ Requiere plan de pago (no hay tier gratuito)

**Pasos:**

1. **Crear servicio Redis en Render**:
   - Ve a: Render Dashboard
   - Haz clic en "New +" → "Redis"
   - Selecciona:
     - **Name**: `amva-redis`
     - **Plan**: Elige el plan que necesites
   - Haz clic en "Create Redis"

2. **Obtener credenciales**:
   - Una vez creado, Render te mostrará:
     - **Internal Redis URL**: `redis://amva-redis:xxxxx@dpg-xxxxx-a:6379`
     - **External Redis URL**: (si necesitas acceso externo)

3. **Configurar en tu servicio backend**:
   - Ve a: Tu servicio backend → Environment
   - Agrega:

```env
REDIS_URL=redis://amva-redis:xxxxx@dpg-xxxxx-a:6379
```

**O separado:**

```env
REDIS_HOST=dpg-xxxxx-a
REDIS_PORT=6379
REDIS_PASSWORD=xxxxx
REDIS_DB=0
```

### Opción 4: Railway Redis (Alternativa)

**Ventajas:**
- ✅ Plan gratuito disponible
- ✅ Fácil de usar

**Pasos:**

1. Ve a: https://railway.app/
2. Crea un proyecto
3. Agrega un servicio Redis
4. Obtén las credenciales y configúralas en Render

## 🔧 Configuración en Render

### Paso 1: Agregar Variables de Entorno

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio: `ministerio-backend`
3. Ve a: **Environment** (Variables de entorno)
4. Agrega las variables según la opción que elegiste:

**Opción A: Usando variables separadas (Recomendado)**

```env
REDIS_HOST=tu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=tu-password
REDIS_DB=0
```

**Opción B: Usando REDIS_URL (Alternativa)**

```env
REDIS_URL=redis://:password@host:port
```

**O con usuario:**

```env
REDIS_URL=redis://default:password@host:port
```

### Paso 2: Reiniciar el Servicio

1. En Render Dashboard → Tu servicio
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O espera a que Render detecte los cambios automáticamente

## ✅ Verificar que Funciona

### 1. Revisar Logs al Iniciar

En Render Dashboard → Tu servicio → Logs, deberías ver:

```
✅ Redis configurado - Habilitando cola de notificaciones con Bull
✅ Cola de notificaciones configurada (con Redis)
```

**Si ves esto, Redis está configurado correctamente.**

### 2. Probar una Notificación

1. Crea una inscripción o valida un pago
2. Revisa los logs, deberías ver:

```
📬 Evento recibido: INSCRIPCION_CREADA para usuario@email.com
✅ Notificación encolada para usuario@email.com (tipo: inscripcion.creada)
📬 Procesando notificación inscripcion_creada para usuario@email.com (Job ID: 1)
📧 Email enviado para usuario@email.com
✅ Notificación inscripcion.creada procesada exitosamente para usuario@email.com
```

### 3. Verificar que el Email Llegó

- Revisa la bandeja de entrada del usuario
- Si no está, revisa la carpeta de Spam

## 🚨 Troubleshooting

### Error: "Error connecting to Redis"

**Causa**: Credenciales incorrectas o Redis no accesible

**Solución**:
1. Verifica que `REDIS_HOST` sea correcto
2. Verifica que `REDIS_PORT` sea correcto
3. Verifica que `REDIS_PASSWORD` sea correcto
4. Verifica que Redis esté accesible desde Render (no bloqueado por firewall)

### Error: "Redis connection timeout"

**Causa**: Redis no está accesible o está bloqueado

**Solución**:
1. Verifica que Redis permita conexiones desde Render
2. Si usas Redis Cloud o Upstash, verifica que la IP de Render esté permitida
3. Algunos servicios Redis requieren whitelist de IPs

### Error: "Invalid password"

**Causa**: Password incorrecto

**Solución**:
1. Verifica que `REDIS_PASSWORD` sea correcto
2. Asegúrate de que no tenga espacios al inicio o final
3. Si usas `REDIS_URL`, verifica el formato: `redis://:password@host:port`

### Las notificaciones se procesan directamente (sin cola)

**Causa**: Redis no está configurado o no está disponible

**Solución**:
1. Verifica que las variables de entorno estén configuradas
2. Verifica que Redis esté accesible
3. Revisa los logs para ver si hay errores de conexión

## 📊 Monitoreo de la Cola

### Ver trabajos en la cola (desde código)

Puedes agregar un endpoint para monitorear la cola:

```typescript
// En notifications.controller.ts
@Get('queue/stats')
@UseGuards(JwtAuthGuard)
async getQueueStats() {
  const queue = this.notificationsQueue
  const counts = await queue.getJobCounts()
  return {
    waiting: counts.waiting,
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
    delayed: counts.delayed,
  }
}
```

### Usar Bull Board (Dashboard visual)

Puedes instalar `@bull-board/express` para tener un dashboard visual:

```bash
npm install @bull-board/express @bull-board/api
```

Luego configurar en `main.ts`:

```typescript
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'

// ... en bootstrap()
const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullAdapter(notificationsQueue)],
  serverAdapter,
})

app.use('/admin/queues', serverAdapter.getRouter())
```

## 💰 Costos Estimados

### Redis Cloud (Free Tier)
- ✅ **Gratis**: Hasta 30MB
- 💰 **Pago**: Desde $5/mes para más capacidad

### Upstash Redis (Free Tier)
- ✅ **Gratis**: Hasta 10,000 comandos/día
- 💰 **Pago**: Desde $0.20 por 100K comandos adicionales

### Render Redis
- ⚠️ **No hay tier gratuito**
- 💰 **Pago**: Desde $7/mes

## 📝 Recomendación

Para producción, recomiendo:

1. **Upstash Redis** (si necesitas gratis y fácil)
2. **Redis Cloud** (si necesitas más capacidad gratuita)
3. **Render Redis** (si ya usas Render y quieres todo integrado)

## 🔗 Enlaces Útiles

- **Redis Cloud**: https://redis.com/try-free/
- **Upstash**: https://upstash.com/
- **Render Redis**: https://render.com/docs/redis
- **Bull Documentation**: https://github.com/OptimalBits/bull
- **Documentación relacionada**: `docs/NOTIFICACIONES_SIN_REDIS.md`

## ✅ Checklist de Configuración

- [ ] Cuenta creada en servicio Redis (Redis Cloud, Upstash, etc.)
- [ ] Base de datos Redis creada
- [ ] Credenciales copiadas (host, port, password)
- [ ] Variables de entorno configuradas en Render
- [ ] Servicio reiniciado en Render
- [ ] Logs verificados (debe mostrar "✅ Cola de notificaciones configurada")
- [ ] Notificación de prueba enviada
- [ ] Email recibido correctamente

