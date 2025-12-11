# 🔍 Diagnosticar: Emails No Llegan con SMTP

## 🎯 Problema

Los emails NO están llegando cuando:
- ✅ Alguien se inscribe
- ✅ Cuando alguien paga
- ✅ Cuando se envían recordatorios

**Pero funcionaba en desarrollo antes de deployar.**

## 📋 Checklist de Diagnóstico

### 1. Verificar Variables de Entorno en Render

Ve a **Render → Tu Servicio → Settings → Environment Variables** y verifica:

#### Variables Requeridas:

```bash
EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=iswisphueoxplwvp
```

**Verificar:**
- ✅ `EMAIL_PROVIDER` debe ser `gmail` (NO `sendgrid`)
- ✅ `SMTP_USER` debe ser tu email de Gmail completo
- ✅ `SMTP_PASSWORD` debe ser tu App Password (16 caracteres, sin espacios)
- ✅ Todas las variables deben estar presentes

### 2. Verificar Logs al Iniciar el Servicio

Después de reiniciar el servicio, revisa los logs. Deberías ver:

```
✅ Servicio de email configurado (Gmail SMTP)
📧 SMTP: smtp.gmail.com:587
👤 Usuario: jerlibgnzlz@gmail.com
🔐 Password: ***wvp
```

**Si NO ves esto, hay un problema de configuración.**

**Errores comunes:**
```
⚠️ Servicio de email no configurado (faltan: SMTP_USER, SMTP_PASSWORD)
```
→ **Solución:** Agrega las variables faltantes en Render

```
❌ SMTP_PASSWORD está vacío o solo contiene espacios
```
→ **Solución:** Verifica que `SMTP_PASSWORD` tenga un valor válido

### 3. Verificar Logs al Enviar Email

Cuando alguien se inscribe o paga, revisa los logs. Deberías ver:

**Para Inscripción:**
```
📬 Evento recibido: INSCRIPCION_CREADA para email@example.com
📧 Preparando email con SMTP para email@example.com...
📧 Enviando email a email@example.com desde jerlibgnzlz@gmail.com (SMTP)...
✅ Email enviado exitosamente a email@example.com (SMTP)
   Message ID: xxx...
   Response: 250 2.0.0 OK xxx...
```

**Para Pago:**
```
📬 Evento recibido: PAGO_VALIDADO para email@example.com
📧 Preparando email con SMTP para email@example.com...
📧 Enviando email a email@example.com desde jerlibgnzlz@gmail.com (SMTP)...
✅ Email enviado exitosamente a email@example.com (SMTP)
```

**Si ves errores, anota el mensaje exacto.**

### 4. Errores Comunes y Soluciones

#### Error: "SMTP no está configurado"

**Causa:** `EMAIL_PROVIDER` no es `gmail` o faltan variables SMTP

**Solución:**
1. Verifica que `EMAIL_PROVIDER=gmail` esté en Render
2. Verifica que todas las variables SMTP estén presentes
3. Reinicia el servicio

#### Error: "Error de autenticación SMTP" o "EAUTH"

**Causa:** App Password incorrecta o expirada

**Solución:**
1. Ve a https://myaccount.google.com/apppasswords
2. Genera una nueva App Password para "Mail"
3. Actualiza `SMTP_PASSWORD` en Render con la nueva contraseña (16 caracteres)
4. Reinicia el servicio

#### Error: "Connection timeout" o "ETIMEDOUT"

**Causa:** Firewall de Render bloqueando conexión a Gmail SMTP

**Solución:**
1. Verifica que `SMTP_HOST=smtp.gmail.com` esté correcto
2. Verifica que `SMTP_PORT=587` esté correcto
3. Verifica que `SMTP_SECURE=false` esté configurado
4. Si persiste, puede ser un problema temporal de red

#### Error: "535-5.7.8 Username and Password not accepted"

**Causa:** App Password incorrecta o cuenta de Gmail con 2FA deshabilitado

**Solución:**
1. Verifica que tengas 2FA habilitado en tu cuenta de Gmail
2. Genera una nueva App Password
3. Asegúrate de usar la App Password, NO tu contraseña normal de Gmail

#### Error: "No se puede enviar email: servicio no configurado"

**Causa:** El código no detecta que SMTP está configurado

**Solución:**
1. Verifica que `EMAIL_PROVIDER=gmail` esté en Render
2. Verifica que `SMTP_USER` y `SMTP_PASSWORD` estén configurados
3. Reinicia el servicio
4. Revisa los logs al iniciar para ver si SMTP se configuró

### 5. Verificar que los Eventos se Emiten

Los emails se envían cuando se emiten eventos. Verifica en los logs:

**Al crear inscripción:**
```
📬 Evento recibido: INSCRIPCION_CREADA para email@example.com
```

**Al validar pago:**
```
📬 Evento recibido: PAGO_VALIDADO para email@example.com
```

**Si NO ves estos eventos, el problema está en la emisión de eventos, no en el envío de emails.**

### 6. Verificar App Password de Gmail

1. Ve a https://myaccount.google.com/apppasswords
2. Verifica que tengas una App Password generada para "Mail"
3. Si no tienes una, genera una nueva:
   - Selecciona "Mail" y "Other (Custom name)"
   - Escribe "AMVA Digital" o similar
   - Copia la contraseña generada (16 caracteres)
   - Úsala como `SMTP_PASSWORD` en Render

**IMPORTANTE:** 
- ✅ Usa App Password (16 caracteres)
- ❌ NO uses tu contraseña normal de Gmail
- ✅ Debes tener 2FA habilitado para generar App Passwords

### 7. Probar Envío Manual

Puedes probar el envío de emails usando el endpoint de prueba:

**Endpoint:** `POST /api/notifications/test-email`

**Body:**
```json
{
  "to": "tu-email@example.com",
  "subject": "Test Email",
  "body": "Este es un email de prueba"
}
```

**Revisa los logs para ver si se envía correctamente.**

## 🔧 Pasos de Solución

### Paso 1: Verificar Configuración en Render

1. Ve a Render → Tu Servicio → Settings → Environment Variables
2. Verifica que tengas estas 6 variables:
   - `EMAIL_PROVIDER=gmail`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=jerlibgnzlz@gmail.com`
   - `SMTP_PASSWORD=iswisphueoxplwvp`

### Paso 2: Reiniciar Servicio

1. Ve a Events o Logs
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. Espera a que termine el deploy

### Paso 3: Verificar Logs al Iniciar

Revisa los logs inmediatamente después de reiniciar. Deberías ver:

```
✅ Servicio de email configurado (Gmail SMTP)
📧 SMTP: smtp.gmail.com:587
👤 Usuario: jerlibgnzlz@gmail.com
🔐 Password: ***wvp
```

**Si NO ves esto, hay un problema de configuración.**

### Paso 4: Probar Creando una Inscripción

1. Ve a la landing page
2. Completa el formulario de inscripción
3. Revisa los logs de Render inmediatamente
4. Busca los mensajes listados arriba

### Paso 5: Verificar Bandeja de Entrada

1. Revisa la bandeja de entrada del email de destino
2. Revisa la carpeta de spam
3. Verifica que el email de destino sea correcto

## 🐛 Troubleshooting Avanzado

### Problema: Los logs muestran éxito pero los emails no llegan

**Posibles causas:**
1. Gmail está bloqueando los emails (revisa spam)
2. El email de destino es incorrecto
3. Gmail tiene límites de envío (revisa si enviaste muchos emails)

**Solución:**
1. Revisa la carpeta de spam
2. Verifica que el email de destino sea correcto
3. Espera unos minutos (puede haber delay)
4. Revisa si Gmail te envió alguna notificación de bloqueo

### Problema: Funciona en desarrollo pero no en producción

**Posibles causas:**
1. Variables de entorno diferentes
2. Firewall de Render bloqueando conexión
3. App Password diferente o expirada

**Solución:**
1. Verifica que las variables en Render sean exactamente iguales a las de desarrollo
2. Verifica que el App Password sea el mismo
3. Revisa los logs de Render para ver errores específicos

### Problema: Los eventos se emiten pero los emails no se envían

**Causa:** El listener no está procesando los eventos correctamente

**Solución:**
1. Verifica que `NotificationListener` esté registrado en el módulo
2. Verifica que `EventEmitterModule` esté configurado
3. Revisa los logs para ver si hay errores en el listener

## 📊 Checklist Final

- [ ] `EMAIL_PROVIDER=gmail` está configurado en Render
- [ ] Todas las variables SMTP están en Render
- [ ] Los logs muestran "✅ Servicio de email configurado (Gmail SMTP)" al iniciar
- [ ] Los logs muestran eventos cuando se crea inscripción o se valida pago
- [ ] Los logs muestran "✅ Email enviado exitosamente" cuando se envía
- [ ] El App Password de Gmail es correcto y está activo
- [ ] 2FA está habilitado en la cuenta de Gmail
- [ ] El servicio se reinició después de configurar las variables

## 🎯 Si Todo Falla

Si después de verificar todo lo anterior los emails aún no llegan:

1. **Genera una nueva App Password** de Gmail
2. **Actualiza `SMTP_PASSWORD`** en Render con la nueva contraseña
3. **Reinicia el servicio**
4. **Prueba nuevamente**

Si sigue sin funcionar, comparte los logs completos (especialmente los errores) para diagnosticar mejor.

---

**Última actualización:** Diciembre 2025

