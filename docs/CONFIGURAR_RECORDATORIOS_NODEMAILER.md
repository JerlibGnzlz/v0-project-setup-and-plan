# 📧 Configuración de Recordatorios de Pagos Pendientes con Nodemailer

## ✅ Estado Actual

El módulo de recordatorios de pagos pendientes está **completamente funcional** y usa **Nodemailer** cuando se configura `EMAIL_PROVIDER=gmail` o `EMAIL_PROVIDER=smtp`.

## 🔧 Configuración Requerida

### Variables de Entorno en Backend

Para que los recordatorios funcionen con **Nodemailer (SMTP)**, configura las siguientes variables de entorno en tu servidor (Render, Digital Ocean, etc.):

```env
# Proveedor de email (usar 'gmail' o 'smtp' para Nodemailer)
EMAIL_PROVIDER=gmail

# Configuración SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password_de_gmail
```

### Obtener App Password de Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad** → **Verificación en 2 pasos** (debe estar activada)
3. Ve a **Contraseñas de aplicaciones**
4. Genera una nueva contraseña para "Correo" y "Otro (personalizado)" → "AMVA Backend"
5. Copia la contraseña generada (16 caracteres sin espacios)
6. Úsala como `SMTP_PASSWORD`

## 🚀 Cómo Usar el Módulo de Recordatorios

### Desde el Panel Administrativo

1. Ve a `/admin/inscripciones`
2. Haz clic en el botón **"Recordatorios"** (icono de campana)
3. Se abrirá un diálogo de confirmación
4. Haz clic en **"Enviar Recordatorios"**
5. El sistema enviará emails a todos los usuarios con pagos pendientes

### Endpoint API

```bash
POST /api/inscripciones/acciones/enviar-recordatorios
Content-Type: application/json
Authorization: Bearer <token_admin>

{
  "convencionId": "opcional-id-de-convencion"
}
```

**Respuesta:**
```json
{
  "enviados": 5,
  "fallidos": 0,
  "detalles": [
    {
      "email": "usuario@ejemplo.com",
      "nombre": "Juan Pérez",
      "cuotasPendientes": 2,
      "exito": true
    }
  ]
}
```

## 📋 Qué Hace el Sistema

1. **Busca inscripciones pendientes** con pagos en estado `PENDIENTE`
2. **Filtra inscripciones** que no tengan notas indicando que no asistirán
3. **Genera template de email** personalizado con:
   - Nombre del usuario
   - Número de cuotas pendientes
   - Monto total pendiente
   - Información de la convención
4. **Envía email usando Nodemailer** (si `EMAIL_PROVIDER=gmail` o `EMAIL_PROVIDER=smtp`)
5. **Registra resultados** (enviados/fallidos) para reporte

## 🔍 Verificación y Debugging

### Logs del Backend

Cuando ejecutas el recordatorio, verás logs detallados:

```
📧 [Recordatorio] Enviando email directo a usuario@ejemplo.com...
   📋 Inscripción: Juan Pérez
   💰 Cuotas pendientes: 2
   💵 Monto pendiente: $500
   🎯 Convención: Convención 2025
📧 [Recordatorio] Template obtenido: ⏰ Recordatorio de Pago Pendiente
   📧 Email Provider configurado: gmail
📧 Preparando email con SMTP para usuario@ejemplo.com...
📧 Enviando email a usuario@ejemplo.com desde tu_email@gmail.com (SMTP)...
✅ Email enviado exitosamente a usuario@ejemplo.com (SMTP)
   Message ID: <message-id>
✅ [Recordatorio] Email enviado exitosamente a usuario@ejemplo.com
   📧 Usando: gmail (Nodemailer/SMTP)
```

### Verificar Configuración

Si los emails no se envían, verifica:

1. **Variables de entorno configuradas:**
   ```bash
   echo $EMAIL_PROVIDER  # Debe ser "gmail" o "smtp"
   echo $SMTP_USER       # Debe ser tu email
   echo $SMTP_PASSWORD   # Debe ser tu App Password (16 caracteres)
   ```

2. **Logs de inicialización:**
   ```
   📧 Inicializando EmailService con proveedor: gmail
   ✅ Nodemailer (SMTP) configurado correctamente
   📧 Los recordatorios de pagos pendientes usarán Nodemailer para enviar emails
   ```

3. **Errores comunes:**
   - `EAUTH`: Credenciales incorrectas (verifica `SMTP_USER` y `SMTP_PASSWORD`)
   - `ECONNECTION`: No se puede conectar al servidor SMTP (verifica `SMTP_HOST` y `SMTP_PORT`)
   - `ETIMEDOUT`: Timeout de conexión (Gmail puede bloquear conexiones desde servicios cloud)

## ⚠️ Solución de Problemas

### Error: "SMTP no se pudo configurar"

**Causa:** Faltan variables de entorno o son incorrectas.

**Solución:**
1. Verifica que `SMTP_USER` y `SMTP_PASSWORD` estén configuradas
2. Verifica que `EMAIL_PROVIDER=gmail` o `EMAIL_PROVIDER=smtp`
3. Para Gmail, usa una **App Password**, no tu contraseña normal

### Error: "EAUTH - Error de autenticación SMTP"

**Causa:** Credenciales incorrectas o App Password inválida.

**Solución:**
1. Genera una nueva App Password en Google
2. Asegúrate de copiar los 16 caracteres sin espacios
3. Verifica que la verificación en 2 pasos esté activada

### Error: "ETIMEDOUT - Timeout de conexión"

**Causa:** Gmail bloquea conexiones desde servicios cloud (Render, Digital Ocean, etc.).

**Solución:**
1. **Opción 1:** Usar SendGrid o Resend (recomendado para producción)
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=tu_api_key
   SENDGRID_FROM_EMAIL=email_verificado@tudominio.com
   ```

2. **Opción 2:** Configurar IP whitelist en Gmail (complejo)
3. **Opción 3:** Usar un servidor SMTP diferente (no Gmail)

## 📊 Flujo Completo

```
Usuario hace clic en "Recordatorios"
    ↓
Frontend llama a POST /api/inscripciones/acciones/enviar-recordatorios
    ↓
Backend: InscripcionesController.enviarRecordatorios()
    ↓
Backend: InscripcionesService.enviarRecordatoriosPago()
    ↓
Para cada inscripción con pagos pendientes:
    ↓
Backend: InscripcionesService.enviarEmailRecordatorioDirecto()
    ↓
Backend: NotificationsService.sendEmailToUser()
    ↓
Backend: EmailService.sendNotificationEmail()
    ↓
Backend: EmailService.sendWithSMTP() (Nodemailer)
    ↓
Nodemailer envía email vía SMTP
    ↓
Email recibido por el usuario
```

## ✅ Checklist de Verificación

- [ ] `EMAIL_PROVIDER=gmail` o `EMAIL_PROVIDER=smtp` configurado
- [ ] `SMTP_USER` configurado con tu email
- [ ] `SMTP_PASSWORD` configurado con App Password de Gmail (16 caracteres)
- [ ] `SMTP_HOST=smtp.gmail.com` (o tu servidor SMTP)
- [ ] `SMTP_PORT=587` (o el puerto correcto)
- [ ] Verificación en 2 pasos activada en Google
- [ ] App Password generada correctamente
- [ ] Logs muestran "✅ Nodemailer (SMTP) configurado correctamente"
- [ ] Botón "Recordatorios" funciona en `/admin/inscripciones`
- [ ] Emails se envían correctamente a usuarios con pagos pendientes

## 🎯 Resultado Esperado

Cuando todo está configurado correctamente:

1. ✅ Los usuarios con pagos pendientes reciben un email de recordatorio
2. ✅ El email incluye:
   - Nombre personalizado del usuario
   - Número de cuotas pendientes
   - Monto total pendiente
   - Información de la convención
   - Instrucciones para subir comprobante
3. ✅ El panel administrativo muestra el resultado (enviados/fallidos)
4. ✅ Los logs muestran confirmación de envío exitoso

---

**Última actualización**: Diciembre 2025  
**Versión**: v0.1.1

