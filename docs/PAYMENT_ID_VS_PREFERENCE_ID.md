# 🔍 Payment ID vs Preference ID - Diferencia Importante

## ⚠️ Confusión Común

Muchas veces se confunde el **Preference ID** con el **Payment ID**. Son diferentes y se generan en momentos distintos.

---

## 📋 Diferencia Clave

### Preference ID
- **Cuándo se genera**: Al crear la preferencia de pago
- **Formato**: Puede ser string con guiones (ej: `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff`)
- **Dónde aparece**: En la URL de checkout de Mercado Pago
- **Ejemplo**: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=662820140-xxx`

### Payment ID
- **Cuándo se genera**: DESPUÉS de que el usuario completa el pago
- **Formato**: Generalmente un número entero (ej: `123456789`)
- **Dónde aparece**: En la URL de redirección después del pago
- **Ejemplo**: `http://localhost:3000/convencion/pago-exitoso?payment_id=123456789`

---

## 🔄 Flujo Completo

```
1. Crear Preferencia
   ↓
   Preference ID: 662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff
   ↓
2. Usuario completa pago
   ↓
3. Mercado Pago genera Payment ID
   ↓
   Payment ID: 123456789 (número)
   ↓
4. Mercado Pago redirige con payment_id
   ↓
5. Webhook se envía con payment_id
```

---

## 🧪 Cómo Obtener el Payment ID Real

### Opción 1: Desde la URL de Redirección (Más Fácil)

Después de completar el pago, la URL será:

```
http://localhost:3000/convencion/pago-exitoso?payment_id=123456789
```

El `payment_id` es el número después de `?payment_id=`

### Opción 2: Desde el Panel de Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/activities/payments
2. Busca tu pago reciente
3. Haz clic en el pago
4. El `payment_id` aparece en los detalles (generalmente es un número)

### Opción 3: Desde los Logs del Backend

Si el webhook llegara (en producción sí llega), el backend loguea:

```
📥 Webhook recibido: tipo=payment, action=payment.updated, id=123456789
```

El `id` es el `payment_id`.

---

## ⚠️ El ID que Tienes

El ID `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff` parece ser un **Preference ID**, no un Payment ID.

**Para obtener el Payment ID real:**
1. Completa el pago en Mercado Pago
2. Copia el `payment_id` de la URL de redirección
3. Usa ese número para procesar el webhook

---

## 🔧 Procesar Webhook con Payment ID Correcto

Una vez que tengas el `payment_id` real (número), procesa el webhook:

```bash
./scripts/procesar-webhook-manual.sh 123456789
```

O con curl:

```bash
curl -X POST http://localhost:4000/api/mercado-pago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data_id": "123456789"
  }'
```

---

## 📝 Resumen

| Tipo | Formato | Cuándo | Dónde |
|------|---------|--------|-------|
| **Preference ID** | String con guiones | Al crear preferencia | URL de checkout |
| **Payment ID** | Número entero | Después del pago | URL de redirección |

**Para el webhook, necesitas el Payment ID (número), no el Preference ID.**

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

