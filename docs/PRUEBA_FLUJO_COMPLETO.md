# 🧪 Prueba del Flujo Completo de Mercado Pago

Guía paso a paso para probar el flujo completo de pagos con Mercado Pago.

---

## ✅ Estado del Sistema

### 1. Verificar Configuración

```bash
curl http://localhost:4000/api/mercado-pago/status
```

**Resultado esperado:**
```json
{
  "configured": true,
  "testMode": true
}
```

### 2. Crear Preferencia de Pago

La preferencia se crea automáticamente cuando un usuario hace clic en "Pagar con Mercado Pago" desde el frontend.

Para pruebas manuales, puedes usar:
```bash
# Obtener datos de inscripción
INSCRIPCION_DATA=$(curl -s http://localhost:4000/api/inscripciones | jq -r '.data[0]')

# Crear preferencia
curl -X POST http://localhost:4000/api/mercado-pago/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "inscripcionId": "...",
    "pagoId": "...",
    "monto": 3333.33,
    "emailPayer": "test@example.com",
    "nombrePayer": "Test",
    "apellidoPayer": "User",
    "numeroCuota": 1,
    "descripcion": "Pago de prueba"
  }'
```

---

## 🔗 URL de Checkout

Después de crear la preferencia, obtendrás una URL de checkout:

**Modo TEST (Sandbox):**
```
https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=662820140-xxxxx
```

**⚠️ IMPORTANTE**: 
- En modo TEST, **DEBES usar la URL de sandbox**
- NO uses `www.mercadopago.com.ar` en modo TEST
- Solo funcionan tarjetas de prueba

---

## 💳 Tarjetas de Prueba

### Tarjeta Aprobada (Recomendada)

```
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25 (o cualquier fecha futura)
Nombre del titular: APRO
```

**Resultado**: Pago aprobado inmediatamente ✅

### Otras Tarjetas de Prueba

#### Pago Pendiente
```
Número: 5031 4332 1540 6351
CVV: 123
Vencimiento: 11/25
Nombre: CONT
```

#### Pago Rechazado
```
Número: 5031 4332 1540 6351
CVV: 123
Vencimiento: 11/25
Nombre: OTHE
```

---

## 📝 Pasos para Completar la Prueba

### Paso 1: Abrir URL de Checkout

1. Copia la URL de checkout (sandbox)
2. Ábrela en tu navegador
3. Deberías ver la página de Mercado Pago

### Paso 2: Seleccionar Método de Pago

1. Selecciona "Tarjeta de crédito" o "Tarjeta de débito"
2. Haz clic en "Continuar"

### Paso 3: Ingresar Datos de Tarjeta

1. **Número de tarjeta**: `5031 7557 3453 0604`
2. **CVV**: `123`
3. **Vencimiento**: `11/25` (o cualquier fecha futura)
4. **Nombre del titular**: `APRO`
5. Haz clic en "Continuar"

### Paso 4: Completar el Pago

1. Mercado Pago procesará el pago
2. Si usas la tarjeta con nombre `APRO`, el pago será aprobado
3. Serás redirigido automáticamente a la página de éxito

### Paso 5: Verificar Procesamiento Automático

1. Al regresar, el frontend detecta el `payment_id` en la URL
2. Automáticamente llama a `POST /api/mercado-pago/process-payment`
3. El backend procesa el webhook
4. El estado del pago se actualiza en la BD
5. Se envía el email de confirmación

---

## 🔍 Verificación

### 1. Logs del Backend

Revisa los logs del backend. Deberías ver:

```
[PagoExitoso] Procesando webhook automáticamente para payment_id: 123456789
[MercadoPagoController] Procesando pago manualmente: 123456789
[MercadoPagoService] ✅ Webhook procesado exitosamente
```

### 2. Estado del Pago

Verifica que el estado del pago se haya actualizado:

```bash
# Obtener estado del pago
curl http://localhost:4000/api/mercado-pago/payment/123456789
```

**Resultado esperado:**
```json
{
  "id": 123456789,
  "status": "approved",
  "transaction_amount": 3333.33,
  "currency_id": "ARS",
  ...
}
```

### 3. Email de Confirmación

Verifica que se haya enviado el email de confirmación al email del pagador.

---

## 🐛 Troubleshooting

### Error: "No es posible continuar el pago con esta tarjeta"

**Causas posibles:**

1. **Estás usando una tarjeta real en modo TEST**
   - ✅ Solución: Usa solo tarjetas de prueba
   - ✅ Verifica que estés en modo TEST: `testMode: true`

2. **Estás usando la URL incorrecta**
   - ✅ Correcto: `https://sandbox.mercadopago.com.ar/checkout/...`
   - ❌ Incorrecto: `https://www.mercadopago.com.ar/checkout/...`

3. **Datos del pagador incompletos**
   - ✅ Verifica que el email, nombre y apellido estén completos
   - ✅ Revisa los logs del backend al crear la preferencia

4. **Monto inválido**
   - ✅ El monto debe ser mayor a 0
   - ✅ Recomendado: entre $1 y $100,000 ARS

### El webhook no se procesa automáticamente

**Verificaciones:**

1. **Revisa los logs del frontend** (consola del navegador):
   - Deberías ver: `[PagoExitoso] Procesando webhook automáticamente`

2. **Verifica el payment_id**:
   - Debe ser un número (ej: `123456789`)
   - NO debe tener guiones (eso sería un `preference_id`)

3. **Procesa manualmente si es necesario**:
   ```bash
   scripts/test-procesar-pago.sh <payment_id>
   ```

### El pago se completa pero no se actualiza el estado

**Solución:**

1. Verifica que el backend esté corriendo
2. Revisa los logs del backend para errores
3. Procesa el webhook manualmente:
   ```bash
   scripts/test-procesar-pago.sh <payment_id>
   ```

---

## 📊 Flujo Completo

```
Usuario → Clic en "Pagar con Mercado Pago"
  ↓
Frontend → POST /api/mercado-pago/create-preference
  ↓
Backend → Crea preferencia en Mercado Pago
  ↓
Frontend → Redirige a URL de checkout (sandbox)
  ↓
Usuario → Completa pago con tarjeta de prueba
  ↓
Mercado Pago → Redirige a /convencion/pago-exitoso?payment_id=123456789
  ↓
Frontend → Detecta payment_id automáticamente
  ↓
Frontend → POST /api/mercado-pago/process-payment
  ↓
Backend → Procesa webhook
  ↓
Backend → Actualiza estado del pago en BD
  ↓
Backend → Envía email de confirmación
  ↓
Usuario → Ve estado actualizado
```

---

## ✅ Checklist de Prueba

- [ ] Backend corriendo en modo TEST
- [ ] Preferencia creada exitosamente
- [ ] URL de checkout es de sandbox
- [ ] Tarjeta de prueba ingresada correctamente
- [ ] Pago completado en Mercado Pago
- [ ] Redirección automática funcionando
- [ ] Webhook procesado automáticamente
- [ ] Estado del pago actualizado en BD
- [ ] Email de confirmación enviado
- [ ] Usuario ve estado actualizado

---

## 📝 Notas

1. **Modo TEST vs PRODUCCIÓN**:
   - En TEST: Solo tarjetas de prueba, URL de sandbox
   - En PRODUCCIÓN: Solo tarjetas reales, URL de producción

2. **Procesamiento Automático**:
   - El webhook se procesa automáticamente al regresar
   - No requiere intervención manual
   - Funciona en localhost y producción

3. **Tarjetas de Prueba**:
   - Solo funcionan en modo TEST
   - El nombre del titular determina el resultado
   - `APRO` = Aprobado, `CONT` = Pendiente, `OTHE` = Rechazado

---

**Última actualización**: Diciembre 2025

