# 🔴 Configurar Upstash Redis - Guía Rápida

## 📋 Información que Tienes

- **Endpoint**: `striking-filly-6757.upstash.io`
- **Puerto**: `6379`

## 🔑 Obtener la Contraseña (Password)

1. **Ve a tu dashboard de Upstash**:
   - https://console.upstash.com/
   - Inicia sesión en tu cuenta

2. **Selecciona tu base de datos Redis**:
   - Busca la base de datos con el endpoint `striking-filly-6757.upstash.io`
   - Haz clic en ella

3. **Obtén la contraseña**:
   - En la página de detalles de la base de datos
   - Busca la sección **"REST API"** o **"Details"**
   - Verás:
     - **Endpoint**: `striking-filly-6757.upstash.io`
     - **Port**: `6379`
     - **Password**: `AXXXXX...` (esta es la que necesitas)

   **IMPORTANTE**: Si no ves la contraseña, haz clic en **"Show"** o **"Reveal"** para mostrarla.

## ⚙️ Configurar Variables en Render

### Opción 1: Variables Separadas (Recomendado)

Ve a: Render Dashboard → Tu servicio → Environment

Agrega estas variables:

```env
REDIS_HOST=striking-filly-6757.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AXXXXX... (la contraseña que obtuviste)
REDIS_DB=0
```

**Ejemplo completo:**
```env
REDIS_HOST=striking-filly-6757.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AeJhZXN0LTEuYW1hem9uYXdzLmVsYXN0aWNhY2hlLmNvbQAzNzY0NzQ4NzY2MDAwMDAwMDA
REDIS_DB=0
```

### Opción 2: Usando REDIS_URL (Alternativa)

Si prefieres usar una sola variable:

```env
REDIS_URL=redis://default:AXXXXX...@striking-filly-6757.upstash.io:6379
```

**Ejemplo completo:**
```env
REDIS_URL=redis://default:AeJhZXN0LTEuYW1hem9uYXdzLmVsYXN0aWNhY2hlLmNvbQAzNzY0NzQ4NzY2MDAwMDAwMDA@striking-filly-6757.upstash.io:6379
```

**Formato de REDIS_URL:**
```
redis://default:PASSWORD@HOST:PORT
```

## ✅ Verificar Configuración

### 1. Reiniciar el Servicio

Después de agregar las variables:
1. En Render Dashboard → Tu servicio
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O espera a que Render detecte los cambios automáticamente

### 2. Revisar Logs

En Render Dashboard → Tu servicio → Logs, deberías ver:

```
✅ Redis configurado - Habilitando cola de notificaciones con Bull
✅ Cola de notificaciones configurada (con Redis)
```

**Si ves esto, Redis está configurado correctamente.**

### 3. Probar una Notificación

1. Crea una inscripción o valida un pago
2. Revisa los logs, deberías ver:

```
📬 Evento recibido: INSCRIPCION_CREADA para usuario@email.com
✅ Notificación encolada para usuario@email.com (tipo: inscripcion.creada)
📬 Procesando notificación inscripcion_creada para usuario@email.com (Job ID: 1)
📧 Email enviado para usuario@email.com
✅ Notificación inscripcion.creada procesada exitosamente para usuario@email.com
```

## 🚨 Troubleshooting

### Error: "Error connecting to Redis"

**Causa**: Password incorrecto o formato incorrecto

**Solución**:
1. Verifica que `REDIS_PASSWORD` sea correcto (cópialo exactamente)
2. Asegúrate de que no tenga espacios al inicio o final
3. Si usas `REDIS_URL`, verifica el formato: `redis://default:PASSWORD@HOST:PORT`

### Error: "Invalid password"

**Causa**: Password incorrecto

**Solución**:
1. Ve a Upstash Dashboard
2. Verifica la contraseña en la sección "Details" o "REST API"
3. Si no la ves, haz clic en "Show" o "Reveal"
4. Cópiala exactamente (puede ser muy larga)

### Las notificaciones se procesan directamente (sin cola)

**Causa**: Redis no está configurado correctamente

**Solución**:
1. Verifica que todas las variables estén configuradas
2. Verifica que el password sea correcto
3. Revisa los logs para ver si hay errores de conexión
4. Asegúrate de que el servicio se haya reiniciado después de configurar las variables

## 📝 Checklist

- [ ] Contraseña obtenida de Upstash Dashboard
- [ ] `REDIS_HOST=striking-filly-6757.upstash.io` configurado en Render
- [ ] `REDIS_PORT=6379` configurado en Render
- [ ] `REDIS_PASSWORD=...` configurado en Render (sin espacios)
- [ ] `REDIS_DB=0` configurado en Render
- [ ] Servicio reiniciado en Render
- [ ] Logs verificados (debe mostrar "✅ Cola de notificaciones configurada")
- [ ] Notificación de prueba enviada
- [ ] Email recibido correctamente

## 🔗 Enlaces Útiles

- **Upstash Dashboard**: https://console.upstash.com/
- **Documentación Upstash**: https://docs.upstash.com/redis
- **Documentación completa**: `docs/CONFIGURAR_REDIS_PRODUCCION.md`

