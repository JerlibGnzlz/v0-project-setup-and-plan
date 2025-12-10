# 🔍 Diagnosticar Error 403 de SendGrid (Email Verificado)

## ✅ Tu Situación

Tienes el email **jerlibgnzlz@gmail.com** verificado en SendGrid, pero sigues recibiendo errores 403.

## 🔎 Checklist de Verificación

### 1. Variables de Entorno en Render

Verifica que tengas **EXACTAMENTE** estas variables configuradas:

```bash
# OBLIGATORIO: Debe ser "sendgrid"
EMAIL_PROVIDER=sendgrid

# OBLIGATORIO: Tu API Key de SendGrid (empieza con SG.)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OBLIGATORIO: Debe ser EXACTAMENTE el email verificado
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com

# OPCIONAL: Nombre que aparecerá como remitente
SENDGRID_FROM_NAME=AMVA Digital
```

**⚠️ IMPORTANTE:**
- `SENDGRID_FROM_EMAIL` debe ser **EXACTAMENTE** igual al email verificado
- No debe tener espacios antes o después
- Debe estar en minúsculas (o exactamente como está en SendGrid)

### 2. Verificar que el Email Coincida Exactamente

En SendGrid, tu email verificado es:
- **Email**: `jerlibgnzlz@gmail.com`
- **Estado**: ✅ Verificado

En Render, `SENDGRID_FROM_EMAIL` debe ser:
```
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
```

**NO debe ser:**
- ❌ `JerlibGnzlz@gmail.com` (mayúsculas)
- ❌ `jerlibgnzlz@Gmail.com` (mayúsculas en dominio)
- ❌ ` jerlibgnzlz@gmail.com ` (espacios)
- ❌ `jerlibgnzlz@gmail.com\n` (saltos de línea)

### 3. Verificar API Key

1. Ve a SendGrid → Settings → API Keys
2. Verifica que la API Key tenga **"Full Access"** o al menos **"Mail Send"**
3. Copia la API Key completa (empieza con `SG.`)
4. En Render, verifica que `SENDGRID_API_KEY` tenga el valor completo sin espacios

### 4. Verificar que SendGrid Esté Configurado

Revisa los logs de Render al iniciar el backend. Deberías ver:

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: jerlibgnzlz@gmail.com
```

Si ves esto, SendGrid está configurado correctamente.

### 5. Verificar el Error Específico

Cuando intentas enviar un email, revisa los logs de Render. Busca mensajes como:

**Error 403 común:**
```
❌ Error enviando email con SendGrid: Forbidden
⚠️ Error 403 Forbidden de SendGrid: El email "from" no está verificado.
```

**Si ves este error:**
1. Ve a SendGrid → Settings → Sender Authentication
2. Verifica que `jerlibgnzlz@gmail.com` esté en la lista
3. Verifica que tenga el checkmark verde ✅
4. Si no está verificado, haz clic en "Verify" y sigue los pasos

### 6. Verificar Dominio vs Single Sender

SendGrid tiene dos tipos de verificación:
- **Single Sender Verification**: Para un email específico (lo que tienes)
- **Domain Authentication**: Para un dominio completo

**Para tu caso (Single Sender):**
- El email `jerlibgnzlz@gmail.com` debe estar verificado como Single Sender
- Debe aparecer en la lista con el checkmark verde ✅
- `SENDGRID_FROM_EMAIL` debe ser exactamente `jerlibgnzlz@gmail.com`

## 🔧 Pasos para Resolver

### Paso 1: Verificar Variables en Render

1. Ve a tu servicio en Render
2. Settings → Environment
3. Verifica que tengas:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxx... (tu API key completa)
   SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
   SENDGRID_FROM_NAME=AMVA Digital
   ```

### Paso 2: Verificar Email en SendGrid

1. Ve a SendGrid → Settings → Sender Authentication
2. Verifica que `jerlibgnzlz@gmail.com` esté en la lista
3. Verifica que tenga el checkmark verde ✅
4. Si no está verificado:
   - Haz clic en "Verify"
   - Revisa tu email y confirma la verificación
   - Espera a que aparezca el checkmark verde

### Paso 3: Reiniciar el Servicio en Render

1. Después de verificar las variables, reinicia el servicio en Render
2. Ve a tu servicio → Manual Deploy → Clear build cache & deploy
3. Espera a que termine el deploy
4. Revisa los logs para ver si SendGrid se configuró correctamente

### Paso 4: Probar Envío de Email

1. Intenta enviar un email (por ejemplo, crear una inscripción)
2. Revisa los logs de Render
3. Busca mensajes como:
   - ✅ `Email enviado exitosamente a ... (SendGrid)`
   - ❌ `Error enviando email con SendGrid: ...`

## 🐛 Errores Comunes

### Error: "The from address does not match a verified Sender Identity"

**Causa**: El email en `SENDGRID_FROM_EMAIL` no coincide con el verificado.

**Solución**:
1. Ve a SendGrid → Settings → Sender Authentication
2. Copia el email exacto que está verificado
3. En Render, actualiza `SENDGRID_FROM_EMAIL` con ese email exacto
4. Reinicia el servicio

### Error: "API key does not have permission"

**Causa**: La API Key no tiene permisos de "Mail Send".

**Solución**:
1. Ve a SendGrid → Settings → API Keys
2. Edita tu API Key
3. Selecciona "Full Access" o "Custom Access" con "Mail Send" habilitado
4. Guarda los cambios
5. En Render, actualiza `SENDGRID_API_KEY` con la nueva key (si es necesario)

### Error: "Email not verified"

**Causa**: El email no está verificado en SendGrid.

**Solución**:
1. Ve a SendGrid → Settings → Sender Authentication
2. Si el email no está en la lista, haz clic en "Create New Sender"
3. Completa el formulario y verifica el email
4. Espera a que aparezca el checkmark verde ✅

## 📋 Checklist Final

Antes de reportar un problema, verifica:

- [ ] `EMAIL_PROVIDER=sendgrid` está configurado en Render
- [ ] `SENDGRID_API_KEY` tiene el valor completo (empieza con `SG.`)
- [ ] `SENDGRID_FROM_EMAIL` es exactamente `jerlibgnzlz@gmail.com` (sin espacios, minúsculas)
- [ ] El email `jerlibgnzlz@gmail.com` está verificado en SendGrid (checkmark verde ✅)
- [ ] La API Key tiene permisos de "Mail Send" o "Full Access"
- [ ] El servicio en Render se reinició después de configurar las variables
- [ ] Los logs muestran `✅ Servicio de email configurado (SendGrid)`

## 🔍 Comandos para Verificar

Si tienes acceso SSH a Render (o localmente):

```bash
# Verificar que las variables estén configuradas
echo "EMAIL_PROVIDER: $EMAIL_PROVIDER"
echo "SENDGRID_FROM_EMAIL: $SENDGRID_FROM_EMAIL"
echo "SENDGRID_API_KEY: ${SENDGRID_API_KEY:0:10}..." # Solo primeros 10 caracteres por seguridad

# Verificar que no haya espacios
echo "SENDGRID_FROM_EMAIL length: ${#SENDGRID_FROM_EMAIL}"
```

## 💡 Tips

1. **Siempre usa minúsculas** para el email en `SENDGRID_FROM_EMAIL`
2. **Copia y pega** el email directamente de SendGrid para evitar errores de tipeo
3. **Verifica los logs** después de cada cambio
4. **Reinicia el servicio** después de cambiar variables de entorno

