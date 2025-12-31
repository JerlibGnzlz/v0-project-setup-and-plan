# 🔍 Por Qué No Llegan los Emails - Diagnóstico Completo

## 🎯 Problema

Los emails no están llegando a los destinatarios.

---

## 🔍 Diagnóstico Rápido

### Paso 1: Ejecutar Script de Diagnóstico

```bash
cd backend
npm run diagnostico:email
```

Este script te mostrará:
- ✅ Qué proveedor está configurado
- ❌ Qué variables faltan
- 🎯 Qué proveedor se usará
- 📝 Instrucciones específicas para solucionar

---

## 📋 Checklist de Verificación

### 1. Verificar Variables de Entorno en Render

Ve a **Render Dashboard** → Tu servicio backend → **Environment Variables**

**Para Resend (Recomendado):**
- [ ] `EMAIL_PROVIDER=resend`
- [ ] `RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`
- [ ] `RESEND_FROM_NAME=AMVA Digital` (opcional)

**Para SendGrid:**
- [ ] `EMAIL_PROVIDER=sendgrid`
- [ ] `SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] `SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com`
- [ ] `SENDGRID_FROM_NAME=AMVA Digital` (opcional)

**Para Gmail SMTP (NO recomendado):**
- [ ] `EMAIL_PROVIDER=gmail`
- [ ] `SMTP_USER=jerlibgnzlz@gmail.com`
- [ ] `SMTP_PASSWORD=tu_app_password_de_16_caracteres`
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`

---

### 2. Verificar que el Email Esté Verificado

#### Si usas Resend:
1. Ve a: **https://resend.com**
2. Inicia sesión
3. Ve a **"Emails"** o **"Domains"** en el menú lateral
4. Busca `jerlibgnzlz@gmail.com`
5. Debe tener **checkmark verde** ✅ y estado **"Verified"**

**Si NO está verificado:**
- Haz clic en **"Add Email"** o **"Verify Email"**
- Ingresa `jerlibgnzlz@gmail.com`
- Revisa tu Gmail y verifica el email

#### Si usas SendGrid:
1. Ve a: **https://sendgrid.com**
2. Inicia sesión
3. Ve a **Settings** → **Sender Authentication**
4. Busca `jerlibgnzlz@gmail.com`
5. Debe estar **verificado** ✅

**Si NO está verificado:**
- Haz clic en **"Verify Single Sender"**
- Ingresa `jerlibgnzlz@gmail.com`
- Revisa tu Gmail y verifica el email

---

### 3. Verificar Logs del Backend en Render

1. Ve a **Render Dashboard** → Tu servicio backend
2. Haz clic en **"Logs"**
3. Busca mensajes relacionados con email:
   - ✅ `Email enviado exitosamente`
   - ❌ `Error enviando email`
   - ⚠️ `No se pudo configurar ningún proveedor de email`

**Errores comunes:**
- `The gmail.com domain is not verified` → Email no verificado en Resend
- `Maximum credits exceeded` → SendGrid agotó créditos gratuitos
- `Connection timeout` → Gmail SMTP bloqueado desde Render
- `403 Forbidden` → Email no verificado o API Key inválida

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "No se pudo configurar ningún proveedor de email"

**Causa:** Faltan variables de entorno

**Solución:**
1. Ejecuta `npm run diagnostico:email`
2. Configura las variables que faltan en Render
3. Reinicia el servicio en Render

---

### Problema 2: "The gmail.com domain is not verified" (Resend)

**Causa:** El email no está verificado en Resend

**Solución:**
1. Ve a **https://resend.com**
2. Ve a **"Emails"** o **"Domains"**
3. Haz clic en **"Add Email"**
4. Ingresa `jerlibgnzlz@gmail.com`
5. Verifica el email que llega a Gmail

**Guía completa:** `docs/CONFIGURAR_RESEND_PRODUCCION.md`

---

### Problema 3: "Maximum credits exceeded" (SendGrid)

**Causa:** SendGrid agotó los 100 emails/día del plan gratuito

**Solución:**
1. Esperar hasta mañana (el límite se reinicia)
2. O configurar Resend como alternativa
3. O actualizar el plan de SendGrid

**Guía:** `docs/ERROR_SENDGRID_CREDITOS_AGOTADOS.md`

---

### Problema 4: "Connection timeout" (Gmail SMTP)

**Causa:** Gmail bloquea conexiones desde servicios cloud (Render)

**Solución:**
1. Configurar **SendGrid** o **Resend** (recomendado)
2. Gmail SMTP NO funciona bien desde Render

**Guía:** `docs/SOLUCIONAR_SMTP_DESDE_RENDER.md`

---

### Problema 5: Emails llegan pero van a Spam

**Causa:** Falta configuración de SPF/DKIM/DMARC

**Solución:**
1. Verificar que el email esté completamente verificado
2. Configurar dominio propio (opcional, mejora deliverability)
3. Revisar `docs/SOLUCIONAR_EMAILS_EN_SPAM.md`

---

## ✅ Solución Rápida (Recomendada)

### Configurar Resend (Más Fácil)

1. **Crear cuenta en Resend:**
   - Ve a: **https://resend.com**
   - Crea cuenta con `jerlibgnzlz@gmail.com`

2. **Verificar email:**
   - Ve a **"Emails"** o **"Domains"**
   - Haz clic en **"Add Email"**
   - Ingresa `jerlibgnzlz@gmail.com`
   - Verifica el email en Gmail

3. **Crear API Key:**
   - Ve a **"API Keys"**
   - Haz clic en **"Create API Key"**
   - Copia la API Key (formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

4. **Configurar en Render:**
   - Ve a Render Dashboard → Tu servicio backend
   - Ve a **Environment Variables**
   - Agrega:
     ```
     EMAIL_PROVIDER=resend
     RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
     RESEND_FROM_NAME=AMVA Digital
     ```

5. **Reiniciar servicio:**
   - En Render, haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

6. **Verificar:**
   - Ejecuta `npm run diagnostico:email` localmente
   - O prueba el botón de recordatorios en el admin

**Guía completa:** `docs/CONFIGURAR_RESEND_PRODUCCION.md`

---

## 🔍 Verificar que Funciona

### Método 1: Script de Prueba

```bash
cd backend
npm run verify:email-resend
```

Si funciona, verás:
```
✅ EMAIL VERIFICADO Y FUNCIONANDO
✅ Email enviado exitosamente!
```

### Método 2: Probar Botón de Recordatorios

1. Ve al panel admin: `/admin/inscripciones`
2. Haz clic en **"Recordatorios"**
3. Revisa los logs en Render
4. Deberías ver: `✅ Email enviado exitosamente`

---

## 📋 Resumen de Qué Verificar

1. ✅ **Variables de entorno configuradas** en Render
2. ✅ **Email verificado** en Resend/SendGrid
3. ✅ **API Key válida** y con permisos correctos
4. ✅ **Servicio reiniciado** después de cambios
5. ✅ **Logs sin errores** en Render

---

## 🆘 Si Nada Funciona

1. **Ejecuta diagnóstico:**
   ```bash
   cd backend
   npm run diagnostico:email
   ```

2. **Revisa logs en Render:**
   - Busca errores específicos
   - Copia los mensajes de error

3. **Verifica configuración:**
   - Todas las variables están en Render
   - Email está verificado en el proveedor
   - API Key es correcta

4. **Prueba con otro proveedor:**
   - Si Resend falla, prueba SendGrid
   - Si SendGrid falla, prueba Resend

---

**Última actualización**: Diciembre 2025  
**Script de diagnóstico**: `npm run diagnostico:email`

