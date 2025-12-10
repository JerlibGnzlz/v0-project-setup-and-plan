# 🔍 Diagnosticar Problemas con Emails en Producción

## ⚠️ Problema: Los emails no están llegando

Si los emails de los templates no están llegando en producción, sigue estos pasos para diagnosticar el problema.

## 📋 Checklist Rápido

1. [ ] Variables de entorno configuradas en Render
2. [ ] App Password de Gmail creada correctamente
3. [ ] Servicio reiniciado después de configurar variables
4. [ ] Revisar logs del backend en Render
5. [ ] Probar envío de email de prueba

## 🔍 Paso 1: Verificar Variables de Entorno en Render

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio: `ministerio-backend`
3. Ve a: **Environment** (Variables de entorno)
4. Verifica que estas variables estén configuradas:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password_16_caracteres
```

**IMPORTANTE**:
- `SMTP_USER`: Debe ser tu email completo de Gmail
- `SMTP_PASSWORD`: Debe ser la App Password (16 caracteres, sin espacios)
- `SMTP_SECURE`: Debe ser `false` (no `"false"` ni `'false'`, solo `false`)

## 🔍 Paso 2: Revisar Logs del Backend

1. Ve a: Render Dashboard → Tu servicio → **Logs**
2. Busca estos mensajes al iniciar el servicio:

### ✅ Si está configurado correctamente:
```
✅ Servicio de email configurado (Gmail SMTP)
📧 SMTP: smtp.gmail.com:587
👤 Usuario: tu_email@gmail.com
```

### ❌ Si hay problemas:

#### Error: "Servicio de email no configurado"
```
⚠️ Servicio de email no configurado (faltan credenciales SMTP)
   Configura SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD en .env
```

**Solución**: Verifica que todas las variables SMTP estén configuradas en Render.

#### Error: "EAUTH" (Error de Autenticación)
```
❌ Error enviando email a usuario@email.com:
   message: Invalid login: 535-5.7.8 Username and Password not accepted
   code: EAUTH
```

**Solución**:
1. Verifica que `SMTP_USER` sea tu email completo
2. Verifica que `SMTP_PASSWORD` sea la App Password (no tu contraseña normal)
3. Asegúrate de que la App Password no tenga espacios
4. Verifica que la verificación en 2 pasos esté activada

#### Error: "ECONNECTION" (Error de Conexión)
```
❌ Error enviando email a usuario@email.com:
   message: Connection timeout
   code: ECONNECTION
```

**Solución**:
1. Verifica que `SMTP_HOST=smtp.gmail.com`
2. Verifica que `SMTP_PORT=587`
3. Verifica que `SMTP_SECURE=false`

#### Error: "ETIMEDOUT" (Timeout)
```
❌ Error enviando email a usuario@email.com:
   message: Connection timeout
   code: ETIMEDOUT
```

**Solución**:
1. Verifica que estés usando App Password
2. Espera unos minutos e intenta de nuevo
3. Verifica que tu cuenta de Gmail no esté bloqueada

## 🔍 Paso 3: Probar Envío de Email

### Opción 1: Usar el Script de Diagnóstico

```bash
# Ejecutar el script (sin token, solo muestra instrucciones)
./scripts/diagnosticar-emails.sh

# O con token JWT para probar envío
./scripts/diagnosticar-emails.sh https://ministerio-backend-wdbj.onrender.com <tu-token-jwt>
```

### Opción 2: Usar cURL Directamente

1. **Obtener token JWT de admin**:
   - Inicia sesión en el admin dashboard
   - Abre la consola del navegador (F12)
   - Ejecuta: `localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')`
   - Copia el token

2. **Probar envío de email**:
```bash
curl -X POST https://ministerio-backend-wdbj.onrender.com/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token-jwt>" \
  -d '{
    "to": "tu_email@gmail.com",
    "subject": "Test Email desde Producción",
    "body": "Este es un email de prueba para verificar que el servicio funciona."
  }'
```

3. **Respuesta esperada**:
```json
{
  "success": true,
  "message": "Email enviado exitosamente"
}
```

## 🔍 Paso 4: Verificar Configuración de Gmail

### Crear App Password de Gmail

1. **Habilitar verificación en 2 pasos**:
   - Ve a: https://myaccount.google.com/security
   - Busca: **"Verificación en 2 pasos"**
   - Haz clic en **"Activar"** y sigue las instrucciones

2. **Crear App Password**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Si no ves la opción, asegúrate de tener la verificación en 2 pasos activada
   - Selecciona:
     - **Aplicación**: "Correo"
     - **Dispositivo**: "Otro (nombre personalizado)"
     - **Nombre**: "AMVA Digital Backend"
   - Haz clic en **"Generar"**
   - **Copia la contraseña de 16 caracteres** (se muestra solo una vez)
     - Formato: `xxxx xxxx xxxx xxxx` (sin espacios al configurar en Render)

3. **Configurar en Render**:
   - Ve a: Render Dashboard → Tu servicio → Environment
   - Agrega o actualiza:
     ```
     SMTP_PASSWORD=xxxxxxxxxxxxxxxx
     ```
   - **IMPORTANTE**: Sin espacios, solo los 16 caracteres

4. **Reiniciar el servicio**:
   - En Render Dashboard → Tu servicio
   - Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
   - O espera a que Render detecte los cambios automáticamente

## 🔍 Paso 5: Verificar que los Emails se Estén Enviando

### Revisar Logs al Enviar un Email

Cuando se envía un email (por ejemplo, al validar un pago), busca en los logs:

```
📧 Preparando email para usuario@email.com...
📧 Enviando email a usuario@email.com desde tu_email@gmail.com...
✅ Email enviado exitosamente a usuario@email.com
   Message ID: <message-id>
   Response: 250 2.0.0 OK
```

Si ves estos mensajes, el email se está enviando correctamente. Si no llega:

1. **Revisa la carpeta de Spam** en el email de destino
2. **Verifica que el email de destino sea válido**
3. **Revisa si Gmail tiene límites de envío** (500 emails/día para cuentas gratuitas)

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "No se puede enviar email: servicio no configurado"

**Causa**: Las variables SMTP no están configuradas o están vacías.

**Solución**:
1. Verifica que todas las variables SMTP estén en Render
2. Asegúrate de que no tengan espacios al inicio o final
3. Reinicia el servicio después de configurar

### Problema 2: "Error de autenticación SMTP (EAUTH)"

**Causa**: Credenciales incorrectas o no se está usando App Password.

**Solución**:
1. Verifica que `SMTP_USER` sea tu email completo
2. Verifica que `SMTP_PASSWORD` sea la App Password (no tu contraseña normal)
3. Asegúrate de que la App Password no tenga espacios
4. Verifica que la verificación en 2 pasos esté activada

### Problema 3: "Error de conexión SMTP (ECONNECTION)"

**Causa**: Configuración incorrecta de host o puerto.

**Solución**:
1. Verifica que `SMTP_HOST=smtp.gmail.com`
2. Verifica que `SMTP_PORT=587`
3. Verifica que `SMTP_SECURE=false`

### Problema 4: Los emails se envían pero no llegan

**Causa**: Puede ser spam, límites de Gmail, o email de destino inválido.

**Solución**:
1. Revisa la carpeta de Spam
2. Verifica que el email de destino sea válido
3. Verifica que Gmail no haya bloqueado tu cuenta
4. Revisa los límites de envío de Gmail (500 emails/día)

### Problema 5: "Timeout de conexión SMTP (ETIMEDOUT)"

**Causa**: Gmail está bloqueando la conexión o problemas de red.

**Solución**:
1. Verifica que estés usando App Password
2. Espera unos minutos e intenta de nuevo
3. Verifica que tu cuenta de Gmail no esté bloqueada

## 📝 Notas Importantes

- **NUNCA uses tu contraseña normal de Gmail** en producción
- **Siempre usa App Password** para aplicaciones
- **No compartas tu App Password** públicamente
- **Gmail tiene límites de envío**: 500 emails/día para cuentas gratuitas
- **Para envío masivo**, considera usar SendGrid o similar

## 🔗 Enlaces Útiles

- **Crear App Password**: https://myaccount.google.com/apppasswords
- **Verificación en 2 Pasos**: https://myaccount.google.com/security
- **Seguridad de Gmail**: https://myaccount.google.com/security-checkup
- **Documentación Gmail SMTP**: https://support.google.com/a/answer/176600

## 📚 Documentación Relacionada

- `docs/CONFIGURAR_GMAIL_PRODUCCION.md` - Guía completa de configuración
- `scripts/diagnosticar-emails.sh` - Script de diagnóstico
- `scripts/verificar-gmail-config.sh` - Script de verificación

