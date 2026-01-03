# 🔧 Solución: Emails No Llegan a Gmail

## 📋 Diagnóstico Rápido

Si los emails de recuperación de contraseña no están llegando a Gmail, sigue estos pasos:

### 1️⃣ Ejecutar Script de Diagnóstico

```bash
# Desde la raíz del proyecto
cd backend
npx ts-node scripts/diagnostico-email-forgot-password.ts tu-email@gmail.com
```

Este script verificará:
- ✅ Si el usuario existe en la base de datos
- ✅ Si las variables de entorno están configuradas
- ✅ Si el proveedor de email está funcionando
- ✅ Intentará enviar un email de prueba

### 2️⃣ Verificar Variables de Entorno

Asegúrate de tener configuradas estas variables en **Render/Vercel**:

#### Para SendGrid (Recomendado):
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=tu-email@gmail.com
FRONTEND_URL=https://tu-dominio.com
```

#### Para Resend:
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=tu-email@gmail.com
FRONTEND_URL=https://tu-dominio.com
```

#### Para Gmail SMTP (No recomendado desde cloud):
```env
EMAIL_PROVIDER=gmail
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
FRONTEND_URL=https://tu-dominio.com
```

### 3️⃣ Verificar Email "From" Verificado

**IMPORTANTE**: El email "from" DEBE estar verificado en el proveedor:

#### SendGrid:
1. Ve a [SendGrid Dashboard](https://app.sendgrid.com/)
2. Settings → Sender Authentication
3. Verifica que tu email Gmail esté verificado (checkmark verde ✅)
4. Si no está verificado:
   - Haz clic en "Verify a Single Sender"
   - Ingresa tu email Gmail
   - Revisa tu Gmail y haz clic en el enlace de verificación

#### Resend:
1. Ve a [Resend Dashboard](https://resend.com/)
2. Emails → Add Email
3. Ingresa tu email Gmail
4. Haz clic en "Send Verification Email"
5. Revisa tu Gmail y haz clic en "Verify Email"

### 4️⃣ Revisar Carpeta de SPAM

Los emails pueden llegar a la carpeta de **SPAM**:

1. Abre Gmail
2. Ve a la carpeta "Spam" (o "Correo no deseado")
3. Busca emails de "AMVA Digital" o "Recuperación de Contraseña"
4. Si lo encuentras:
   - Marca como "No es spam"
   - Mueve a la bandeja de entrada
   - Agrega el remitente a contactos

### 5️⃣ Verificar Logs del Servidor

Revisa los logs del servidor en **Render/Vercel** para ver errores:

```bash
# En Render, ve a tu servicio → Logs
# Busca mensajes que contengan:
- "EmailService"
- "SendGrid"
- "Resend"
- "SMTP"
- "Error enviando email"
```

**Errores comunes y soluciones:**

#### Error: "Forbidden" (403)
- **Causa**: Email "from" no verificado o API Key sin permisos
- **Solución**: Verifica el email en SendGrid/Resend Dashboard

#### Error: "Unauthorized" (401)
- **Causa**: API Key inválida o revocada
- **Solución**: Genera una nueva API Key y actualiza `SENDGRID_API_KEY` o `RESEND_API_KEY`

#### Error: "ETIMEDOUT" o "Timeout"
- **Causa**: Gmail SMTP bloqueado desde servicios cloud
- **Solución**: Usa SendGrid o Resend en lugar de Gmail SMTP

#### Error: "Maximum credits exceeded"
- **Causa**: Límite de emails gratuitos alcanzado (SendGrid: 100/día)
- **Solución**: Espera hasta mañana o actualiza el plan

### 6️⃣ Probar Envío Manual

Puedes probar enviar un email manualmente usando el script:

```bash
cd backend
npx ts-node scripts/diagnostico-email-forgot-password.ts tu-email@gmail.com
```

Si el script dice "✅ EMAIL ENVIADO EXITOSAMENTE" pero no llega:
- Revisa la carpeta de SPAM
- Espera unos minutos (puede tardar)
- Verifica que el email "from" esté verificado

## 🔍 Problemas Comunes

### ❌ Problema: "No se detectó ningún proveedor configurado"

**Solución:**
1. Verifica que las variables de entorno estén configuradas en Render/Vercel
2. Reinicia el servicio después de agregar variables
3. Verifica que los nombres de las variables sean correctos (mayúsculas/minúsculas)

### ❌ Problema: "SendGrid/Resend configurado pero no funciona"

**Solución:**
1. Verifica que el email "from" esté verificado en SendGrid/Resend
2. Verifica que la API Key tenga permisos de "Mail Send"
3. Genera una nueva API Key si es necesario
4. Revisa los logs del servidor para ver el error específico

### ❌ Problema: "Gmail SMTP funciona localmente pero no en producción"

**Causa**: Gmail bloquea conexiones SMTP desde servicios cloud (Render, Digital Ocean, etc.)

**Solución**: Usa SendGrid o Resend en producción (recomendado)

### ❌ Problema: "Emails llegan a SPAM"

**Solución:**
1. Verifica que el email "from" esté verificado en SendGrid/Resend
2. Usa un dominio propio en lugar de Gmail (opcional, pero mejor)
3. Configura SPF y DKIM en tu dominio (si usas dominio propio)
4. Pide a los usuarios que marquen como "No es spam"

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El usuario existe en la base de datos
- [ ] Las variables de entorno están configuradas en Render/Vercel
- [ ] El email "from" está verificado en SendGrid/Resend
- [ ] La API Key tiene permisos de "Mail Send"
- [ ] Revisaste la carpeta de SPAM en Gmail
- [ ] Esperaste unos minutos (puede tardar)
- [ ] Revisaste los logs del servidor
- [ ] Ejecutaste el script de diagnóstico

## 🚀 Solución Recomendada

**Para producción, usa SendGrid o Resend:**

1. **SendGrid** (Recomendado):
   - Plan gratuito: 100 emails/día
   - Fácil de configurar
   - Funciona desde servicios cloud
   - Buena deliverability

2. **Resend** (Alternativa):
   - Plan gratuito: 3,000 emails/mes
   - API moderna
   - Funciona desde servicios cloud
   - Buena deliverability

3. **Gmail SMTP** (Solo desarrollo):
   - ❌ NO recomendado para producción
   - ❌ Puede estar bloqueado desde servicios cloud
   - ❌ Límites estrictos de Gmail

## 📞 Soporte Adicional

Si después de seguir estos pasos el problema persiste:

1. Ejecuta el script de diagnóstico y comparte la salida
2. Comparte los logs del servidor (sin información sensible)
3. Verifica que el email "from" esté verificado
4. Verifica que las variables de entorno estén correctas

---

**Última actualización**: Enero 2025

