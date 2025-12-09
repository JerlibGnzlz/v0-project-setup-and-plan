# 🔄 Flujo Automático de Webhook de Mercado Pago

## 📋 Resumen

El sistema ahora procesa automáticamente los webhooks de Mercado Pago cuando el usuario regresa después de completar un pago. **Ya no es necesario procesar manualmente los webhooks en localhost**.

## 🎯 Cómo Funciona

### 1. Usuario Completa el Pago

1. El usuario hace clic en "Pagar con Mercado Pago"
2. Se crea una preferencia de pago
3. El usuario es redirigido a Mercado Pago
4. El usuario completa el pago

### 2. Redirección Automática

Después del pago, Mercado Pago redirige al usuario a:
- **Pago exitoso**: `/convencion/pago-exitoso?payment_id=123456789`
- **Pago pendiente**: `/convencion/pago-pendiente?payment_id=123456789`
- **Pago fallido**: `/convencion/pago-fallido?payment_id=123456789`

### 3. Procesamiento Automático

Cuando el frontend detecta un `payment_id` válido (número) en la URL:

1. **Automáticamente** llama al endpoint: `POST /api/mercado-pago/process-payment`
2. El backend:
   - Obtiene el estado del pago desde Mercado Pago
   - Procesa el webhook
   - Actualiza el estado del pago en la base de datos
   - Envía el email de confirmación (si aplica)

### 4. Resultado

- ✅ El estado del pago se actualiza automáticamente
- ✅ El usuario ve el estado actualizado
- ✅ Se envía el email de confirmación
- ✅ Todo funciona sin intervención manual

## 🔍 Detalles Técnicos

### Endpoint de Procesamiento Automático

```http
POST /api/mercado-pago/process-payment
Content-Type: application/json

{
  "paymentId": "123456789"
}
```

**Respuesta:**
```json
{
  "status": "ok",
  "message": "Pago procesado correctamente",
  "payment": {
    "id": 123456789,
    "status": "approved",
    "transaction_amount": 3333.33,
    "currency_id": "ARS",
    ...
  }
}
```

### Validación de Payment ID

El sistema solo procesa automáticamente si:
- ✅ El `payment_id` es un número (no tiene guiones)
- ✅ El `payment_id` es válido (no es `NaN`)

Si el `payment_id` tiene guiones (es un `preference_id`), **no se procesa automáticamente** porque no es un pago real.

### Páginas que Procesan Automáticamente

- ✅ `/convencion/pago-exitoso` - Procesa automáticamente
- ✅ `/convencion/pago-pendiente` - Procesa automáticamente
- ⚠️ `/convencion/pago-fallido` - No procesa (el pago falló)

## 🧪 Pruebas

### Prueba Completa del Flujo

1. **Crear preferencia de pago:**
   ```bash
   scripts/test-crear-preferencia.sh
   ```

2. **Completar el pago en Mercado Pago:**
   - Abre la URL de checkout que se muestra
   - Completa el pago con una tarjeta de prueba
   - Mercado Pago te redirigirá automáticamente

3. **Verificar procesamiento automático:**
   - El webhook se procesa automáticamente al regresar
   - El estado del pago se actualiza
   - Se envía el email de confirmación

### Prueba Manual (Opcional)

Si necesitas procesar un webhook manualmente (por ejemplo, si el procesamiento automático falló):

```bash
scripts/test-procesar-pago.sh <payment_id>
```

**Ejemplo:**
```bash
scripts/test-procesar-pago.sh 123456789
```

## 📊 Flujo Completo

```
Usuario → Clic en "Pagar" 
  ↓
Crear Preferencia → Mercado Pago
  ↓
Usuario completa pago
  ↓
Mercado Pago redirige → /convencion/pago-exitoso?payment_id=123456789
  ↓
Frontend detecta payment_id
  ↓
Llamada automática → POST /api/mercado-pago/process-payment
  ↓
Backend procesa webhook
  ↓
Actualiza estado en BD
  ↓
Envía email de confirmación
  ↓
Usuario ve estado actualizado
```

## 🔧 Configuración

### Variables de Entorno

El procesamiento automático funciona con las mismas variables de entorno que el sistema normal:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-... o PROD-...
MERCADO_PAGO_TEST_MODE=true o false
FRONTEND_URL=http://localhost:3000 (desarrollo) o https://... (producción)
BACKEND_URL=http://localhost:4000 (desarrollo) o https://... (producción)
```

### Modo Desarrollo vs Producción

- **Desarrollo (localhost)**: 
  - Mercado Pago no puede enviar webhooks automáticamente
  - El procesamiento automático desde el frontend resuelve esto
  - Funciona perfectamente

- **Producción**:
  - Mercado Pago envía webhooks automáticamente
  - El procesamiento automático desde el frontend es una capa adicional de seguridad
  - Ambos métodos funcionan

## ✅ Ventajas

1. **Sin intervención manual**: Todo es automático
2. **Funciona en localhost**: No necesitas ngrok
3. **Más confiable**: Si el webhook de Mercado Pago falla, el frontend lo procesa
4. **Mejor UX**: El usuario ve el estado actualizado inmediatamente
5. **Doble seguridad**: Webhook de Mercado Pago + procesamiento desde frontend

## 🐛 Troubleshooting

### El webhook no se procesa automáticamente

1. **Verifica que el payment_id sea un número:**
   - ✅ Correcto: `123456789`
   - ❌ Incorrecto: `662820140-bf046d51-...` (es un preference_id)

2. **Verifica los logs del backend:**
   ```bash
   # En la terminal donde corre el backend
   # Deberías ver:
   # [MercadoPagoController] Procesando pago manualmente: 123456789
   ```

3. **Verifica los logs del frontend:**
   - Abre la consola del navegador
   - Deberías ver: `[PagoExitoso] Procesando webhook automáticamente para payment_id: 123456789`

### El payment_id tiene guiones

Si el `payment_id` tiene guiones, es un `preference_id`, no un `payment_id` real. Esto significa que:
- El usuario aún no completó el pago
- O Mercado Pago redirigió con el `preference_id` en lugar del `payment_id`

**Solución**: Espera a que el usuario complete el pago y Mercado Pago redirija con el `payment_id` real.

## 📝 Notas

- El procesamiento automático solo funciona con `payment_id` válidos (números)
- Los `preference_id` (con guiones) no se procesan automáticamente
- El sistema sigue funcionando con webhooks automáticos de Mercado Pago en producción
- El procesamiento desde el frontend es una capa adicional de seguridad

---

**Última actualización**: Diciembre 2025

