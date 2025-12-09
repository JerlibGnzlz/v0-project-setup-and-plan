# 🔧 Solución: Webhook no se Procesa Automáticamente en Localhost

## 🐛 Problema

Cuando pruebas Mercado Pago en desarrollo local (`localhost`), el webhook **NO se procesa automáticamente** porque:

1. **Mercado Pago no puede alcanzar localhost**: Los webhooks requieren una URL pública accesible desde internet
2. **localhost no es accesible externamente**: Tu servidor local no es visible desde internet
3. **El pago se completa en Mercado Pago**: Pero el webhook no puede llegar a tu backend

## ✅ Soluciones

### Opción 1: Usar ngrok (Recomendado para Desarrollo)

ngrok crea un túnel público hacia tu localhost.

#### Instalación

```bash
# Descargar ngrok
# En Linux:
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# O usar npm:
npm install -g ngrok
```

#### Uso

1. **Inicia tu backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **En otra terminal, inicia ngrok:**
   ```bash
   ngrok http 4000
   ```

3. **Copia la URL de ngrok** (ej: `https://abc123.ngrok.io`)

4. **Actualiza tu `.env` temporalmente:**
   ```env
   BACKEND_URL=https://abc123.ngrok.io
   ```

5. **Crea una nueva preferencia** - Ahora el webhook funcionará

#### Configurar Webhook en Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Selecciona tu aplicación
3. Ve a **"Webhooks"** → **"Modo prueba"**
4. Configura la URL: `https://abc123.ngrok.io/api/mercado-pago/webhook`
5. Selecciona el evento: **"Pagos"**

---

### Opción 2: Verificación Manual del Pago

Si no quieres usar ngrok, puedes verificar manualmente el estado del pago.

#### Usar el Script

```bash
./scripts/verificar-pago-manual.sh
```

El script te pedirá el `payment_id` y:
1. Consultará el estado del pago en Mercado Pago
2. Te mostrará el estado actual
3. Te dará el comando para procesar el webhook manualmente

#### Procesar Webhook Manualmente

Después de verificar que el pago está aprobado, procesa el webhook:

```bash
curl -X POST http://localhost:4000/api/mercado-pago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data_id": "TU_PAYMENT_ID_AQUI"
  }'
```

---

### Opción 3: Polling (Consultar Estado Periódicamente)

Puedes crear un endpoint que consulte el estado del pago periódicamente.

```typescript
// En el frontend, después de redirigir a Mercado Pago
setInterval(async () => {
  const status = await checkPaymentStatus(paymentId)
  if (status === 'approved') {
    // Actualizar UI
  }
}, 5000) // Cada 5 segundos
```

---

## 🔍 Cómo Obtener el Payment ID

### Desde la URL de Redirección

Después del pago, Mercado Pago redirige a:
```
http://localhost:3000/convencion/pago-exitoso?payment_id=123456789
```

El `payment_id` está en el query parameter.

### Desde los Logs del Backend

Cuando creas la preferencia, el backend loguea:
```
✅ Preferencia creada exitosamente
📋 ID de Preferencia: 662820140-xxx
```

El `payment_id` es diferente del `preference_id`. Se obtiene después del pago.

---

## 📋 Flujo Completo con Verificación Manual

### 1. Crear Preferencia

```bash
./scripts/test-flujo-completo-mercado-pago.sh
```

### 2. Completar Pago en Mercado Pago

- Abre la URL de checkout
- Completa el pago con tarjeta de prueba
- Anota el `payment_id` de la URL de redirección

### 3. Verificar Estado

```bash
./scripts/verificar-pago-manual.sh
# Ingresa el payment_id cuando te lo pida
```

### 4. Procesar Webhook Manualmente

Si el pago está aprobado, procesa el webhook:

```bash
curl -X POST http://localhost:4000/api/mercado-pago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data_id": "TU_PAYMENT_ID"
  }'
```

### 5. Verificar que se Actualizó

```bash
# Consultar el pago en tu BD
curl http://localhost:4000/api/inscripciones/TU_INSCRIPCION_ID | jq '.pagos[0]'
```

---

## 🚀 En Producción

**En producción, el webhook funciona automáticamente** porque:

1. Tu backend tiene una URL pública (ej: `https://tu-backend.railway.app`)
2. Mercado Pago puede alcanzar esa URL
3. El webhook se procesa automáticamente cuando hay un pago

Solo necesitas:
1. Configurar el webhook en Mercado Pago (modo productivo)
2. Usar la URL de producción: `https://tu-backend.railway.app/api/mercado-pago/webhook`

---

## 🧪 Prueba Rápida

### Crear Preferencia y Obtener Payment ID

```bash
# 1. Crear preferencia
./scripts/test-flujo-completo-mercado-pago.sh

# 2. Completar pago en Mercado Pago
# 3. Copiar payment_id de la URL

# 4. Verificar estado
./scripts/verificar-pago-manual.sh

# 5. Si está aprobado, procesar webhook
curl -X POST http://localhost:4000/api/mercado-pago/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","action":"payment.updated","data_id":"TU_PAYMENT_ID"}'
```

---

## 📊 Comparación de Soluciones

| Solución | Facilidad | Automático | Recomendado Para |
|----------|-----------|------------|------------------|
| **ngrok** | ⭐⭐⭐ | ✅ Sí | Desarrollo activo |
| **Verificación Manual** | ⭐⭐ | ❌ No | Pruebas rápidas |
| **Polling** | ⭐⭐⭐ | ⚠️ Semi | Frontend |
| **Producción** | ⭐⭐⭐⭐⭐ | ✅ Sí | Producción |

---

## ✅ Resumen

**Problema:** Webhook no funciona en localhost porque no es accesible desde internet.

**Soluciones:**
1. **ngrok** - Crea túnel público (mejor para desarrollo)
2. **Verificación manual** - Consultar y procesar manualmente
3. **Polling** - Consultar estado periódicamente desde frontend
4. **Producción** - Funciona automáticamente con URL pública

**En producción:** Todo funciona automáticamente, solo configura el webhook en Mercado Pago.

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

