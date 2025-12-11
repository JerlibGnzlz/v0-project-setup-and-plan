# ✅ Checklist Completo: SendGrid en Render

## 🎯 Estado Actual

✅ **Email verificado:** `jerlibgnzlz@gmail.com` está verificado en SendGrid (Single Sender Verification)

## 📋 Variables de Entorno Necesarias en Render

### Variables OBLIGATORIAS

```bash
# 1. Proveedor de email (debe ser "sendgrid")
EMAIL_PROVIDER=sendgrid

# 2. API Key de SendGrid (empieza con SG.)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Email remitente (debe ser EXACTAMENTE el email verificado)
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com

# 4. Nombre del remitente (opcional pero recomendado)
SENDGRID_FROM_NAME=AMVA Digital
```

### Variables que PUEDES ELIMINAR (no son necesarias con SendGrid)

```bash
❌ SMTP_HOST=smtp.gmail.com
❌ SMTP_PORT=587
❌ SMTP_SECURE=false
❌ SMTP_USER=jerlibgnzlz@gmail.com
❌ SMTP_PASSWORD=iswisphueoxplwvp
```

## 🔍 Cómo Verificar en Render

### Paso 1: Ir a Variables de Entorno

1. Ve a tu servicio en Render: https://dashboard.render.com
2. Selecciona tu servicio backend
3. Ve a **Settings** → **Environment**
4. Busca las variables listadas arriba

### Paso 2: Verificar Cada Variable

#### ✅ EMAIL_PROVIDER
- **Valor esperado:** `sendgrid`
- **No debe ser:** `gmail`, `smtp`, o estar vacío
- **Verificación:** Debe estar exactamente como `sendgrid` (minúsculas)

#### ✅ SENDGRID_API_KEY
- **Valor esperado:** `SG.` seguido de muchos caracteres
- **Formato:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Cómo obtener:**
  1. Ve a SendGrid → Settings → API Keys
  2. Si ya tienes una, cópiala completa
  3. Si no, crea una nueva con "Full Access"
  4. Copia la key completa (solo se muestra una vez)

#### ✅ SENDGRID_FROM_EMAIL
- **Valor esperado:** `jerlibgnzlz@gmail.com`
- **⚠️ IMPORTANTE:**
  - Debe ser **exactamente** igual al email verificado en SendGrid
  - No debe tener espacios antes o después
  - Debe estar en minúsculas
  - No debe tener saltos de línea

#### ✅ SENDGRID_FROM_NAME
- **Valor esperado:** `AMVA Digital` (o cualquier nombre que quieras)
- **Opcional:** Si no está, se usará "AMVA Digital" por defecto

## 🔧 Pasos para Configurar en Render

### 1. Obtener API Key de SendGrid

1. Ve a SendGrid → Settings → API Keys
2. Si ya tienes una API Key:
   - Verifica que tenga "Full Access" o al menos "Mail Send"
   - Si no, edítala y selecciona "Full Access"
3. Si no tienes una:
   - Haz clic en "Create API Key"
   - Nombre: `amvamail` (o el que prefieras)
   - Permisos: Selecciona "Full Access"
   - Haz clic en "Create & View"
   - **IMPORTANTE:** Copia la API Key completa (solo se muestra una vez)
   - Formato: `SG.xxx...` (muchos caracteres)

### 2. Configurar Variables en Render

1. Ve a Render → Tu servicio → Settings → Environment
2. Haz clic en "Add Environment Variable" para cada una:

   **Variable 1:**
   - Key: `EMAIL_PROVIDER`
   - Value: `sendgrid`
   - Save

   **Variable 2:**
   - Key: `SENDGRID_API_KEY`
   - Value: `SG.xxx...` (pega la API Key completa)
   - Save

   **Variable 3:**
   - Key: `SENDGRID_FROM_EMAIL`
   - Value: `jerlibgnzlz@gmail.com` (exactamente así, sin espacios)
   - Save

   **Variable 4:**
   - Key: `SENDGRID_FROM_NAME`
   - Value: `AMVA Digital`
   - Save

### 3. Eliminar Variables SMTP (Opcional pero Recomendado)

Si tienes estas variables, puedes eliminarlas (no son necesarias con SendGrid):

1. Busca `SMTP_HOST` → Eliminar
2. Busca `SMTP_PORT` → Eliminar
3. Busca `SMTP_SECURE` → Eliminar
4. Busca `SMTP_USER` → Eliminar
5. Busca `SMTP_PASSWORD` → Eliminar

**Nota:** Si las dejas, no causarán problemas, pero es mejor eliminarlas para mantener la configuración limpia.

### 4. Reiniciar el Servicio

Después de configurar las variables:

1. Ve a tu servicio en Render
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. Espera a que termine el deploy (puede tardar unos minutos)

## ✅ Verificación Post-Configuración

### 1. Verificar Logs al Iniciar

Después de reiniciar, revisa los logs de Render. Deberías ver:

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: jerlibgnzlz@gmail.com
```

**Si NO ves esto:**
- Verifica que `EMAIL_PROVIDER=sendgrid` esté configurado
- Verifica que `SENDGRID_API_KEY` tenga el valor correcto
- Verifica que `SENDGRID_FROM_EMAIL` sea exactamente `jerlibgnzlz@gmail.com`

### 2. Probar Envío de Email

**Opción A: Crear una Inscripción**
1. Ve a la landing page
2. Completa el formulario de inscripción
3. Revisa los logs de Render inmediatamente
4. Busca mensajes como:
   ```
   📧 Preparando email con SendGrid para email@example.com...
   ✅ Email enviado exitosamente a email@example.com (SendGrid)
   ```

**Opción B: Enviar Recordatorios**
1. Ve al admin dashboard
2. Haz clic en "Enviar Recordatorios"
3. Revisa los logs de Render inmediatamente
4. Busca mensajes como:
   ```
   📧 Iniciando envío de recordatorios de pago...
   ✅ Email enviado exitosamente a email@example.com (SendGrid)
   ```

### 3. Verificar Errores

Si ves errores en los logs:

**Error 403 Forbidden:**
```
❌ Error enviando email con SendGrid: Forbidden
⚠️ Error 403 Forbidden de SendGrid: El email "from" no está verificado.
```

**Solución:**
- Verifica que `SENDGRID_FROM_EMAIL` sea exactamente `jerlibgnzlz@gmail.com`
- Verifica que el email esté verificado en SendGrid (checkmark verde ✅)

**Error 401 Unauthorized:**
```
❌ Error enviando email con SendGrid: Unauthorized
⚠️ Error 401 Unauthorized de SendGrid
```

**Solución:**
- Verifica que `SENDGRID_API_KEY` tenga el valor correcto
- Verifica que la API Key tenga permisos de "Mail Send" o "Full Access"
- Si es necesario, crea una nueva API Key

## 📊 Checklist Final

Antes de reportar un problema, verifica:

- [ ] `EMAIL_PROVIDER=sendgrid` está configurado en Render
- [ ] `SENDGRID_API_KEY` tiene el valor completo (empieza con `SG.`)
- [ ] `SENDGRID_FROM_EMAIL` es exactamente `jerlibgnzlz@gmail.com` (sin espacios)
- [ ] `SENDGRID_FROM_NAME` está configurado (opcional pero recomendado)
- [ ] El email `jerlibgnzlz@gmail.com` está verificado en SendGrid (checkmark verde ✅)
- [ ] La API Key tiene permisos de "Mail Send" o "Full Access"
- [ ] El servicio en Render se reinició después de configurar las variables
- [ ] Los logs muestran `✅ Servicio de email configurado (SendGrid)`
- [ ] Los logs muestran `✅ Email enviado exitosamente` cuando envías un email

## 🎯 Resumen

**Lo que ya tienes:**
- ✅ Email verificado en SendGrid: `jerlibgnzlz@gmail.com`

**Lo que necesitas en Render:**
1. `EMAIL_PROVIDER=sendgrid`
2. `SENDGRID_API_KEY=SG.xxx...` (tu API Key completa)
3. `SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com` (exactamente así)
4. `SENDGRID_FROM_NAME=AMVA Digital` (opcional)

**Pasos:**
1. Obtener API Key de SendGrid
2. Configurar variables en Render
3. Reiniciar servicio
4. Verificar logs

## 💡 Tips

1. **Copia y pega** el email directamente de SendGrid para evitar errores de tipeo
2. **Verifica los logs** después de cada cambio
3. **Reinicia el servicio** después de cambiar variables de entorno
4. **No uses espacios** en las variables de entorno
5. **La API Key solo se muestra una vez** - guárdala en un lugar seguro

## 🐛 Troubleshooting

### Problema: "Servicio de email no configurado"

**Causa:** `EMAIL_PROVIDER` no está configurado o no es `sendgrid`

**Solución:**
1. Verifica que `EMAIL_PROVIDER=sendgrid` esté en Render
2. Reinicia el servicio

### Problema: "SENDGRID_FROM_EMAIL no configurado"

**Causa:** La variable no está configurada o tiene espacios

**Solución:**
1. Verifica que `SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com` esté en Render
2. Asegúrate de que no tenga espacios antes o después
3. Reinicia el servicio

### Problema: "Error 403 Forbidden"

**Causa:** El email no está verificado o no coincide exactamente

**Solución:**
1. Verifica que el email esté verificado en SendGrid (checkmark verde ✅)
2. Verifica que `SENDGRID_FROM_EMAIL` sea exactamente igual al verificado
3. Reinicia el servicio

### Problema: "Error 401 Unauthorized"

**Causa:** La API Key es inválida o no tiene permisos

**Solución:**
1. Verifica que `SENDGRID_API_KEY` tenga el valor correcto
2. Verifica que la API Key tenga permisos de "Mail Send" o "Full Access"
3. Si es necesario, crea una nueva API Key
4. Actualiza `SENDGRID_API_KEY` en Render
5. Reinicia el servicio

