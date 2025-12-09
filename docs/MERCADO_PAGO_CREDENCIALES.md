# 🔑 Credenciales de Mercado Pago en Producción

Guía completa para obtener y configurar las credenciales de Mercado Pago en producción.

---

## 📋 Credenciales Necesarias

Para usar Mercado Pago en producción, necesitas **2 variables de entorno**:

1. **`MERCADO_PAGO_ACCESS_TOKEN`** - Token de acceso de producción (debe empezar con `PROD-`)
2. **`MERCADO_PAGO_TEST_MODE`** - Modo de prueba (debe ser `false` en producción)

---

## 🔍 Cómo Obtener las Credenciales de Producción

### Paso 1: Acceder al Panel de Desarrolladores

1. Ve a: **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, créala en: https://www.mercadopago.com.ar

### Paso 2: Seleccionar tu Aplicación

1. En el panel, verás tus aplicaciones
2. Selecciona la aplicación que quieres usar (o crea una nueva)
3. Si no tienes una aplicación, haz clic en **"Crear aplicación"**

### Paso 3: Obtener Credenciales de Producción

1. Dentro de tu aplicación, ve a la pestaña **"Credenciales"**
2. Verás dos secciones:
   - **Credenciales de prueba** (TEST) - Para desarrollo
   - **Credenciales de producción** (PROD) - Para producción ⚠️

3. En la sección **"Credenciales de producción"**, copia:
   - **Access Token** (debe empezar con `PROD-`)
   - **Public Key** (opcional, si la necesitas en el futuro)

### Paso 4: Verificar el Token

El Access Token de producción debe tener este formato:

```
PROD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx
```

**⚠️ IMPORTANTE**: 
- Debe empezar con `PROD-` (no `TEST-`)
- Es un string largo (más de 100 caracteres)
- Guárdalo de forma segura, no lo compartas

---

## ⚙️ Configurar en Producción

### Backend (Railway/Render)

Agrega estas variables de entorno en tu plataforma de deployment:

```env
# Mercado Pago - PRODUCCIÓN
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion-completo-aqui
MERCADO_PAGO_TEST_MODE=false
```

**Ejemplo real:**
```env
MERCADO_PAGO_ACCESS_TOKEN=PROD-1234567890abcdef1234567890abcdef-12345678-1234567890abcdef1234567890abcdef-12345678-1234567890abcdef1234567890abcdef-12345678
MERCADO_PAGO_TEST_MODE=false
```

### Verificar Configuración

Una vez configurado, el backend mostrará en los logs:

```
✅ Mercado Pago inicializado (modo: PRODUCCIÓN)
```

Si ves `(modo: TEST)`, verifica que:
- `MERCADO_PAGO_ACCESS_TOKEN` empiece con `PROD-`
- `MERCADO_PAGO_TEST_MODE=false`

---

## 🔄 Diferencias entre TEST y PRODUCCIÓN

### Credenciales de TEST (Desarrollo)

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-tu-token-de-test-aqui
MERCADO_PAGO_TEST_MODE=true
```

**Características:**
- ✅ Pagos ficticios (no se cobra dinero real)
- ✅ Ideal para desarrollo y pruebas
- ✅ No requiere verificación de cuenta
- ❌ No procesa pagos reales

### Credenciales de PRODUCCIÓN

```env
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion-aqui
MERCADO_PAGO_TEST_MODE=false
```

**Características:**
- ⚠️ Pagos reales (se cobra dinero real)
- ✅ Requiere cuenta verificada en Mercado Pago
- ✅ Procesa transacciones reales
- ⚠️ Requiere configuración de webhook en modo productivo

---

## ✅ Checklist para Producción

Antes de usar Mercado Pago en producción, verifica:

- [ ] Tienes una cuenta de Mercado Pago verificada
- [ ] Has creado una aplicación en el panel de desarrolladores
- [ ] Has obtenido el Access Token de PRODUCCIÓN (empieza con `PROD-`)
- [ ] Has configurado `MERCADO_PAGO_ACCESS_TOKEN` en tu plataforma de deployment
- [ ] Has configurado `MERCADO_PAGO_TEST_MODE=false`
- [ ] Has configurado el webhook en modo productivo (ver [MERCADO_PAGO_PRODUCCION.md](./MERCADO_PAGO_PRODUCCION.md))
- [ ] Has probado con un pago pequeño antes de lanzar
- [ ] Has verificado que los logs muestren `(modo: PRODUCCIÓN)`

---

## 🔒 Seguridad

### ⚠️ NUNCA hagas esto:

- ❌ NO commitees el Access Token en el código
- ❌ NO lo compartas públicamente
- ❌ NO uses credenciales de TEST en producción
- ❌ NO uses credenciales de PRODUCCIÓN en desarrollo

### ✅ SÍ haz esto:

- ✅ Usa variables de entorno (nunca hardcodees)
- ✅ Guarda las credenciales en tu plataforma de deployment (Railway/Render)
- ✅ Usa credenciales de TEST para desarrollo local
- ✅ Usa credenciales de PRODUCCIÓN solo en producción
- ✅ Rota las credenciales si sospechas que fueron comprometidas

---

## 🧪 Probar en Producción

### Antes de procesar pagos reales:

1. **Prueba con un monto mínimo:**
   - Haz un pago de prueba con el monto más bajo posible
   - Verifica que se procese correctamente
   - Verifica que el webhook funcione
   - Verifica que los emails se envíen

2. **Verifica el flujo completo:**
   - Usuario se inscribe
   - Usuario hace clic en "Pagar con Mercado Pago"
   - Usuario completa el pago
   - Webhook actualiza el estado
   - Email de confirmación se envía
   - Admin ve el pago en el panel

3. **Monitorea los logs:**
   - Revisa los logs de Railway/Render
   - Verifica que no haya errores
   - Verifica que los webhooks lleguen correctamente

---

## 🆘 Troubleshooting

### Error: "Mercado Pago deshabilitado"

**Causa**: `MERCADO_PAGO_ACCESS_TOKEN` no está configurado

**Solución**:
1. Verifica que la variable esté configurada en tu plataforma de deployment
2. Verifica que el valor no esté vacío
3. Reinicia el servicio después de agregar la variable

### Error: "Modo TEST" en producción

**Causa**: `MERCADO_PAGO_TEST_MODE=true` o el token empieza con `TEST-`

**Solución**:
1. Cambia `MERCADO_PAGO_TEST_MODE=false`
2. Verifica que `MERCADO_PAGO_ACCESS_TOKEN` empiece con `PROD-`
3. Reinicia el servicio

### Error: "Invalid access token"

**Causa**: El token es inválido o ha expirado

**Solución**:
1. Ve al panel de Mercado Pago
2. Verifica que el token esté activo
3. Si es necesario, genera un nuevo token
4. Actualiza la variable de entorno

### Error: "Webhook not received"

**Causa**: El webhook no está configurado en modo productivo

**Solución**:
1. Ve a Mercado Pago → Panel → Webhooks
2. Cambia a la pestaña "Modo productivo"
3. Configura la URL: `https://tu-backend.railway.app/api/mercado-pago/webhook`
4. Selecciona el evento "Pagos"
5. Guarda

---

## 📚 Recursos Adicionales

- [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers/panel)
- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Guía de Producción Completa](./MERCADO_PAGO_PRODUCCION.md)
- [Configuración de Webhooks](./MERCADO_PAGO_PRODUCCION.md#paso-3-configurar-webhook-en-modo-productivo)

---

## 📝 Resumen Rápido

**Para producción, necesitas:**

1. **Access Token de PRODUCCIÓN** (empieza con `PROD-`)
   - Obtener en: https://www.mercadopago.com.ar/developers/panel
   - Sección: "Credenciales de producción"

2. **Configurar variables:**
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-aqui
   MERCADO_PAGO_TEST_MODE=false
   ```

3. **Configurar webhook en modo productivo**

4. **Probar con un pago pequeño antes de lanzar**

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

