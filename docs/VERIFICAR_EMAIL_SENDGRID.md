# ✅ Verificar Email en SendGrid (Paso a Paso)

## 🎯 Problema

Error: **"The from address does not match a verified Sender Identity"**

Esto significa que el email que estás usando como "from" no está verificado en SendGrid.

## 📋 Pasos para Verificar el Email

### Paso 1: Ir a SendGrid

1. Ve a https://app.sendgrid.com/
2. Inicia sesión con tu cuenta

### Paso 2: Verificar Sender Identity

1. En el menú lateral, ve a **Settings** → **Sender Authentication**
2. Verás dos opciones:
   - **Domain Authentication** (recomendado para producción)
   - **Single Sender Verification** (rápido para empezar)

### Paso 3: Verificar un Email Individual (Rápido)

**Para empezar rápido, usa "Single Sender Verification":**

1. Haz clic en **"Verify a Single Sender"**
2. Completa el formulario:
   - **From Email Address**: `admin@ministerio-amva.org` (o el email que quieras usar)
   - **From Name**: `AMVA Digital`
   - **Reply To**: El mismo email o uno diferente
   - **Company Address**: Tu dirección
   - **City**: Tu ciudad
   - **State**: Tu estado/provincia
   - **Country**: Tu país
   - **Zip Code**: Tu código postal
3. Haz clic en **"Create"**
4. **IMPORTANTE**: Revisa tu bandeja de entrada (y spam)
5. Busca el email de verificación de SendGrid
6. Haz clic en el enlace de verificación
7. Confirma la verificación

### Paso 4: Configurar en Render

Una vez verificado el email, agrega estas variables en Render:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=admin@ministerio-amva.org  ← El email que verificaste
SENDGRID_FROM_NAME=AMVA Digital
```

**IMPORTANTE**: `SENDGRID_FROM_EMAIL` debe ser **exactamente** el mismo email que verificaste en SendGrid.

### Paso 5: Reiniciar el Servicio

Después de agregar las variables, Render debería reiniciar automáticamente.

## ✅ Verificación

Después de verificar, deberías ver en los logs:

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: admin@ministerio-amva.org
```

Y al enviar un email:

```
📧 Enviando email a usuario@email.com desde admin@ministerio-amva.org (SendGrid)...
✅ Email enviado exitosamente a usuario@email.com (SendGrid)
   Status Code: 202
```

## 🚨 Problemas Comunes

### Problema 1: No Recibes el Email de Verificación

**Solución:**
- Revisa la carpeta de spam
- Verifica que el email esté correcto
- Espera unos minutos (puede tardar)
- Intenta verificar otro email

### Problema 2: El Email Está Verificado pero Sigue Dando Error

**Solución:**
- Verifica que `SENDGRID_FROM_EMAIL` en Render sea **exactamente** el mismo email verificado
- No debe tener espacios ni caracteres extra
- Debe estar en minúsculas (SendGrid es case-sensitive en algunos casos)
- Reinicia el servicio después de cambiar las variables

### Problema 3: Quieres Usar un Email Gmail

**Solución:**
- Puedes verificar un email Gmail en SendGrid
- Ve a "Single Sender Verification"
- Ingresa tu email Gmail (ej: `jerlibgnzlz@gmail.com`)
- Verifica el email desde tu bandeja de entrada
- Usa ese email en `SENDGRID_FROM_EMAIL`

**Nota**: Es mejor usar un email del dominio del ministerio (ej: `admin@ministerio-amva.org`) para mayor profesionalismo.

## 📝 Checklist

- [ ] Cuenta de SendGrid creada
- [ ] Email verificado en SendGrid (Settings → Sender Authentication)
- [ ] `SENDGRID_FROM_EMAIL` configurado en Render (mismo email verificado)
- [ ] `SENDGRID_API_KEY` configurado en Render
- [ ] `EMAIL_PROVIDER=sendgrid` configurado en Render
- [ ] Servicio reiniciado después de configurar variables
- [ ] Logs muestran "✅ Servicio de email configurado (SendGrid)"

## 🔗 Enlaces Útiles

- SendGrid Dashboard: https://app.sendgrid.com/
- Sender Authentication: https://app.sendgrid.com/settings/sender_auth
- Documentación: https://sendgrid.com/docs/for-developers/sending-email/sender-identity/

