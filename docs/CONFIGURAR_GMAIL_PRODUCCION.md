# 📧 Configurar Gmail SMTP para Producción

## ⚠️ Problema Común

Gmail puede bloquear el envío de emails en producción si:
1. No se usa una **App Password** (contraseña de aplicación)
2. La verificación en 2 pasos no está habilitada
3. Las credenciales no están configuradas correctamente en Render

## ✅ Solución: Configurar App Password de Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca: **"Verificación en 2 pasos"**
3. Haz clic en **"Activar"** y sigue las instrucciones
4. **IMPORTANTE**: Debes completar este paso antes de crear una App Password

### Paso 2: Crear App Password

1. Ve a: https://myaccount.google.com/apppasswords
2. Si no ves la opción, asegúrate de tener la verificación en 2 pasos activada
3. Selecciona:
   - **Aplicación**: "Correo"
   - **Dispositivo**: "Otro (nombre personalizado)"
   - **Nombre**: "AMVA Digital Backend"
4. Haz clic en **"Generar"**
5. **Copia la contraseña de 16 caracteres** (se muestra solo una vez)
   - Formato: `xxxx xxxx xxxx xxxx` (sin espacios)

### Paso 3: Configurar Variables de Entorno en Render

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio: `ministerio-backend`
3. Ve a: **Environment** (Variables de entorno)
4. Agrega o verifica estas variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

**IMPORTANTE**:
- `SMTP_USER`: Tu email completo de Gmail (ej: `jerlibgnzlz@gmail.com`)
- `SMTP_PASSWORD`: La App Password de 16 caracteres (sin espacios)
- `SMTP_SECURE`: Debe ser `false` para el puerto 587

### Paso 4: Reiniciar el Servicio

1. En Render Dashboard → Tu servicio
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O simplemente espera a que Render detecte los cambios

## 🧪 Probar el Envío de Emails

### Opción 1: Usar el Endpoint de Prueba

```bash
curl -X POST https://ministerio-backend-wdbj.onrender.com/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token-jwt>" \
  -d '{
    "to": "tu_email@gmail.com",
    "subject": "Test Email",
    "body": "Este es un email de prueba desde AMVA Digital"
  }'
```

### Opción 2: Verificar en los Logs

Revisa los logs de Render para ver si hay errores:

1. Ve a: Render Dashboard → Tu servicio → **Logs**
2. Busca mensajes como:
   - `✅ Servicio de email configurado (Gmail SMTP)`
   - `✅ Email enviado exitosamente`
   - `❌ Error enviando email` (si hay problemas)

## 🔍 Errores Comunes y Soluciones

### Error: "EAUTH" (Error de Autenticación)

**Causa**: Credenciales incorrectas o no se está usando App Password

**Solución**:
1. Verifica que `SMTP_USER` sea tu email completo
2. Verifica que `SMTP_PASSWORD` sea la App Password (no tu contraseña normal)
3. Asegúrate de que la App Password no tenga espacios
4. Verifica que la verificación en 2 pasos esté activada

### Error: "ECONNECTION" (Error de Conexión)

**Causa**: Problemas de red o configuración incorrecta

**Solución**:
1. Verifica que `SMTP_HOST=smtp.gmail.com`
2. Verifica que `SMTP_PORT=587`
3. Verifica que `SMTP_SECURE=false`

### Error: "ETIMEDOUT" (Timeout)

**Causa**: Gmail está bloqueando la conexión

**Solución**:
1. Verifica que estés usando App Password
2. Espera unos minutos e intenta de nuevo
3. Verifica que tu cuenta de Gmail no esté bloqueada

### El Email No Llega

**Posibles causas**:
1. Revisa la carpeta de **Spam**
2. Verifica que el email de destino sea válido
3. Revisa los logs de Render para ver si hay errores
4. Verifica que Gmail no haya bloqueado tu cuenta

## 📋 Checklist de Configuración

- [ ] Verificación en 2 pasos habilitada en Gmail
- [ ] App Password creada en Gmail
- [ ] `SMTP_HOST=smtp.gmail.com` configurado en Render
- [ ] `SMTP_PORT=587` configurado en Render
- [ ] `SMTP_SECURE=false` configurado en Render
- [ ] `SMTP_USER=tu_email@gmail.com` configurado en Render
- [ ] `SMTP_PASSWORD=app_password` configurado en Render (sin espacios)
- [ ] Servicio reiniciado en Render
- [ ] Email de prueba enviado exitosamente

## 🔗 Enlaces Útiles

- **Crear App Password**: https://myaccount.google.com/apppasswords
- **Verificación en 2 Pasos**: https://myaccount.google.com/security
- **Seguridad de Gmail**: https://myaccount.google.com/security-checkup

## 💡 Alternativas a Gmail

Si Gmail sigue dando problemas, puedes usar:

1. **SendGrid** (Recomendado para producción)
   - Más confiable para envío masivo
   - Mejor deliverability
   - API más robusta

2. **Mailgun**
   - Similar a SendGrid
   - Buena para transaccionales

3. **Amazon SES**
   - Muy económico
   - Requiere configuración AWS

## 📝 Notas Importantes

- **NUNCA uses tu contraseña normal de Gmail** en producción
- **Siempre usa App Password** para aplicaciones
- **No compartas tu App Password** públicamente
- **Gmail tiene límites de envío**: 500 emails/día para cuentas gratuitas
- **Para envío masivo**, considera usar SendGrid o similar

