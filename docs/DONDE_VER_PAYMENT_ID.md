# 🔍 Dónde Ver el Payment ID de Mercado Pago

Guía visual de dónde encontrar el `payment_id` después de completar un pago.

---

## 📍 Opción 1: En la URL de Redirección (Más Fácil)

Después de completar el pago, Mercado Pago te redirige a tu sitio. El `payment_id` está en la URL:

### Ejemplo de URL:

```
http://localhost:3000/convencion/pago-exitoso?payment_id=123456789
                                                      ^^^^^^^^^^^^
                                                      ESTE es el payment_id
```

### Pasos:

1. **Completa el pago** en Mercado Pago
2. **Mira la barra de direcciones** del navegador después de la redirección
3. **Busca el parámetro** `?payment_id=` o `&payment_id=`
4. **Copia el número** que viene después

### Ejemplo Real:

```
URL: http://localhost:3000/convencion/pago-exitoso?payment_id=662820140

Payment ID: 662820140
```

---

## 📍 Opción 2: En el Panel de Mercado Pago

### Paso 1: Acceder al Panel

1. Ve a: **https://www.mercadopago.com.ar/activities/payments**
2. Inicia sesión con tu cuenta

### Paso 2: Buscar el Pago

1. Verás una lista de todos tus pagos
2. Busca el pago más reciente (el que acabas de hacer)
3. Haz clic en el pago

### Paso 3: Ver el Payment ID

1. En la página de detalles del pago
2. El **Payment ID** aparece en:
   - La URL de la página (número al final)
   - Los detalles del pago
   - Generalmente es un número grande (ej: `662820140`)

---

## 📍 Opción 3: En los Logs del Backend

Si el webhook llegara (en producción sí llega), el backend loguea el `payment_id`:

```
📥 Webhook recibido: tipo=payment, action=payment.updated, id=123456789
                                                                  ^^^^^^^^^^^^
                                                                  Este es el payment_id
```

**Nota:** En localhost, el webhook no llega automáticamente, así que no verás esto en desarrollo.

---

## 📍 Opción 4: Desde la Preferencia (Después del Pago)

Si tienes el `preference_id`, puedes consultar información, pero el `payment_id` solo aparece DESPUÉS del pago.

---

## 🧪 Prueba Rápida

### 1. Crear Preferencia y Completar Pago

```bash
# Crear preferencia
./scripts/test-flujo-completo-mercado-pago.sh

# Abre la URL de checkout
# Completa el pago con tarjeta de prueba
```

### 2. Después del Pago

**Mira la URL del navegador:**
```
http://localhost:3000/convencion/pago-exitoso?payment_id=XXXXX
```

**O si no aparece en la URL:**
1. Ve al panel de Mercado Pago
2. Busca el pago reciente
3. Copia el Payment ID

### 3. Procesar Webhook

```bash
./scripts/procesar-webhook-manual.sh TU_PAYMENT_ID
```

---

## ⚠️ Diferencias Importantes

### Preference ID (Antes del Pago)
- Formato: `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff`
- Aparece en: URL de checkout
- Cuándo: Al crear la preferencia

### Payment ID (Después del Pago)
- Formato: `662820140` (número)
- Aparece en: URL de redirección después del pago
- Cuándo: Después de completar el pago

---

## 🔍 Si No Aparece en la URL

Si completaste el pago pero no ves el `payment_id` en la URL:

1. **Verifica que el pago se completó:**
   - Ve al panel de Mercado Pago
   - Busca el pago en "Actividades"

2. **Revisa la configuración de redirección:**
   - En desarrollo local, las redirecciones pueden no funcionar
   - El pago se procesa, pero la redirección puede fallar

3. **Consulta directamente en Mercado Pago:**
   - Panel → Actividades → Pagos
   - Busca tu pago reciente
   - El Payment ID aparece en los detalles

---

## 📝 Resumen Visual

```
┌─────────────────────────────────────────┐
│ 1. Crear Preferencia                    │
│    → Preference ID: 662820140-xxx-xxx   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Usuario completa pago                │
│    → Mercado Pago genera Payment ID     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Redirección con Payment ID          │
│    URL: ...?payment_id=662820140       │
│              ^^^^^^^^^^^^               │
│              ESTE es el payment_id      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Procesar Webhook                    │
│    ./scripts/procesar-webhook-manual.sh │
│        662820140                        │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Completé el pago en Mercado Pago
- [ ] Vi la URL de redirección
- [ ] Copié el `payment_id` de la URL (número después de `?payment_id=`)
- [ ] O lo busqué en el panel de Mercado Pago
- [ ] Procesé el webhook con ese `payment_id`

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

