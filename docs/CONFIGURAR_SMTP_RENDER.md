# 📧 Configurar Gmail SMTP en Render (Fallback Automático)

## ✅ Variables a Configurar en Render

Ve a **Render → Tu Servicio → Settings → Environment** y agrega estas variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=iswisphueoxplwvp
```

## ⚠️ Importante: Verificar SMTP_PASSWORD

**Las App Passwords de Gmail son de 16 caracteres SIN ESPACIOS.**

Tu contraseña actual: `iswisphueoxplwvp`

**Verifica que:**
- ✅ No tenga espacios
- ✅ Tenga exactamente 16 caracteres
- ✅ Sea la contraseña completa que te dio Google

Si tiene espacios, **elimínalos** antes de agregarla en Render.

## 📋 Pasos para Configurar en Render

### 1. Ir a Environment Variables

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. Ve a **Settings** (en el menú lateral)
4. Busca la sección **Environment Variables**
5. Haz clic en **Add Environment Variable**

### 2. Agregar Cada Variable

Agrega estas 5 variables una por una:

**Variable 1:**
- **Key:** `SMTP_HOST`
- **Value:** `smtp.gmail.com`

**Variable 2:**
- **Key:** `SMTP_PORT`
- **Value:** `587`

**Variable 3:**
- **Key:** `SMTP_SECURE`
- **Value:** `false`

**Variable 4:**
- **Key:** `SMTP_USER`
- **Value:** `jerlibgnzlz@gmail.com`

**Variable 5:**
- **Key:** `SMTP_PASSWORD`
- **Value:** `iswisphueoxplwvp` (sin espacios, 16 caracteres)

### 3. Reiniciar el Servicio

Después de agregar todas las variables:

1. Ve a la pestaña **Events** o **Logs**
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. O simplemente espera a que Render detecte los cambios y reinicie automáticamente

## ✅ Verificar que Funciona

Después de reiniciar, revisa los logs. Deberías ver:

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: jerlibgnzlz@gmail.com
```

Y también deberías ver que SMTP está configurado (aunque no se muestre explícitamente, estará disponible como fallback).

### Cuando SendGrid Falle por Créditos

Verás en los logs:

```
❌ Error enviando email con SendGrid a email@example.com:
   ⚠️ ERROR: SendGrid ha agotado sus créditos gratuitos
   🔄 Cambiando automáticamente a Gmail SMTP como fallback...
⚠️ SendGrid sin créditos, usando Gmail SMTP como fallback automático...
📧 Preparando email con SMTP para email@example.com...
✅ Email enviado exitosamente a email@example.com (SMTP)
```

## 🔍 Troubleshooting

### Problema: "SMTP no configurado" en los logs

**Causa:** Falta alguna variable o está mal escrita

**Solución:**
1. Verifica que todas las 5 variables estén en Render
2. Verifica que los nombres sean exactos (case-sensitive)
3. Verifica que los valores sean correctos (sin espacios extra)

### Problema: "Error de autenticación SMTP"

**Causa:** La App Password es incorrecta o tiene espacios

**Solución:**
1. Verifica que `SMTP_PASSWORD` tenga exactamente 16 caracteres
2. Elimina cualquier espacio
3. Si sigue fallando, genera una nueva App Password:
   - Ve a https://myaccount.google.com/apppasswords
   - Genera una nueva para "Mail"
   - Úsala como `SMTP_PASSWORD`

### Problema: "Connection timeout"

**Causa:** Firewall o problemas de red

**Solución:**
1. Verifica que `SMTP_HOST=smtp.gmail.com` esté correcto
2. Verifica que `SMTP_PORT=587` esté correcto
3. Verifica que `SMTP_SECURE=false` esté configurado

## 📊 Orden de Prioridad

El sistema intentará enviar emails en este orden:

1. **SendGrid** (si `EMAIL_PROVIDER=sendgrid` y tiene créditos)
2. **Gmail SMTP** (fallback automático si SendGrid falla)
3. **Resend** (si está configurado como alternativa)

## 🎯 Resultado Esperado

Con esta configuración:

- ✅ SendGrid funcionará normalmente cuando tenga créditos
- ✅ Gmail SMTP se usará automáticamente cuando SendGrid se quede sin créditos
- ✅ Los emails se enviarán sin interrupciones
- ✅ No tendrás que esperar hasta mañana cuando SendGrid se quede sin créditos

## 🔒 Seguridad

**IMPORTANTE:** Las App Passwords de Gmail son sensibles. Asegúrate de:

- ✅ No compartirlas públicamente
- ✅ No commitearlas en Git
- ✅ Solo usarlas en variables de entorno seguras (como Render)
- ✅ Regenerarlas si crees que fueron comprometidas

---

**Última actualización:** Diciembre 2025

