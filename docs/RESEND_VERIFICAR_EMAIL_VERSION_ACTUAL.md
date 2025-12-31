# 📧 Verificar Email en Resend - Versión Actual (2025)

## 🎯 Problema

En la nueva versión de Resend, la interfaz cambió y no se encuentra fácilmente la opción para verificar emails individuales.

---

## ✅ Solución 1: Usar la API Directamente (Más Rápido)

Puedes verificar el email **probando enviar un email de prueba**. Si funciona, significa que está verificado (o Resend lo verificará automáticamente).

### Paso 1: Crear API Key en Resend

1. Ve a: **https://resend.com**
2. Inicia sesión
3. Ve a **"API Keys"** en el menú lateral
4. Haz clic en **"Create API Key"**
5. **Name:** `AMVA Backend`
6. **Permission:** `Full Access`
7. Haz clic en **"Create"**
8. **⚠️ Copia la API Key inmediatamente** (solo se muestra una vez)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 2: Configurar en Render

Ve a **Render Dashboard** → Tu servicio backend → **Environment Variables**:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
RESEND_FROM_NAME=AMVA Digital
```

### Paso 3: Probar con Script

```bash
cd backend
npm run verify:email-resend
```

**Si funciona:**
- ✅ El email está verificado (o Resend lo verificó automáticamente)
- ✅ Puedes usar el botón de recordatorios

**Si falla con "domain not verified":**
- ⚠️ Necesitas verificar manualmente (ver Solución 2)

---

## ✅ Solución 2: Buscar en Otras Secciones

### Método A: Desde Settings

1. En Resend Dashboard, haz clic en **"Settings"** (icono de engranaje ⚙️)
2. Busca secciones como:
   - **"Sender Authentication"**
   - **"Email Verification"**
   - **"Verified Emails"**
   - **"Domains & Emails"**
3. Dentro de ahí debería estar la opción para agregar emails

### Método B: Desde la URL Directa

Intenta ir directamente a estas URLs:

- **https://resend.com/emails**
- **https://resend.com/settings/emails**
- **https://resend.com/settings/sender-authentication**
- **https://resend.com/domains** (y buscar opción de email individual)

### Método C: Buscar en la Barra Superior

1. Mira la **barra superior** de Resend Dashboard
2. Busca pestañas o menús desplegables que digan:
   - **"Emails"**
   - **"Domains"**
   - **"Settings"**
3. Haz clic y busca la opción de verificar email

---

## ✅ Solución 3: Verificar Automáticamente al Enviar

**Resend puede verificar automáticamente** el email cuando intentas enviar por primera vez:

1. **Configura las variables en Render** (sin verificar antes)
2. **Intenta enviar un email** (botón de recordatorios)
3. **Resend enviará un email de verificación** a `jerlibgnzlz@gmail.com`
4. **Verifica el email** que llega a Gmail
5. **Vuelve a intentar** enviar el email

---

## ✅ Solución 4: Usar la API de Resend Directamente

Si tienes acceso a la terminal, puedes verificar el email usando la API de Resend:

### Instalar Resend CLI (Opcional)

```bash
npm install -g resend-cli
```

### O usar curl directamente

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer TU_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "jerlibgnzlz@gmail.com",
    "to": "jerlibgnzlz@gmail.com",
    "subject": "Test - Verificación",
    "html": "<p>Este es un email de prueba</p>"
  }'
```

**Si funciona:**
- ✅ El email está verificado
- ✅ Puedes usar Resend normalmente

**Si falla con "domain not verified":**
- ⚠️ Resend enviará un email de verificación
- ⚠️ Verifica el email que llega
- ⚠️ Vuelve a intentar

---

## ✅ Solución 5: Contactar Soporte de Resend

Si ninguna de las opciones anteriores funciona:

1. Ve a: **https://resend.com/support**
2. Crea un ticket explicando:
   - Quieres verificar un email individual (`jerlibgnzlz@gmail.com`)
   - No encuentras la opción en el Dashboard
   - Necesitas ayuda para verificar el email
3. El soporte te guiará paso a paso

---

## 🎯 Método Recomendado (Más Simple)

### Opción Rápida: Probar Directamente

1. **Crea API Key en Resend** (Solución 1, Paso 1)
2. **Configura variables en Render** (Solución 1, Paso 2)
3. **Ejecuta el script de prueba:**
   ```bash
   cd backend
   npm run verify:email-resend
   ```

**Si funciona:**
- ✅ Todo está bien, puedes usar Resend

**Si falla:**
- ⚠️ Resend probablemente enviará un email de verificación
- ⚠️ Verifica el email que llega a Gmail
- ⚠️ Vuelve a ejecutar el script

---

## 📋 Checklist de Verificación

- [ ] Creé cuenta en Resend
- [ ] Creé API Key en Resend
- [ ] Configuré variables en Render:
  - [ ] `EMAIL_PROVIDER=resend`
  - [ ] `RESEND_API_KEY=re_xxx...`
  - [ ] `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`
- [ ] Ejecuté `npm run verify:email-resend`
- [ ] Si falló, verifiqué el email que llegó a Gmail
- [ ] Volví a ejecutar el script y funcionó

---

## 🔍 Qué Buscar en Resend Dashboard (Versión Actual)

### Menú Lateral Típico:

```
📊 Dashboard
📧 Emails          ← Puede estar aquí
🌐 Domains         ← O aquí
🔑 API Keys
⚙️ Settings        ← O aquí dentro
📈 Logs
```

### Barra Superior:

```
Home | Emails | Domains | API Keys | Settings | Logs
```

### Dentro de Settings:

```
Settings
├── General
├── Sender Authentication  ← Busca aquí
├── Email Verification     ← O aquí
└── Billing
```

---

## 🆘 Si Nada Funciona

### Usar SendGrid como Alternativa

Si Resend es muy complicado, puedes usar SendGrid:

1. Ve a: **https://sendgrid.com**
2. Crea cuenta
3. Ve a **Settings** → **Sender Authentication** → **Verify Single Sender**
4. Verifica `jerlibgnzlz@gmail.com`
5. Crea API Key
6. Configura en Render:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxx...
   SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
   ```

**Guía completa:** `docs/CONFIGURAR_SENDGRID_RAPIDO.md`

---

## ✅ Resumen

**Método más simple:**
1. Crea API Key en Resend
2. Configura variables en Render
3. Ejecuta `npm run verify:email-resend`
4. Si falla, verifica el email que llega
5. Vuelve a intentar

**No necesitas encontrar la opción en el Dashboard** - Resend puede verificar automáticamente al intentar enviar.

---

**Última actualización**: Diciembre 2025  
**Versión de Resend**: Nueva interfaz 2025  
**Método recomendado**: Probar directamente con script

