# 📋 Explicación de los Logs de Mercado Pago

Este documento explica qué significa cada parte de los logs de Mercado Pago.

---

## 🔍 Análisis de los Logs

### 1. Objeto Inicial (Antes de Enviar)

```json
{
  "back_urls": {
    "success": "http://localhost:3000/convencion/pago-exitoso?payment_id={PAYMENT_ID}",
    "failure": "http://localhost:3000/convencion/pago-fallido?payment_id={PAYMENT_ID}",
    "pending": "http://localhost:3000/convencion/pago-pendiente?payment_id={PAYMENT_ID}"
  },
  "auto_return": "approved"
}
```

**¿Qué es?**
- Este es el objeto que se construye ANTES de enviar a Mercado Pago
- Contiene las URLs de redirección que quieres usar
- Se loguea para debugging

**¿Por qué se muestra?**
- Para verificar que las URLs se construyeron correctamente
- Para debugging si hay problemas

---

### 2. Advertencias de Desarrollo Local

```
⚠️ Desarrollo local detectado: No se incluyen URLs de redirección
⚠️ El webhook procesará el pago correctamente (funciona con localhost)
⚠️ El usuario deberá hacer clic en "Volver al sitio" manualmente después del pago
```

**¿Qué significa?**
- **"No se incluyen URLs de redirección"**: Mercado Pago rechaza `back_urls` con localhost, así que no se envían
- **"El webhook procesará el pago"**: El webhook SÍ funciona con localhost, así que el pago se procesará correctamente
- **"Usuario deberá hacer clic manualmente"**: Como no hay redirección automática, el usuario debe volver manualmente

**¿Es un problema?**
- ❌ NO es un problema en desarrollo
- ✅ El webhook funciona correctamente
- ✅ El pago se procesa
- ⚠️ Solo la redirección automática no funciona (normal en localhost)

---

### 3. Request Final Enviado a Mercado Pago

```json
{
  "items": [
    {
      "id": "e49be418-ab70-46c9-8243-227276df6294",
      "title": "Convención Nacional Argentina - Cuota 1",
      "description": "Convención Nacional Argentina - Cuota 1",
      "quantity": 1,
      "unit_price": 3333.33,
      "currency_id": "ARS"
    }
  ],
  "payer": {
    "name": "Jerlib",
    "surname": "Gnzlz",
    "email": "jerlibgnzlz@gmail.com"
  },
  "external_reference": "e49be418-ab70-46c9-8243-227276df6294",
  "notification_url": "http://localhost:4000/api/mercado-pago/webhook",
  "statement_descriptor": "AMVA Digital",
  "metadata": {
    "inscripcionId": "...",
    "pagoId": "...",
    "convencionId": "...",
    "numeroCuota": 1
  }
}
```

**Campos importantes:**

| Campo | Descripción |
|-------|-------------|
| `items` | Productos/servicios a pagar |
| `payer` | Datos del pagador (nombre, email) |
| `external_reference` | ID del pago en tu base de datos |
| `notification_url` | Webhook que recibe notificaciones (SÍ funciona con localhost) |
| `statement_descriptor` | Descripción que aparece en el resumen de tarjeta |
| `metadata` | Datos adicionales para identificar el pago |

**Nota importante:**
- ❌ NO incluye `back_urls` porque es localhost (Mercado Pago lo rechaza)
- ✅ SÍ incluye `notification_url` porque el webhook funciona con localhost

---

### 4. Respuesta de Mercado Pago

```json
{
  "id": "662820140-4e43ecae-59ff-483e-8420-29cddcc752f4",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "back_urls": {
    "success": "",
    "failure": "",
    "pending": ""
  }
}
```

**Campos importantes:**

| Campo | Descripción |
|-------|-------------|
| `id` | ID de la preferencia de pago |
| `init_point` | URL de checkout en PRODUCCIÓN (no usar en TEST) |
| `sandbox_init_point` | URL de checkout en TEST (usar en desarrollo) |
| `back_urls` | Vacíos porque no se enviaron (localhost) |

**¿Qué URL usar?**
- **En TEST**: Usa `sandbox_init_point`
- **En PRODUCCIÓN**: Usa `init_point`

---

### 5. Actualización en Base de Datos

```
✅ Pago e49be418-ab70-46c9-8243-227276df6294 actualizado: 
   método=Mercado Pago, 
   referencia=662820140-4e43ecae-59ff-483e-8420-29cddcc752f4
```

**¿Qué significa?**
- Se actualizó el pago en la base de datos
- Se guardó el método de pago: "Mercado Pago"
- Se guardó la referencia: ID de la preferencia de Mercado Pago

**¿Para qué sirve?**
- Para identificar el pago en Mercado Pago
- Para relacionar el pago con la preferencia
- Para consultar el estado del pago después

---

## 🔄 Flujo Completo

### En Desarrollo Local (localhost)

```
1. Usuario hace clic en "Pagar con Mercado Pago"
   ↓
2. Backend crea preferencia (sin back_urls porque es localhost)
   ↓
3. Backend retorna sandbox_init_point
   ↓
4. Usuario es redirigido a Mercado Pago (sandbox)
   ↓
5. Usuario completa el pago
   ↓
6. Mercado Pago envía webhook a localhost:4000/api/mercado-pago/webhook
   ↓
7. Backend procesa el webhook y actualiza el pago
   ↓
8. Usuario debe hacer clic en "Volver al sitio" manualmente
```

### En Producción

```
1. Usuario hace clic en "Pagar con Mercado Pago"
   ↓
2. Backend crea preferencia (CON back_urls porque es HTTPS)
   ↓
3. Backend retorna init_point
   ↓
4. Usuario es redirigido a Mercado Pago
   ↓
5. Usuario completa el pago
   ↓
6. Mercado Pago redirige automáticamente a back_urls.success
   ↓
7. Mercado Pago también envía webhook (por si acaso)
   ↓
8. Backend procesa el webhook y actualiza el pago
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no funcionan las redirecciones en localhost?

**Respuesta:** Mercado Pago rechaza URLs con localhost por seguridad. Es normal y esperado.

### ¿El pago funciona sin redirecciones?

**Respuesta:** Sí, el webhook funciona con localhost y procesa el pago correctamente.

### ¿Cómo probar las redirecciones?

**Respuesta:** Usa ngrok o deploya a producción. En producción, las redirecciones funcionan automáticamente.

### ¿Qué pasa si el webhook falla?

**Respuesta:** El usuario puede consultar el estado del pago manualmente. El webhook se reintenta automáticamente.

---

## 📊 Comparación: Desarrollo vs Producción

| Característica | Desarrollo (localhost) | Producción (HTTPS) |
|----------------|------------------------|-------------------|
| `back_urls` | ❌ No se incluyen | ✅ Se incluyen |
| `notification_url` | ✅ Funciona | ✅ Funciona |
| Redirección automática | ❌ No funciona | ✅ Funciona |
| Webhook | ✅ Funciona | ✅ Funciona |
| URL de checkout | `sandbox_init_point` | `init_point` |

---

## ✅ Conclusión

**Los logs que ves son NORMALES y CORRECTOS para desarrollo local:**

1. ✅ El objeto inicial se construye correctamente
2. ✅ Las advertencias son esperadas (localhost)
3. ✅ El request final es correcto (sin back_urls)
4. ✅ La respuesta de Mercado Pago es correcta
5. ✅ El pago se actualiza en la BD

**En producción, todo funcionará automáticamente con redirecciones.**

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

