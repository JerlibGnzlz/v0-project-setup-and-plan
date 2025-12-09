# 🧪 Guía de Testing - Integración Mercado Pago

## 📋 Checklist Pre-Testing

- [x] Variables de entorno configuradas
- [ ] Backend corriendo en `http://localhost:4000`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] Credenciales de Mercado Pago configuradas

## 🔧 Verificación de Configuración

### 1. Verificar que Mercado Pago está configurado

```bash
# GET /api/mercado-pago/status
curl http://localhost:4000/api/mercado-pago/status
```

**Respuesta esperada:**
```json
{
  "configured": true,
  "testMode": true
}
```

### 2. Verificar variables de entorno en backend

Asegúrate de que estas variables estén en tu `.env` del backend:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
MERCADO_PAGO_TEST_MODE=true
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

**Public Key (para uso futuro - Checkout Pro):**
```env
# NO necesaria actualmente (usamos checkout redirect)
# Guardada para referencia futura si implementamos Checkout Pro
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-3e4d054a-4088-4cad-a61a-d795a9d70e4c
```

**Nota:** La public key NO es necesaria actualmente porque usamos "Checkout Redirect" (el usuario completa el pago en la página de Mercado Pago). Solo sería necesaria si implementamos "Checkout Pro" (pago sin salir del sitio).

## 🧪 Flujo de Testing Completo

### Paso 1: Crear una Inscripción

1. Ve a `http://localhost:3000/convencion/inscripcion`
2. Completa el formulario de inscripción
3. Verifica que se creen 3 pagos automáticamente (PENDIENTE)

### Paso 2: Probar el Botón de Pago

1. En la página de inscripción existente, deberías ver:
   - Lista de cuotas (1, 2, 3)
   - Botón "Pagar X con Mercado Pago" junto a cada cuota pendiente

2. Haz clic en el botón de pago de la primera cuota

3. **Comportamiento esperado:**
   - El botón muestra "Procesando..."
   - Se crea una preferencia en Mercado Pago
   - Se redirige a la página de checkout de Mercado Pago

### Paso 3: Probar el Pago en Mercado Pago (Modo Test)

**Tarjetas de prueba de Mercado Pago:**

#### Tarjeta Aprobada:
- **Número:** `5031 7557 3453 0604`
- **CVV:** `123`
- **Fecha:** Cualquier fecha futura
- **Nombre:** Cualquier nombre

#### Tarjeta Rechazada:
- **Número:** `5031 4332 1540 6351`
- **CVV:** `123`
- **Fecha:** Cualquier fecha futura

#### Tarjeta Pendiente:
- **Número:** `5031 7557 3453 0604`
- **CVV:** `123`
- **Fecha:** Cualquier fecha futura
- **Nombre:** Cualquier nombre

### Paso 4: Verificar Redirección

Después del pago, Mercado Pago redirige a:

- **Éxito:** `http://localhost:3000/convencion/pago-exitoso?payment_id=XXXXX`
- **Fallo:** `http://localhost:3000/convencion/pago-fallido?payment_id=XXXXX`
- **Pendiente:** `http://localhost:3000/convencion/pago-pendiente?payment_id=XXXXX`

### Paso 5: Verificar Webhook

El webhook se ejecuta automáticamente cuando Mercado Pago procesa el pago.

**Verificar en logs del backend:**
```bash
# Deberías ver logs como:
📥 Webhook recibido: tipo=payment, action=payment.updated, id=XXXXX
✅ Pago XXXXX actualizado: PENDIENTE → COMPLETADO
```

**Verificar en base de datos:**
```sql
SELECT * FROM pagos WHERE id = 'pago_id';
-- El estado debería cambiar a COMPLETADO
-- La referencia debería tener el ID de Mercado Pago
```

### Paso 6: Verificar Notificaciones

1. **Email al usuario:**
   - Debería recibir un email de "Pago Validado"
   - El email debe incluir el nombre real del usuario

2. **Notificación a admins:**
   - Debería aparecer en la campanita del header del admin
   - Tipo: `pago_validado`

3. **Confirmación de inscripción:**
   - Si todas las cuotas están pagadas, la inscripción se confirma automáticamente
   - Se envía email de "Inscripción Confirmada"

## 🔍 Debugging

### Verificar logs del backend

```bash
# En la terminal del backend, deberías ver:
✅ Mercado Pago inicializado (modo: TEST)
✅ Preferencia creada: XXXXX
📥 Webhook recibido: tipo=payment, action=payment.updated, id=XXXXX
✅ Pago XXXXX actualizado: PENDIENTE → COMPLETADO
```

### Verificar en el navegador

1. Abre DevTools (F12)
2. Ve a la pestaña Network
3. Filtra por "mercado-pago"
4. Verifica las requests:
   - `POST /api/mercado-pago/create-preference` - Debe retornar 200
   - `GET /api/mercado-pago/status` - Debe retornar `{ configured: true }`

### Errores Comunes

#### Error: "Mercado Pago no está configurado"
- **Causa:** `MERCADO_PAGO_ACCESS_TOKEN` no está configurado
- **Solución:** Verifica que la variable esté en el `.env` del backend

#### Error: "No se pudo obtener la URL de pago"
- **Causa:** La preferencia no se creó correctamente
- **Solución:** Verifica los logs del backend y las credenciales de Mercado Pago

#### Webhook no se ejecuta
- **Causa:** El webhook no está configurado en el panel de Mercado Pago
- **Solución:** Configura el webhook en el panel de desarrollador:
  - URL: `https://tu-dominio.com/api/mercado-pago/webhook`
  - Eventos: `payment`

#### El estado no se actualiza automáticamente
- **Causa:** El webhook no está llegando o hay un error en el procesamiento
- **Solución:** 
  1. Verifica los logs del backend
  2. Verifica que el `external_reference` en Mercado Pago coincida con el `pagoId`
  3. Verifica que el webhook esté configurado correctamente

## 📝 Configuración Completa en el Panel de Mercado Pago

### Paso 1: Acceder al Panel de Desarrollador

1. Ve a: https://www.mercadopago.com/developers/panel
2. Inicia sesión con tu cuenta de Mercado Pago
3. Selecciona tu aplicación (o crea una nueva si no tienes)

### Paso 2: Obtener Credenciales de Prueba

1. En el panel, ve a "Credenciales de prueba"
2. Copia el "Access Token" (TEST-xxxxx-xxxxx-xxxxx)
3. Configúralo en tu `backend/.env`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
   MERCADO_PAGO_TEST_MODE=true
   ```

### Paso 3: Configurar Webhooks (CRÍTICO)

**OPCIÓN A: Desarrollo Local (usando ngrok)**

1. Instala ngrok: https://ngrok.com/download
2. Ejecuta: `ngrok http 4000`
3. Copia la URL HTTPS que ngrok te da (ej: `https://abc123.ngrok.io`)
4. En el panel de Mercado Pago:
   - Ve a "Webhooks"
   - Haz clic en "Agregar URL"
   - **URL:** `https://abc123.ngrok.io/api/mercado-pago/webhook`
   - **Eventos:** Selecciona "Pagos" (payment)
   - Guarda

**OPCIÓN B: Producción**

1. En el panel de Mercado Pago:
   - Ve a "Webhooks"
   - Haz clic en "Agregar URL"
   - **URL:** `https://tu-dominio.com/api/mercado-pago/webhook`
   - **Eventos:** Selecciona "Pagos" (payment)
   - Guarda

### Paso 4: Configurar URLs de Retorno (Opcional - Solo Producción)

**NOTA:** En desarrollo local (localhost), Mercado Pago rechaza estas URLs. Solo configúralas en producción.

En el panel de Mercado Pago:
- Ve a "Configuración" → "URLs de retorno"
- URL de éxito: `https://tu-dominio.com/convencion/pago-exitoso`
- URL de fallo: `https://tu-dominio.com/convencion/pago-fallido`
- URL de pendiente: `https://tu-dominio.com/convencion/pago-pendiente`

### Paso 5: Verificar Configuración

1. Verifica que tu aplicación esté en "Modo Test" (sandbox)
2. Verifica que el Access Token sea de prueba (empieza con `TEST-`)
3. Verifica que el webhook esté configurado y activo
4. Prueba el endpoint de verificación:
   ```bash
   curl http://localhost:4000/api/mercado-pago/status
   ```
   
   Debería retornar:
   ```json
   {
     "configured": true,
     "testMode": true
   }
   ```

### Checklist de Configuración

- [ ] Credenciales de prueba obtenidas (Access Token TEST-...)
- [ ] Access Token configurado en `backend/.env`
- [ ] `MERCADO_PAGO_TEST_MODE=true` en `backend/.env`
- [ ] Webhook configurado (con ngrok para local o URL de producción)
- [ ] Eventos de webhook: "Pagos" seleccionado
- [ ] Aplicación en modo Test/Sandbox
- [ ] URLs de retorno configuradas (solo producción)

## ✅ Checklist de Testing

- [ ] Verificar que Mercado Pago está configurado (`/api/mercado-pago/status`)
- [ ] Crear una inscripción de prueba
- [ ] Verificar que se crean 3 pagos automáticamente
- [ ] Hacer clic en el botón de pago de una cuota
- [ ] Verificar que se redirige a Mercado Pago
- [ ] Probar pago con tarjeta de prueba aprobada
- [ ] Verificar redirección a página de éxito
- [ ] Verificar que el estado del pago se actualiza a COMPLETADO
- [ ] Verificar que se envía email de notificación
- [ ] Verificar que aparece notificación en campanita del admin
- [ ] Probar pago con tarjeta rechazada
- [ ] Verificar redirección a página de fallo
- [ ] Verificar que el estado del pago se actualiza a CANCELADO
- [ ] Probar que cuando todas las cuotas están pagadas, la inscripción se confirma
- [ ] Verificar email de "Inscripción Confirmada"

## 🚀 Listo para Producción

Cuando todo funcione correctamente en modo test:

1. Cambia `MERCADO_PAGO_TEST_MODE=false`
2. Usa credenciales de producción (`MERCADO_PAGO_ACCESS_TOKEN` de producción)
3. Configura el webhook con la URL de producción
4. Prueba con un pago real pequeño primero
5. Monitorea los logs y notificaciones

---

**¿Problemas?** Revisa los logs del backend y verifica que todas las variables de entorno estén correctamente configuradas.

