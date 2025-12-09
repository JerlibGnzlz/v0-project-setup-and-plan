# 💳 Tarjetas de Prueba de Mercado Pago

Guía completa para usar tarjetas de prueba en el modo TEST de Mercado Pago.

---

## 🎯 Tarjetas de Prueba Disponibles

### ✅ Tarjetas que Funcionan (Aprobadas)

#### Tarjeta de Crédito - Aprobada
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha de vencimiento: 11/25 (cualquier fecha futura)
Nombre del titular: APRO
```

#### Tarjeta de Débito - Aprobada
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha de vencimiento: 11/25 (cualquier fecha futura)
Nombre del titular: APRO
```

### ⚠️ Tarjetas para Casos Específicos

#### Tarjeta - Pago Pendiente
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha de vencimiento: 11/25
Nombre del titular: CONT
```
**Resultado**: El pago quedará en estado "pendiente" y se procesará después.

#### Tarjeta - Pago Rechazado
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha de vencimiento: 11/25
Nombre del titular: OTHE
```
**Resultado**: El pago será rechazado (útil para probar el flujo de error).

---

## 🔍 Problemas Comunes y Soluciones

### ❌ "No es posible continuar el pago con esta tarjeta"

Este error puede deberse a varias razones:

#### 1. **Estás usando una tarjeta real en modo TEST**

**Problema**: Si estás en modo TEST (sandbox), **NO puedes usar tarjetas reales**. Solo funcionan las tarjetas de prueba listadas arriba.

**Solución**: 
- Verifica que estés usando el token de TEST: `TEST-...`
- Usa solo las tarjetas de prueba de la lista
- Asegúrate de estar en: https://sandbox.mercadopago.com.ar (no www.mercadopago.com.ar)

#### 2. **Datos del pagador incompletos o inválidos**

**Problema**: Mercado Pago valida los datos del pagador. Si faltan datos o son inválidos, puede rechazar el pago.

**Solución**:
- Asegúrate de que la inscripción tenga:
  - ✅ Email válido
  - ✅ Nombre completo
  - ✅ Apellido completo
  - ✅ Teléfono (opcional pero recomendado)

#### 3. **Monto muy bajo o muy alto**

**Problema**: Algunos métodos de pago tienen límites mínimos/máximos.

**Solución**:
- En modo TEST, usa montos entre $1 y $100,000 ARS
- Evita montos menores a $1

#### 4. **Configuración de métodos de pago**

**Problema**: Si se excluyen métodos de pago en la preferencia, puede que la tarjeta no esté disponible.

**Solución**: 
- El sistema está configurado para **permitir todos los métodos de pago** por defecto
- No se excluyen métodos de pago en modo TEST

---

## 🧪 Cómo Probar Correctamente

### Paso 1: Verificar que estás en Modo TEST

```bash
curl http://localhost:4000/api/mercado-pago/status
```

Debe retornar:
```json
{
  "configured": true,
  "testMode": true  ← Debe ser true
}
```

### Paso 2: Crear una Preferencia

```bash
scripts/test-crear-preferencia.sh
```

### Paso 3: Abrir la URL de Checkout

**IMPORTANTE**: Debe ser la URL de **sandbox**:
```
https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...
```

**NO uses**:
```
https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...
```

### Paso 4: Usar Tarjeta de Prueba

1. Selecciona "Tarjeta de crédito" o "Tarjeta de débito"
2. Ingresa los datos de la tarjeta de prueba:
   - **Número**: `5031 7557 3453 0604`
   - **CVV**: `123`
   - **Vencimiento**: `11/25` (o cualquier fecha futura)
   - **Nombre**: `APRO` (para pago aprobado)
3. Completa el pago

### Paso 5: Verificar el Resultado

- ✅ **Pago aprobado**: Deberías ser redirigido a `/convencion/pago-exitoso`
- ⏳ **Pago pendiente**: Deberías ser redirigido a `/convencion/pago-pendiente`
- ❌ **Pago rechazado**: Deberías ser redirigido a `/convencion/pago-fallido`

---

## 🔧 Mejoras Implementadas

### 1. Configuración de Métodos de Pago

El sistema ahora:
- ✅ **Permite todos los métodos de pago** por defecto
- ✅ **No excluye ningún método** en modo TEST
- ✅ **Configura correctamente** los datos del pagador

### 2. Validación de Datos

El sistema valida:
- ✅ Email válido del pagador
- ✅ Nombre y apellido completos
- ✅ Monto válido (> 0)
- ✅ URLs de callback válidas

### 3. Logging Mejorado

Los logs ahora muestran:
- ✅ Modo TEST vs PRODUCCIÓN
- ✅ Datos del pagador
- ✅ Métodos de pago disponibles
- ✅ Errores detallados si hay problemas

---

## 🐛 Troubleshooting

### Error: "No es posible continuar el pago con esta tarjeta"

**Pasos para resolver**:

1. **Verifica el modo TEST**:
   ```bash
   curl http://localhost:4000/api/mercado-pago/status
   ```
   - Debe retornar `"testMode": true`

2. **Verifica que uses la URL de sandbox**:
   - ✅ Correcto: `https://sandbox.mercadopago.com.ar/checkout/...`
   - ❌ Incorrecto: `https://www.mercadopago.com.ar/checkout/...`

3. **Verifica los datos del pagador**:
   - Revisa los logs del backend al crear la preferencia
   - Asegúrate de que el email, nombre y apellido estén completos

4. **Usa las tarjetas de prueba correctas**:
   - ✅ `5031 7557 3453 0604` (Aprobada)
   - ✅ `5031 4332 1540 6351` (Aprobada)
   - ❌ NO uses tarjetas reales en modo TEST

5. **Verifica el monto**:
   - Debe ser mayor a $0
   - Recomendado: entre $1 y $100,000 ARS

### Error: "El pago fue rechazado"

Si usas la tarjeta con nombre `APRO`, el pago debería aprobarse. Si es rechazado:

1. Verifica que estés usando el número correcto: `5031 7557 3453 0604`
2. Verifica que el CVV sea: `123`
3. Verifica que la fecha de vencimiento sea futura: `11/25` o posterior
4. Verifica que el nombre del titular sea: `APRO`

### El webhook no se procesa automáticamente

Si el pago se completa pero el webhook no se procesa:

1. **Verifica los logs del backend**:
   - Deberías ver: `[PagoExitoso] Procesando webhook automáticamente`
   - Si no aparece, el `payment_id` puede ser inválido

2. **Verifica el payment_id**:
   - Debe ser un número (ej: `123456789`)
   - NO debe tener guiones (eso sería un `preference_id`)

3. **Procesa manualmente si es necesario**:
   ```bash
   scripts/test-procesar-pago.sh <payment_id>
   ```

---

## 📝 Notas Importantes

1. **Modo TEST vs PRODUCCIÓN**:
   - En TEST: Solo funcionan tarjetas de prueba
   - En PRODUCCIÓN: Solo funcionan tarjetas reales
   - **NO mezcles**: No uses tarjetas reales en TEST ni tarjetas de prueba en PRODUCCIÓN

2. **URLs de Checkout**:
   - TEST: `https://sandbox.mercadopago.com.ar/checkout/...`
   - PRODUCCIÓN: `https://www.mercadopago.com.ar/checkout/...`

3. **Datos del Pagador**:
   - El email debe ser válido
   - El nombre y apellido son obligatorios
   - El teléfono es opcional pero recomendado

4. **Montos**:
   - En TEST: Cualquier monto válido (> 0)
   - En PRODUCCIÓN: Respeta los límites de Mercado Pago

---

## 🔗 Referencias

- [Documentación de Mercado Pago - Tarjetas de Prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/test-cards)
- [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
- [Sandbox de Mercado Pago](https://sandbox.mercadopago.com.ar)

---

**Última actualización**: Diciembre 2025

