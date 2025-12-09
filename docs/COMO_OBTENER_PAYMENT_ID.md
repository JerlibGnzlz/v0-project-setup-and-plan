# 🔍 Cómo Obtener el Payment ID de Mercado Pago

Guía para encontrar el `payment_id` después de completar un pago en Mercado Pago.

---

## 📋 ¿Qué es el Payment ID?

El `payment_id` es el identificador único que Mercado Pago asigna a cada transacción de pago. Es diferente del `preference_id` (ID de la preferencia de pago).

---

## 🔍 Dónde Encontrar el Payment ID

### Opción 1: Desde la URL de Redirección (Más Fácil)

Después de completar el pago, Mercado Pago redirige a tu sitio. La URL contiene el `payment_id`:

```
http://localhost:3000/convencion/pago-exitoso?payment_id=123456789
                                                      ^^^^^^^^^^^^
                                                      Este es el payment_id
```

**Ejemplo:**
- URL: `http://localhost:3000/convencion/pago-exitoso?payment_id=662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff`
- Payment ID: `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff`

### Opción 2: Desde los Logs del Backend

Cuando procesas un pago, el backend puede loguear información. Revisa los logs del backend para ver si aparece el `payment_id`.

### Opción 3: Desde la Preferencia (Después del Pago)

Si tienes el `preference_id`, puedes consultar los pagos asociados:

```bash
# Consultar preferencia (esto te dará información, pero no el payment_id directamente)
curl http://localhost:4000/api/mercado-pago/preference/PREFERENCE_ID
```

**Nota:** El `payment_id` se genera DESPUÉS del pago, no antes.

### Opción 4: Desde el Panel de Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/activities/payments
2. Busca tu pago
3. Haz clic en el pago
4. El `payment_id` aparece en la URL o en los detalles

---

## 🧪 Ejemplo Práctico

### Paso 1: Completar el Pago

1. Abre la URL de checkout de Mercado Pago
2. Completa el pago con tarjeta de prueba
3. Mercado Pago te redirige a tu sitio

### Paso 2: Obtener el Payment ID

**Desde la URL:**
```
URL: http://localhost:3000/convencion/pago-exitoso?payment_id=662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff

Payment ID: 662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff
```

### Paso 3: Procesar el Webhook

```bash
# Opción A: Usar el script
./scripts/procesar-webhook-manual.sh 662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff

# Opción B: Usar curl directamente
curl -X POST http://localhost:4000/api/mercado-pago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data_id": "662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff"
  }'
```

---

## 🔄 Flujo Completo

```
1. Crear Preferencia
   ↓
2. Usuario completa pago en Mercado Pago
   ↓
3. Mercado Pago redirige con payment_id en URL
   ↓
4. Extraer payment_id de la URL
   ↓
5. Procesar webhook manualmente con ese payment_id
   ↓
6. Backend actualiza el pago en la BD
   ↓
7. Se envía email de confirmación
```

---

## ⚠️ Diferencias Importantes

| Tipo | Cuándo se Genera | Formato | Ejemplo |
|------|------------------|---------|---------|
| **Preference ID** | Al crear la preferencia | `662820140-xxx-xxx-xxx-xxx` | `662820140-4e43ecae-59ff-483e-8420-29cddcc752f4` |
| **Payment ID** | Después del pago | `662820140-xxx-xxx-xxx-xxx` | `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff` |

**Nota:** Ambos pueden tener formatos similares, pero el `payment_id` solo existe DESPUÉS de que el usuario completa el pago.

---

## 🛠️ Scripts Disponibles

### 1. Procesar Webhook Manualmente

```bash
./scripts/procesar-webhook-manual.sh [payment_id]
```

Si no pasas el `payment_id`, el script te lo pedirá.

### 2. Verificar Estado del Pago

```bash
./scripts/verificar-pago-manual.sh
```

Este script te permite verificar el estado del pago antes de procesar el webhook.

---

## 📝 Resumen Rápido

1. **Completa el pago** en Mercado Pago
2. **Copia el payment_id** de la URL de redirección
3. **Procesa el webhook:**
   ```bash
   ./scripts/procesar-webhook-manual.sh TU_PAYMENT_ID
   ```

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

