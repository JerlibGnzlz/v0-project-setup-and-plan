# 🔧 Solucionar SMTP desde Render (Gmail bloqueado)

## ⚠️ Problema

Gmail SMTP **NO funciona** desde servicios cloud como Render o Digital Ocean debido a:
- Gmail bloquea conexiones desde IPs desconocidas
- Render usa IPs dinámicas que Gmail no reconoce
- Timeout de conexión (`ETIMEDOUT`)
- Error: `Connection timeout` al intentar enviar emails

## ✅ Soluciones (de mejor a peor)

### Opción 1: SendGrid (⭐ RECOMENDADO - 5 minutos)

**Ventajas:**
- ✅ Funciona perfectamente desde Render
- ✅ Plan gratuito: 100 emails/día
- ✅ Configuración simple
- ✅ Confiable y rápido

**Pasos:**

1. **Crear cuenta en SendGrid**
   - Ve a https://sendgrid.com
   - Crea cuenta gratuita
   - Verifica tu email

2. **Verificar un email sender**
   - Settings → Sender Authentication → Verify a Single Sender
   - Completa el formulario y verifica el email que te envían

3. **Crear API Key**
   - Settings → API Keys → Create API Key
   - Nombre: `AMVA Backend`
   - Permisos: `Full Access` o `Mail Send`
   - Copia la API Key (solo se muestra una vez)

4. **Configurar en Render**
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=tu_email_verificado@ejemplo.com
   SENDGRID_FROM_NAME=AMVA Digital
   ```

5. **Guardar y esperar** (Render reinicia automáticamente)

**Resultado:** ✅ Emails funcionando desde Render

---

### Opción 2: Resend (⭐ ALTERNATIVA - 5 minutos)

**Ventajas:**
- ✅ Funciona perfectamente desde Render
- ✅ Plan gratuito: 3,000 emails/mes
- ✅ API moderna y fácil de usar

**Pasos:**

1. **Crear cuenta en Resend**
   - Ve a https://resend.com
   - Crea cuenta gratuita
   - Verifica tu email

2. **Verificar dominio o email**
   - **Opción A**: Verifica un dominio propio (mejor)
     - Domains → Add Domain → Configura DNS
   - **Opción B**: Verifica un email individual
     - Emails → Add Email → Verifica el email

3. **Crear API Key**
   - API Keys → Create API Key
   - Nombre: `AMVA Backend`
   - Copia la API Key

4. **Configurar en Render**
   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=email_verificado@ejemplo.com
   RESEND_FROM_NAME=AMVA Digital
   ```

5. **Guardar y esperar** (Render reinicia automáticamente)

**Resultado:** ✅ Emails funcionando desde Render

---

### Opción 3: SMTP Relay (⚠️ COMPLEJO - No recomendado)

Si **absolutamente necesitas** usar SMTP desde Render, puedes usar un servicio SMTP Relay:

#### 3.1. Mailgun (Gratis hasta 5,000 emails/mes)

1. **Crear cuenta en Mailgun**
   - Ve a https://www.mailgun.com
   - Crea cuenta gratuita
   - Verifica tu dominio o email

2. **Obtener credenciales SMTP**
   - Dashboard → Sending → SMTP Credentials
   - Copia: `SMTP Hostname`, `SMTP Port`, `SMTP Username`, `SMTP Password`

3. **Configurar en Render**
   ```env
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=postmaster@tudominio.mailgun.org
   SMTP_PASSWORD=tu_password_de_mailgun
   ```

#### 3.2. Amazon SES (Requiere AWS)

1. **Configurar Amazon SES**
   - Crea cuenta en AWS
   - Verifica dominio o email en SES
   - Crea credenciales SMTP

2. **Configurar en Render**
   ```env
   EMAIL_PROVIDER=smtp
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu_smtp_username_de_aws
   SMTP_PASSWORD=tu_smtp_password_de_aws
   ```

**⚠️ Nota:** Estos servicios requieren configuración adicional y pueden ser más complejos que SendGrid/Resend.

---

### Opción 4: Gmail SMTP con VPN/Proxy (❌ NO RECOMENDADO)

**Problemas:**
- Requiere servidor VPN/proxy adicional
- Más costoso
- Más complejo de mantener
- Puede violar términos de servicio de Gmail

**No recomendado** para producción.

---

## 🎯 Recomendación Final

**Para producción desde Render:**

1. **Primera opción:** SendGrid (más fácil, funciona perfectamente)
2. **Segunda opción:** Resend (más emails gratis, también funciona perfectamente)
3. **Última opción:** SMTP Relay (Mailgun o Amazon SES)

**NO uses Gmail SMTP directamente desde Render** - siempre fallará con timeout.

---

## 🔄 Detección Automática

El sistema ahora detecta automáticamente el mejor proveedor disponible:

```env
# Si tienes SendGrid configurado, lo usará automáticamente
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=email@ejemplo.com

# Si tienes Resend configurado, lo usará automáticamente
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=email@ejemplo.com

# Si solo tienes SMTP_USER, intentará SMTP (puede fallar desde Render)
SMTP_USER=email@gmail.com
SMTP_PASSWORD=app_password
```

**Puedes dejar `EMAIL_PROVIDER` sin configurar** y el sistema detectará automáticamente el mejor proveedor disponible.

---

## 📊 Comparación de Proveedores

| Proveedor | Funciona desde Render | Plan Gratuito | Configuración | Recomendado |
|-----------|----------------------|---------------|---------------|-------------|
| **SendGrid** | ✅ Sí | 100 emails/día | ⭐ Fácil | ⭐⭐⭐⭐⭐ |
| **Resend** | ✅ Sí | 3,000 emails/mes | ⭐ Fácil | ⭐⭐⭐⭐⭐ |
| **Mailgun** | ✅ Sí | 5,000 emails/mes | ⭐⭐ Media | ⭐⭐⭐⭐ |
| **Amazon SES** | ✅ Sí | 62,000 emails/mes | ⭐⭐⭐ Compleja | ⭐⭐⭐ |
| **Gmail SMTP** | ❌ No | Ilimitado | ⭐ Fácil | ❌ No funciona |

---

## 🆘 Troubleshooting

### Problema: "Connection timeout" con Gmail SMTP

**Solución:** Configura SendGrid o Resend (ver Opción 1 o 2 arriba)

### Problema: SendGrid retorna 403 Forbidden

**Causa:** Email no verificado

**Solución:**
1. Ve a SendGrid → Settings → Sender Authentication
2. Verifica el email que configuraste en `SENDGRID_FROM_EMAIL`
3. Haz clic en el enlace de verificación que te enviaron

### Problema: Resend retorna "domain is not verified"

**Causa:** Estás usando un email de Gmail sin verificar

**Solución:**
1. Ve a Resend → Domains → Add Domain
2. Verifica tu dominio propio
3. O usa Resend → Emails → Add Email para verificar un email individual

---

**Última actualización**: Diciembre 2025  
**Tiempo estimado para configurar SendGrid/Resend**: 5 minutos  
**Resultado**: Emails funcionando desde Render ✅

