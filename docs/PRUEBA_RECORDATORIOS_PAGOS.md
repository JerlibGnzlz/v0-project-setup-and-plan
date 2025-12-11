# 🧪 Prueba de Recordatorios de Pagos Pendientes

## 📋 Flujo Completo del Sistema

### 1. Frontend (Admin Dashboard)

**Ubicación:** `app/admin/inscripciones/page.tsx`

**Botón:** "Enviar Recordatorios de Pago"

**Flujo:**
```
Usuario hace clic en "Enviar Recordatorios"
  ↓
handleEnviarRecordatorios() se ejecuta
  ↓
Llama a enviarRecordatoriosMutation.mutateAsync()
  ↓
Hook useEnviarRecordatorios() procesa la petición
  ↓
Llama a inscripcionesApi.enviarRecordatorios()
  ↓
Petición HTTP POST a /api/inscripciones/acciones/enviar-recordatorios
```

### 2. Backend API

**Endpoint:** `POST /api/inscripciones/acciones/enviar-recordatorios`

**Controlador:** `InscripcionesController.enviarRecordatorios()`

**Flujo:**
```
Recibe petición con convencionId (opcional)
  ↓
Llama a inscripcionesService.enviarRecordatoriosPago()
  ↓
Retorna resultado: { enviados, fallidos, detalles }
```

### 3. Servicio Backend

**Método:** `InscripcionesService.enviarRecordatoriosPago()`

**Flujo:**
```
1. Busca inscripciones con estado='pendiente'
2. Para cada inscripción:
   - Verifica si tiene pagos
   - Si no tiene pagos, los crea automáticamente
   - Filtra solo las que tienen pagos PENDIENTES
3. Para cada inscripción con pagos pendientes:
   - Calcula cuotas pendientes y monto pendiente
   - Emite evento PAGO_RECORDATORIO
   - Usa enviarEmailRecordatorioDirecto() para verificar resultado real
   - Cuenta como enviado o fallido según el resultado
4. Retorna: { enviados, fallidos, detalles }
```

### 4. Sistema de Notificaciones

**Listener:** `NotificationListener.handlePagoRecordatorio()`

**Flujo:**
```
Recibe evento PAGO_RECORDATORIO
  ↓
Intenta encolar en Redis/Bull (si está configurado)
  ↓
Si Redis no está disponible, procesa directamente
  ↓
Llama a EmailService.sendNotificationEmail()
  ↓
EmailService usa SendGrid (si EMAIL_PROVIDER=sendgrid)
  ↓
Envía email con template de recordatorio
```

## ✅ Checklist de Verificación

### Antes de Probar

- [ ] `EMAIL_PROVIDER=sendgrid` está configurado en Render
- [ ] `SENDGRID_API_KEY` tiene el valor correcto
- [ ] `SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com` está configurado
- [ ] El email `jerlibgnzlz@gmail.com` está verificado en SendGrid (checkmark verde ✅)
- [ ] El servicio en Render se reinició después de configurar las variables
- [ ] Los logs muestran `✅ Servicio de email configurado (SendGrid)`

### Verificar que Hay Inscripciones con Pagos Pendientes

1. Ve al admin dashboard → Inscripciones
2. Verifica que haya inscripciones con estado "Pendiente"
3. Verifica que esas inscripciones tengan pagos con estado "PENDIENTE"
4. Si no hay inscripciones con pagos pendientes, el sistema no enviará nada

### Probar el Botón

1. Ve al admin dashboard → Inscripciones
2. Haz clic en el botón "Enviar Recordatorios de Pago"
3. Espera a que termine el proceso (puede tardar unos segundos)
4. Deberías ver un modal con el resultado:
   - "X Enviados" (en verde)
   - "Y Fallidos" (en rojo, si hay)
   - Lista de destinatarios con su estado

## 📊 Logs que Deberías Ver

### Al Iniciar el Backend

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: jerlibgnzlz@gmail.com
```

### Al Hacer Clic en "Enviar Recordatorios"

**En los logs de Render, deberías ver:**

```
📧 Iniciando envío de recordatorios de pago...
📋 Encontradas X inscripciones pendientes
📋 X inscripciones con pagos pendientes listas para recordatorio
📧 [1/X] Procesando recordatorio para email@example.com (ID: xxx)...
💰 Inscripción email@example.com: Y cuota(s) pendiente(s), monto: $Z
📬 Evento PAGO_RECORDATORIO emitido para email@example.com
📧 Verificando envío de email para email@example.com...
📧 Enviando email directo a email@example.com...
📧 Preparando email con SendGrid para email@example.com...
📧 Enviando email a email@example.com desde jerlibgnzlz@gmail.com (SendGrid)...
✅ Email enviado exitosamente a email@example.com (SendGrid)
   Status Code: 202
   Message ID: xxx...
✅ Email enviado exitosamente a email@example.com
✅ Recordatorio procesado exitosamente para email@example.com
📊 Recordatorios: X enviados, 0 fallidos
```

### Si Hay Errores

**Error de SendGrid:**
```
❌ Error enviando email con SendGrid: Forbidden
⚠️ Error 403 Forbidden de SendGrid: El email "from" no está verificado.
```

**Error de configuración:**
```
❌ EmailService no está configurado. Verifica SendGrid o SMTP en las variables de entorno
```

## 🔍 Verificación Paso a Paso

### Paso 1: Verificar Configuración

1. Ve a Render → Tu servicio → Settings → Environment
2. Verifica que tengas:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxx...
   SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
   SENDGRID_FROM_NAME=AMVA Digital
   ```

### Paso 2: Verificar Logs al Iniciar

1. Reinicia el servicio en Render
2. Revisa los logs inmediatamente
3. Busca: `✅ Servicio de email configurado (SendGrid)`

### Paso 3: Verificar que Hay Inscripciones con Pagos Pendientes

1. Ve al admin dashboard → Inscripciones
2. Filtra por estado "Pendiente"
3. Verifica que haya inscripciones
4. Para cada inscripción, verifica que tenga pagos con estado "PENDIENTE"

### Paso 4: Probar el Botón

1. Ve al admin dashboard → Inscripciones
2. Haz clic en "Enviar Recordatorios de Pago"
3. Espera a que termine (puede tardar unos segundos)
4. Revisa el modal con el resultado

### Paso 5: Verificar Logs en Tiempo Real

1. Abre los logs de Render en otra pestaña
2. Haz clic en "Enviar Recordatorios"
3. Revisa los logs inmediatamente
4. Busca los mensajes listados arriba

### Paso 6: Verificar que los Emails Lleguen

1. Revisa la bandeja de entrada de los destinatarios
2. Revisa la carpeta de spam
3. Verifica que el email de destino sea correcto

## 🐛 Problemas Comunes

### Problema: "0 Enviados, X Fallidos"

**Causa:** SendGrid está rechazando los emails

**Solución:**
1. Verifica que el email esté verificado en SendGrid (checkmark verde ✅)
2. Verifica que `SENDGRID_FROM_EMAIL` sea exactamente `jerlibgnzlz@gmail.com`
3. Revisa los logs para ver el error específico

### Problema: "No hay inscripciones con pagos pendientes"

**Causa:** No hay inscripciones pendientes o todos los pagos están completados

**Solución:**
1. Verifica que haya inscripciones con estado "Pendiente"
2. Verifica que esas inscripciones tengan pagos con estado "PENDIENTE"
3. Si no hay, crea una inscripción de prueba o valida algunos pagos

### Problema: El botón se queda en "Enviando..."

**Causa:** El proceso está tardando mucho o hay un error

**Solución:**
1. Revisa los logs de Render para ver qué está pasando
2. El proceso puede tardar si hay muchos emails
3. Hay un timeout de 5 minutos configurado

### Problema: Los emails no llegan pero los logs muestran éxito

**Causa:** El email puede estar en spam o el email de destino es incorrecto

**Solución:**
1. Revisa la carpeta de spam
2. Verifica que el email de destino sea correcto
3. Revisa los logs de SendGrid (si tienes acceso)

## 📋 Resumen del Flujo

```
Usuario → Botón "Enviar Recordatorios"
  ↓
Frontend → POST /api/inscripciones/acciones/enviar-recordatorios
  ↓
Backend → Busca inscripciones con pagos pendientes
  ↓
Backend → Para cada inscripción:
  - Emite evento PAGO_RECORDATORIO
  - Envía email con SendGrid
  - Verifica resultado real
  ↓
Backend → Retorna { enviados, fallidos, detalles }
  ↓
Frontend → Muestra modal con resultado
```

## ✅ Si Todo Funciona Correctamente

Deberías ver:
- ✅ Modal con "X Enviados, 0 Fallidos"
- ✅ Lista de destinatarios con checkmark verde ✅
- ✅ Logs mostrando "✅ Email enviado exitosamente"
- ✅ Emails llegando a los destinatarios

¡Con esta verificación deberías poder probar el botón y verificar que funcione correctamente! 🚀

