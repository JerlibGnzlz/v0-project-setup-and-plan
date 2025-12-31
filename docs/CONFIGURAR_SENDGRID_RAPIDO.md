# 🚀 Configurar SendGrid en 5 Minutos (Solución al Timeout de Gmail)

## ⚠️ Problema Actual

Gmail SMTP **NO funciona** desde servicios cloud como Render o Digital Ocean debido a:
- Gmail bloquea conexiones desde IPs desconocidas
- Render usa IPs dinámicas que Gmail no reconoce
- Timeout de conexión (`ETIMEDOUT`)

## ✅ Solución: SendGrid (Recomendado)

SendGrid funciona perfectamente desde Render y es **gratis** hasta 100 emails/día.

### Paso 1: Crear Cuenta en SendGrid

1. Ve a https://sendgrid.com
2. Haz clic en "Start for free"
3. Completa el registro (nombre, email, contraseña)
4. Verifica tu email

### Paso 2: Verificar un Email Sender

1. En SendGrid, ve a **Settings** → **Sender Authentication**
2. Haz clic en **"Verify a Single Sender"**
3. Completa el formulario:
   - **From Email**: Tu email (ej: `noreply@tudominio.com` o tu Gmail)
   - **From Name**: `AMVA Digital`
   - **Reply To**: Tu email
4. Haz clic en **"Create"**
5. **IMPORTANTE**: Verifica el email que SendGrid envía a tu bandeja de entrada
6. Haz clic en el enlace de verificación

### Paso 3: Crear API Key

1. En SendGrid, ve a **Settings** → **API Keys**
2. Haz clic en **"Create API Key"**
3. Nombre: `AMVA Backend`
4. Permisos: Selecciona **"Full Access"** o **"Mail Send"** (mínimo necesario)
5. Haz clic en **"Create & View"**
6. **IMPORTANTE**: Copia la API Key inmediatamente (solo se muestra una vez)
   - Formato: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 4: Configurar en Render

1. Ve a tu proyecto en Render: https://dashboard.render.com
2. Selecciona tu servicio backend
3. Ve a **Environment** → **Environment Variables**
4. Agrega estas variables:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=tu_email_verificado@ejemplo.com
SENDGRID_FROM_NAME=AMVA Digital
```

5. Haz clic en **"Save Changes"**
6. Render reiniciará automáticamente el servicio

### Paso 5: Verificar

1. Espera a que Render reinicie (1-2 minutos)
2. Ve a los logs del backend en Render
3. Deberías ver:

```
📧 Inicializando EmailService con proveedor: sendgrid
✅ Servicio de email configurado (SendGrid)
```

4. Prueba el botón de recordatorios en `/admin/inscripciones`
5. Los emails deberían enviarse correctamente

## 🎯 Resultado

- ✅ SendGrid funciona perfectamente desde Render
- ✅ No más timeouts de conexión
- ✅ Emails llegan correctamente
- ✅ Plan gratuito: 100 emails/día (suficiente para recordatorios)

## 📊 Comparación

| Proveedor | Funciona desde Render | Plan Gratuito | Configuración |
|-----------|----------------------|---------------|---------------|
| **SendGrid** | ✅ Sí | 100 emails/día | ⭐ Fácil |
| **Resend** | ✅ Sí | 3,000 emails/mes | ⭐⭐ Muy fácil |
| **Gmail SMTP** | ❌ No (timeout) | Ilimitado | ⚠️ No funciona desde cloud |

## 🔄 Si Ya Tienes SendGrid Configurado

Si ya tienes `SENDGRID_API_KEY` y `SENDGRID_FROM_EMAIL` configurados, solo necesitas:

```env
EMAIL_PROVIDER=sendgrid
```

El sistema detectará automáticamente SendGrid y lo usará.

## 🆘 Si SendGrid No Funciona

Si SendGrid también falla, verifica:

1. **Email verificado**: El `SENDGRID_FROM_EMAIL` debe estar verificado en SendGrid
2. **API Key válida**: Verifica que la API Key tenga permisos de "Mail Send"
3. **Sin espacios**: La API Key no debe tener espacios al inicio/final
4. **Variables guardadas**: Asegúrate de hacer "Save Changes" en Render

## 📧 Alternativa: Resend

Si prefieres Resend (más emails gratis):

1. Ve a https://resend.com
2. Crea cuenta y verifica email/dominio
3. Crea API Key
4. Configura en Render:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=email_verificado@ejemplo.com
RESEND_FROM_NAME=AMVA Digital
```

---

**Última actualización**: Diciembre 2025  
**Tiempo estimado**: 5 minutos  
**Resultado**: Emails funcionando desde Render ✅

