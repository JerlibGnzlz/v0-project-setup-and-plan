# 📧 Configurar Sistema para Usar Solo Gmail SMTP

## 🎯 Objetivo

Configurar el sistema para usar **SOLO Gmail SMTP**, como funcionaba en desarrollo, sin depender de SendGrid.

## ✅ Variables Necesarias en Render

Ve a **Render → Tu Servicio → Settings → Environment Variables** y configura:

### 1. Cambiar EMAIL_PROVIDER

**IMPORTANTE:** Cambia esta variable:

- **Key:** `EMAIL_PROVIDER`
- **Value:** `gmail` (o `smtp`)

**NO debe ser:**
- ❌ `EMAIL_PROVIDER=sendgrid`
- ❌ `EMAIL_PROVIDER=resend`

### 2. Variables SMTP (Todas Requeridas)

Agrega estas 5 variables:

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
- **Value:** `iswisphueoxplwvp` (tu App Password de Gmail, sin espacios)

## 📋 Pasos en Render

### Paso 1: Cambiar EMAIL_PROVIDER

1. Ve a Render → Tu Servicio → Settings → Environment Variables
2. Busca la variable `EMAIL_PROVIDER`
3. Si existe, edítala y cambia el valor a `gmail`
4. Si no existe, créala con:
   - **Key:** `EMAIL_PROVIDER`
   - **Value:** `gmail`

### Paso 2: Agregar Variables SMTP

Si aún no las tienes, agrega las 5 variables SMTP:

1. `SMTP_HOST=smtp.gmail.com`
2. `SMTP_PORT=587`
3. `SMTP_SECURE=false`
4. `SMTP_USER=jerlibgnzlz@gmail.com`
5. `SMTP_PASSWORD=iswisphueoxplwvp`

### Paso 3: Reiniciar el Servicio

**IMPORTANTE:** Después de cambiar las variables:

1. Ve a la pestaña **Events** o **Logs**
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. O espera a que Render detecte los cambios y reinicie automáticamente

## ✅ Verificar que Funciona

Después de reiniciar, revisa los logs. Deberías ver:

```
✅ Servicio de email configurado (Gmail SMTP)
📧 SMTP: smtp.gmail.com:587
👤 Usuario: jerlibgnzlz@gmail.com
```

**NO deberías ver:**
- ❌ `✅ Servicio de email configurado (SendGrid)`
- ❌ `⚠️ SendGrid no configurado`

## 🧪 Probar el Sistema

1. Ve al admin dashboard → Inscripciones
2. Haz clic en "Enviar Recordatorios de Pago"
3. Revisa los logs de Render

**Logs esperados:**
```
📧 Preparando email con SMTP para email@example.com...
📧 Enviando email a email@example.com desde jerlibgnzlz@gmail.com (SMTP)...
✅ Email enviado exitosamente a email@example.com (SMTP)
   Message ID: xxx...
   Response: 250 2.0.0 OK xxx...
```

## 🔍 Troubleshooting

### Problema: "Servicio de email no configurado"

**Causa:** Faltan variables SMTP o están mal escritas

**Solución:**
1. Verifica que todas las 5 variables SMTP estén en Render
2. Verifica que los nombres sean exactos (case-sensitive)
3. Verifica que `EMAIL_PROVIDER=gmail` esté configurado

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

### Problema: Sigue intentando usar SendGrid

**Causa:** `EMAIL_PROVIDER` no está configurado o es `sendgrid`

**Solución:**
1. Verifica que `EMAIL_PROVIDER=gmail` esté en Render
2. Reinicia el servicio después de cambiar la variable
3. Revisa los logs para confirmar que dice "Gmail SMTP" y no "SendGrid"

## 📊 Comparación: SendGrid vs SMTP

### SendGrid (Anterior)
- ❌ Límite de 100 emails/día (plan gratuito)
- ❌ Se agota rápidamente
- ❌ Requiere verificación de email
- ✅ Mejor deliverability (en planes de pago)

### Gmail SMTP (Actual)
- ✅ Límite de ~500 emails/día
- ✅ Funciona como en desarrollo
- ✅ No requiere servicios externos
- ✅ Más confiable para desarrollo/pruebas

## 🎯 Resultado Final

Con esta configuración:

- ✅ El sistema usará **SOLO Gmail SMTP**
- ✅ No intentará usar SendGrid
- ✅ Funcionará como en desarrollo
- ✅ Los emails llegarán correctamente
- ✅ No habrá problemas de créditos agotados

## 🔒 Seguridad

**IMPORTANTE:** Las App Passwords de Gmail son sensibles:

- ✅ No compartirlas públicamente
- ✅ No commitearlas en Git
- ✅ Solo usarlas en variables de entorno seguras (Render)
- ✅ Regenerarlas si crees que fueron comprometidas

---

**Última actualización:** Diciembre 2025

