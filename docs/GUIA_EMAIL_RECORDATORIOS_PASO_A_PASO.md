# 📧 Guía Paso a Paso: Configurar Emails para Recordatorios

Elige **una** de las dos opciones. **Resend** es la recomendada para Digital Ocean.

---

## Opción A: Resend (Recomendada para producción)

Resend funciona bien desde Digital Ocean. Gmail SMTP suele fallar desde servidores cloud.

### Paso 1: Crear cuenta en Resend

1. Abre **https://resend.com**
2. Clic en **"Start for free"** o **"Sign Up"**
3. Regístrate con tu email (ej: `jerlibgnzlz@gmail.com`)
4. Verifica tu email (revisa la bandeja de entrada y haz clic en el enlace)

### Paso 2: Verificar el email que enviará los correos

1. En Resend, ve a **"Emails"** en el menú lateral
2. Clic en **"Add Email"** o **"Verify Email"**
3. Ingresa el email que usarás como remitente: `jerlibgnzlz@gmail.com`
4. Clic en **"Send Verification Email"**
5. Revisa tu Gmail y haz clic en **"Verify Email"** en el correo de Resend
6. Debe aparecer un ✅ verde junto al email en Resend

### Paso 3: Crear API Key

1. En Resend, ve a **"API Keys"** en el menú lateral
2. Clic en **"Create API Key"**
3. Nombre: `AMVA Producción` (o el que prefieras)
4. Permiso: **"Full Access"** o **"Sending Access"**
5. Clic en **"Add"**
6. **Copia la API Key inmediatamente** (solo se muestra una vez)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 4: Configurar en el servidor (Digital Ocean)

1. Conéctate por SSH:
   ```bash
   ssh root@64.225.115.122
   ```

2. Edita el archivo .env del backend:
   ```bash
   nano /var/www/amva-production/backend/.env
   ```

3. Añade o modifica estas líneas (usa tu API Key real):
   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
   RESEND_FROM_NAME=AMVA Digital
   ```

4. Guarda: `Ctrl+O`, `Enter`, luego `Ctrl+X`

5. Reinicia el backend:
   ```bash
   pm2 restart amva-backend
   ```

### Paso 5: Probar

1. Ve a **https://amva.org.es/admin/inscripciones**
2. Clic en el botón **"Recordatorios"**
3. Confirma el envío
4. Los emails deberían enviarse correctamente

---

## Opción B: Gmail SMTP (Puede fallar desde Digital Ocean)

⚠️ **Advertencia:** Gmail suele bloquear conexiones SMTP desde servidores cloud (Digital Ocean, Render, etc.). Si falla, usa Resend.

### Paso 1: Crear App Password en Google

1. Ve a **https://myaccount.google.com**
2. Inicia sesión con tu cuenta Gmail
3. Ve a **Seguridad** → **Verificación en 2 pasos** (actívala si no está activa)
4. Ve a **Seguridad** → **Contraseñas de aplicaciones**
5. Clic en **"Contraseñas de aplicaciones"**
6. Selecciona **"Correo"** y **"Otro (nombre personalizado)"**
7. Escribe: `AMVA Backend`
8. Clic en **"Generar"**
9. **Copia la contraseña de 16 caracteres** (ej: `abcd efgh ijkl mnop`)

### Paso 2: Configurar en el servidor

1. Conéctate por SSH:
   ```bash
   ssh root@64.225.115.122
   ```

2. Edita el .env:
   ```bash
   nano /var/www/amva-production/backend/.env
   ```

3. Añade o modifica (usa tu App Password real, sin espacios):
   ```env
   EMAIL_PROVIDER=gmail
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=jerlibgnzlz@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   ```
   *(Reemplaza `abcdefghijklmnop` con tu App Password de 16 caracteres)*

4. **Importante:** Comenta o elimina las variables de Resend para que use SMTP:
   ```env
   # EMAIL_PROVIDER=resend
   # RESEND_API_KEY=...
   # RESEND_FROM_EMAIL=...
   ```

5. Guarda y reinicia:
   ```bash
   pm2 restart amva-backend
   ```

### Paso 3: Probar

1. Ve a **https://amva.org.es/admin/inscripciones**
2. Clic en **"Recordatorios"**
3. Si falla, revisa los logs: `pm2 logs amva-backend --err`
4. Si ves "EAUTH" o "blocked", Gmail está bloqueando → usa Resend

---

## Resumen de variables por opción

| Variable | Resend | Gmail SMTP |
|----------|--------|------------|
| EMAIL_PROVIDER | `resend` | `gmail` |
| RESEND_API_KEY | `re_xxx...` | — |
| RESEND_FROM_EMAIL | `tu@gmail.com` | — |
| RESEND_FROM_NAME | `AMVA Digital` | — |
| SMTP_HOST | — | `smtp.gmail.com` |
| SMTP_PORT | — | `587` |
| SMTP_USER | — | `tu@gmail.com` |
| SMTP_PASSWORD | — | App Password 16 chars |

---

## Verificar que funciona

```bash
pm2 logs amva-backend --lines 50
```

Deberías ver:
- **Resend:** `✅ Servicio de email configurado (Resend)`
- **SMTP:** `✅ Servicio de email configurado (Gmail SMTP)`

---

**Recomendación:** Usa **Resend** (Opción A). Es más confiable desde Digital Ocean.
