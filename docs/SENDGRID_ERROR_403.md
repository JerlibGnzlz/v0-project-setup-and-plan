# 🔧 Resolver Error 403 Forbidden de SendGrid

## 🐛 Error

```
Error: Forbidden
Status Code: 403
```

## ✅ Soluciones

### 1. Verificar el Email "From" en SendGrid

El error 403 generalmente significa que el email "from" no está verificado.

**Pasos:**
1. Ve a tu cuenta de SendGrid: https://app.sendgrid.com/
2. Ve a **Settings** → **Sender Authentication**
3. Verifica que el email configurado en `SENDGRID_FROM_EMAIL` esté verificado
4. Si no está verificado:
   - Haz clic en **"Verify a Single Sender"** o **"Authenticate Your Domain"**
   - Para empezar rápido, verifica un email individual:
     - Ingresa el email (ej: `admin@ministerio-amva.org`)
     - Verifica el email desde tu bandeja de entrada
     - Confirma la verificación

### 2. Verificar Permisos de la API Key

La API Key debe tener permisos de "Mail Send".

**Pasos:**
1. Ve a **Settings** → **API Keys**
2. Encuentra tu API Key (o créala si no existe)
3. Verifica que tenga permisos de **"Mail Send"** o **"Full Access"**
4. Si no tiene permisos:
   - Edita la API Key
   - Selecciona **"Full Access"** o al menos **"Mail Send"**
   - Guarda los cambios

### 3. Verificar Variables de Entorno en Render

Asegúrate de que estas variables estén configuradas correctamente:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=admin@ministerio-amva.org  ← DEBE estar verificado en SendGrid
SENDGRID_FROM_NAME=AMVA Digital
```

**Importante:**
- `SENDGRID_FROM_EMAIL` DEBE ser un email verificado en SendGrid
- `SENDGRID_API_KEY` DEBE tener permisos de "Mail Send"

### 4. Verificar que la API Key Sea Correcta

1. Ve a **Settings** → **API Keys** en SendGrid
2. Si no estás seguro de cuál es tu API Key:
   - Crea una nueva API Key
   - Nombre: "AMVA Backend Production"
   - Permisos: **"Full Access"** (o al menos "Mail Send")
   - Copia la API Key (solo se muestra una vez)
   - Actualiza `SENDGRID_API_KEY` en Render

## 📋 Checklist de Verificación

- [ ] Cuenta de SendGrid creada y verificada
- [ ] Email "from" verificado en SendGrid (Settings → Sender Authentication)
- [ ] API Key creada con permisos de "Mail Send" o "Full Access"
- [ ] `SENDGRID_API_KEY` configurada en Render (correcta y completa)
- [ ] `SENDGRID_FROM_EMAIL` configurada en Render (debe coincidir con email verificado)
- [ ] `EMAIL_PROVIDER=sendgrid` configurado en Render
- [ ] Servicio reiniciado después de agregar variables

## 🔍 Verificar en Logs

Después de configurar, deberías ver:

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

## 🚨 Si el Error Persiste

1. **Verifica el email "from"**:
   - Debe estar en la lista de "Verified Senders" en SendGrid
   - Si no está, verifícalo siguiendo los pasos de arriba

2. **Verifica la API Key**:
   - Debe tener permisos de "Mail Send"
   - Debe estar activa (no revocada)
   - Debe ser la correcta (sin espacios, completa)

3. **Prueba crear una nueva API Key**:
   - A veces las API Keys pueden tener problemas
   - Crea una nueva con "Full Access"
   - Actualiza en Render

4. **Verifica el plan de SendGrid**:
   - El plan gratuito tiene límites
   - Verifica que no hayas excedido el límite de 100 emails/día

## 🔗 Recursos

- SendGrid Dashboard: https://app.sendgrid.com/
- Documentación SendGrid: https://docs.sendgrid.com/
- Verificar Sender: https://app.sendgrid.com/settings/sender_auth

