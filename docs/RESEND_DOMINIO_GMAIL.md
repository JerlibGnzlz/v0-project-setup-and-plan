# ⚠️ Resend: No Se Puede Usar Gmail Directamente

## 🐛 Problema

Resend está rechazando los emails con este error:

```
The gmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

## 🔍 Causa

**Resend NO permite usar emails de Gmail directamente** (como `jerlibgnzlz@gmail.com`).

Resend requiere que:
- Verifiques un dominio propio (ej: `ministerio-amva.org`)
- O verifiques un email individual (pero no de Gmail)

## ✅ Soluciones

### Opción 1: Verificar un Dominio Propio (Recomendado) ⭐⭐⭐

**Ventajas:**
- ✅ Puedes usar cualquier email del dominio (ej: `noreply@ministerio-amva.org`)
- ✅ Mejor deliverability
- ✅ Más profesional

**Pasos:**

1. **Ve a Resend → Domains → Add Domain**
2. **Ingresa tu dominio** (ej: `ministerio-amva.org`)
3. **Resend te dará registros DNS:**
   - SPF Record
   - DKIM Record
   - DMARC Record (opcional)
4. **Agrega estos registros en tu proveedor DNS:**
   - Ve a donde compraste tu dominio (GoDaddy, Namecheap, etc.)
   - Ve a la configuración DNS
   - Agrega los registros que Resend te dio
5. **Espera verificación** (puede tardar hasta 48 horas, pero generalmente es más rápido)
6. **Actualiza en Render:**
   ```
   RESEND_FROM_EMAIL=noreply@ministerio-amva.org
   ```
7. **Reinicia el servicio**

### Opción 2: Verificar Email Individual (No Gmail)

**Ventajas:**
- ✅ Más rápido que verificar dominio
- ✅ No requiere configuración DNS

**Desventajas:**
- ⚠️ Solo puedes usar ese email específico
- ⚠️ NO funciona con Gmail

**Pasos:**

1. **Ve a Resend → Emails → Add Email**
2. **Ingresa un email** que NO sea de Gmail (ej: `contacto@tudominio.com`)
3. **Revisa tu email y confirma la verificación**
4. **Espera verificación** (checkmark verde ✅)
5. **Actualiza en Render:**
   ```
   RESEND_FROM_EMAIL=contacto@tudominio.com
   ```
6. **Reinicia el servicio**

### Opción 3: Usar SendGrid o SMTP (Más Rápido) ⭐

Si no tienes un dominio propio y necesitas una solución rápida:

**Cambiar a SendGrid:**
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com (verificado en SendGrid)
```

**O cambiar a Gmail SMTP:**
```
EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=tu-app-password
```

## 🎯 Recomendación

**Para HOY (Solución Rápida):**
- Usa **SendGrid** con `jerlibgnzlz@gmail.com` (ya está verificado)
- O usa **Gmail SMTP** (ya está configurado)

**Para el FUTURO (Solución Ideal):**
- Verifica un dominio propio en Resend
- Usa `noreply@ministerio-amva.org` o similar
- Mejor deliverability y más profesional

## 📋 Checklist

Si quieres usar Resend con dominio propio:

- [ ] Tienes un dominio (ej: `ministerio-amva.org`)
- [ ] Acceso a la configuración DNS del dominio
- [ ] Agregar registros DNS en Resend
- [ ] Esperar verificación del dominio
- [ ] Actualizar `RESEND_FROM_EMAIL` en Render
- [ ] Reiniciar servicio

## 💡 Nota Importante

**Resend es excelente**, pero requiere un dominio propio o un email verificado (no Gmail).

Si no tienes dominio propio, **SendGrid es la mejor opción** porque:
- ✅ Permite usar Gmail verificado
- ✅ Ya lo tienes configurado
- ✅ Funciona inmediatamente

## 🔄 Cambiar a SendGrid (Solución Inmediata)

Si quieres cambiar a SendGrid ahora mismo:

1. **En Render, actualiza las variables:**
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxx... (tu API Key)
   SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
   SENDGRID_FROM_NAME=AMVA Digital
   ```

2. **Elimina o comenta las variables de Resend:**
   ```
   # RESEND_API_KEY=re_xxx...
   # RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
   # RESEND_FROM_NAME=AMVA Digital
   ```

3. **Reinicia el servicio**

4. **Verifica los logs:**
   ```
   ✅ Servicio de email configurado (SendGrid)
   ```

¡Y listo! SendGrid funcionará inmediatamente con tu email de Gmail verificado.

