# 🧪 CÓMO PROBAR MERCADO PAGO - GUÍA COMPLETA

## 📍 ¿Dónde se puede probar Mercado Pago?

**Mercado Pago está disponible SOLO en la WEB PÚBLICA**, no en el panel admin.

### ✅ Web Pública (Donde SÍ funciona)
- **URL:** `http://localhost:3000/convencion/inscripcion`
- **Cuándo aparece:** Cuando un usuario ya tiene una inscripción y tiene cuotas pendientes
- **Dónde verlo:** En la tarjeta de "Inscripción Existente", junto a cada cuota pendiente

### ❌ Panel Admin (Donde NO funciona)
- El panel admin (`/admin/pagos`) es solo para **validar pagos manuales** (comprobantes subidos)
- Mercado Pago es para pagos **automáticos** desde la web pública

---

## 🚀 PASO A PASO PARA PROBAR

### 1️⃣ Verificar que Mercado Pago está configurado

```bash
# En una terminal, verifica que el backend esté corriendo
curl http://localhost:4000/api/mercado-pago/status
```

**Respuesta esperada:**
```json
{
  "configured": true,
  "testMode": true
}
```

Si `configured: false`, verifica que tengas en tu `.env` del backend:
```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
MERCADO_PAGO_TEST_MODE=true
```

---

### 2️⃣ Crear una Inscripción de Prueba

1. **Abre tu navegador** y ve a: `http://localhost:3000/convencion/inscripcion`

2. **Completa el formulario** con datos de prueba:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: `test@example.com` (usa un email que puedas verificar)
   - Teléfono: +54 9 11 1234-5678
   - Sede: Cualquiera
   - País: Argentina
   - Provincia: Buenos Aires

3. **Haz clic en "Inscribirse"**

4. **Resultado esperado:**
   - Se crea la inscripción
   - Se crean automáticamente 3 pagos (PENDIENTE)
   - Aparece la tarjeta de "Inscripción Existente"

---

### 3️⃣ Ver el Botón de Mercado Pago

En la tarjeta de "Inscripción Existente", deberías ver:

```
┌─────────────────────────────────────────┐
│ Estado de Pagos                         │
│                                         │
│ Cuota 1 - $50,000 - [Pendiente]        │
│ [Pagar $50,000 con Mercado Pago] ←───  │
│                                         │
│ Cuota 2 - $50,000 - [Pendiente]        │
│ [Pagar $50,000 con Mercado Pago] ←───  │
│                                         │
│ Cuota 3 - $50,000 - [Pendiente]        │
│ [Pagar $50,000 con Mercado Pago] ←───  │
└─────────────────────────────────────────┘
```

**Si NO ves los botones:**
- Verifica que Mercado Pago esté configurado (`/api/mercado-pago/status`)
- Verifica que los pagos estén en estado `PENDIENTE`
- Abre la consola del navegador (F12) y busca errores

---

### 4️⃣ Hacer un Pago de Prueba

1. **Haz clic en "Pagar $X con Mercado Pago"** de la primera cuota

2. **Comportamiento esperado:**
   - El botón muestra "Procesando..."
   - Se crea una preferencia en Mercado Pago
   - Se redirige automáticamente a la página de checkout de Mercado Pago

3. **En la página de Mercado Pago (modo test):**

   **Tarjeta de Prueba APROBADA:**
   - **Número:** `5031 7557 3453 0604`
   - **CVV:** `123`
   - **Fecha:** Cualquier fecha futura (ej: 12/25)
   - **Nombre:** Cualquier nombre
   - **DNI:** 12345678

   **Tarjeta de Prueba RECHAZADA:**
   - **Número:** `5031 4332 1540 6351`
   - **CVV:** `123`
   - **Fecha:** Cualquier fecha futura

4. **Completa el formulario** y haz clic en "Pagar"

---

### 5️⃣ Verificar Redirección

Después del pago, Mercado Pago te redirige a:

- **✅ Éxito:** `http://localhost:3000/convencion/pago-exitoso?payment_id=XXXXX`
  - Muestra mensaje de éxito
  - Muestra detalles del pago

- **❌ Fallo:** `http://localhost:3000/convencion/pago-fallido?payment_id=XXXXX`
  - Muestra mensaje de error
  - Muestra detalles del pago

- **⏳ Pendiente:** `http://localhost:3000/convencion/pago-pendiente?payment_id=XXXXX`
  - Muestra mensaje de pendiente
  - El pago se procesará después

---

### 6️⃣ Verificar que el Pago se Actualizó

**Opción A: Desde la Web Pública**
1. Vuelve a `http://localhost:3000/convencion/inscripcion`
2. Ingresa el mismo email que usaste
3. Verifica que la cuota que pagaste ahora dice "Pagada" o "Completado"

**Opción B: Desde el Panel Admin**
1. Ve a `http://localhost:3000/admin/pagos`
2. Busca el pago por email o ID
3. Verifica que el estado cambió a `COMPLETADO`
4. Verifica que la "Referencia" tiene el ID de Mercado Pago

**Opción C: Ver Logs del Backend**
En la terminal del backend, deberías ver:
```
✅ Preferencia creada: XXXXX
📥 Webhook recibido: tipo=payment, action=payment.updated, id=XXXXX
✅ Pago XXXXX actualizado: PENDIENTE → COMPLETADO
```

---

### 7️⃣ Verificar Notificaciones

**Email al Usuario:**
- Debería recibir un email de "Pago Validado"
- El email debe incluir su nombre real

**Notificación a Admins:**
- Debería aparecer en la campanita del header del admin (`/admin`)
- Tipo: `pago_validado`

---

### 8️⃣ Probar Confirmación de Inscripción

1. **Paga las 3 cuotas** usando el mismo proceso
2. **Resultado esperado:**
   - Cuando la última cuota se paga, la inscripción se confirma automáticamente
   - Se envía email de "Inscripción Confirmada"
   - En la web, la inscripción muestra "Confirmada"

---

## 🔍 DEBUGGING

### Verificar en el Navegador (DevTools)

1. **Abre DevTools** (F12)
2. **Ve a la pestaña Network**
3. **Filtra por "mercado-pago"**
4. **Verifica las requests:**
   - `POST /api/mercado-pago/create-preference` → Debe retornar 200
   - `GET /api/mercado-pago/status` → Debe retornar `{ configured: true }`

### Verificar Logs del Backend

En la terminal del backend, deberías ver:
```
✅ Mercado Pago inicializado (modo: TEST)
✅ Preferencia creada: XXXXX
📥 Webhook recibido: tipo=payment, action=payment.updated, id=XXXXX
✅ Pago XXXXX actualizado: PENDIENTE → COMPLETADO
```

### Errores Comunes

#### ❌ "Mercado Pago no está configurado"
- **Causa:** `MERCADO_PAGO_ACCESS_TOKEN` no está configurado
- **Solución:** Verifica que la variable esté en el `.env` del backend y reinicia el servidor

#### ❌ "No se pudo obtener la URL de pago"
- **Causa:** La preferencia no se creó correctamente
- **Solución:** 
  - Verifica los logs del backend
  - Verifica las credenciales de Mercado Pago
  - Verifica que el backend esté corriendo

#### ❌ El estado no se actualiza automáticamente
- **Causa:** El webhook no está configurado o no está llegando
- **Solución:** 
  - Para desarrollo local, usa ngrok (ver abajo)
  - Verifica que el webhook esté configurado en el panel de Mercado Pago
  - Verifica los logs del backend

---

## 🔧 CONFIGURAR WEBHOOK (Para Desarrollo Local)

El webhook permite que Mercado Pago notifique automáticamente cuando un pago se procesa.

### Usando ngrok (Recomendado para desarrollo)

1. **Instala ngrok:**
   ```bash
   # Descarga desde https://ngrok.com/download
   # O con npm: npm install -g ngrok
   ```

2. **Inicia ngrok:**
   ```bash
   ngrok http 4000
   ```

3. **Copia la URL de ngrok** (ej: `https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app`)

4. **Configura el webhook en Mercado Pago:**
   - Ve a [Panel de Desarrollador de Mercado Pago](https://www.mercadopago.com/developers/panel)
   - Selecciona tu aplicación
   - Ve a "Webhooks"
   - Agrega una nueva URL:
     - **URL:** `https://tu-url-ngrok.ngrok.io/api/mercado-pago/webhook`
     - **Eventos:** Selecciona "Pagos"
   - Guarda la configuración

5. **Prueba el webhook:**
   - Haz un pago de prueba
   - Verifica en los logs del backend que llegue el webhook

---

## ✅ CHECKLIST DE TESTING

- [ ] Backend corriendo en `http://localhost:4000`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] Mercado Pago configurado (`/api/mercado-pago/status` retorna `configured: true`)
- [ ] Crear una inscripción de prueba
- [ ] Verificar que se crean 3 pagos automáticamente
- [ ] Ver el botón "Pagar con Mercado Pago" junto a cada cuota pendiente
- [ ] Hacer clic en el botón y verificar redirección a Mercado Pago
- [ ] Probar pago con tarjeta de prueba aprobada
- [ ] Verificar redirección a página de éxito
- [ ] Verificar que el estado del pago se actualiza a COMPLETADO
- [ ] Verificar que se envía email de notificación
- [ ] Verificar que aparece notificación en campanita del admin
- [ ] Probar pago con tarjeta rechazada
- [ ] Verificar redirección a página de fallo
- [ ] Probar que cuando todas las cuotas están pagadas, la inscripción se confirma
- [ ] Verificar email de "Inscripción Confirmada"

---

## 🚀 LISTO PARA PRODUCCIÓN

Cuando todo funcione correctamente en modo test:

1. Cambia `MERCADO_PAGO_TEST_MODE=false`
2. Usa credenciales de producción (`MERCADO_PAGO_ACCESS_TOKEN` de producción)
3. Configura el webhook con la URL de producción
4. Prueba con un pago real pequeño primero
5. Monitorea los logs y notificaciones

---

**¿Problemas?** Revisa los logs del backend y verifica que todas las variables de entorno estén correctamente configuradas.
