# ⚠️ SendGrid: Créditos Agotados

## 🔴 Problema

**Error:** `Maximum credits exceeded`

**Causa:** SendGrid ha agotado los créditos del plan gratuito.

## 📊 Límites del Plan Gratuito de SendGrid

- **100 emails por día** (se reinicia a medianoche UTC)
- **Límite mensual:** ~3,000 emails/mes (100 × 30 días)

## ✅ Soluciones

### Opción 1: Esperar hasta Mañana (Gratis)

El límite diario se reinicia automáticamente a medianoche UTC.

**Ventajas:**
- ✅ Gratis
- ✅ No requiere cambios

**Desventajas:**
- ❌ No puedes enviar más emails hoy
- ❌ Puede volver a pasar mañana

### Opción 2: Usar Gmail SMTP como Fallback (Recomendado)

El sistema ahora detecta automáticamente cuando SendGrid se queda sin créditos y usa Gmail SMTP como fallback.

**Configuración necesaria en Render:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=tu_app_password_de_gmail
```

**Cómo obtener App Password de Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Mail" y "Other (Custom name)"
3. Escribe "AMVA Digital" o similar
4. Copia la contraseña generada (16 caracteres)
5. Úsala como `SMTP_PASSWORD` en Render

**Ventajas:**
- ✅ Funciona automáticamente cuando SendGrid falla
- ✅ No requiere actualizar el plan de SendGrid
- ✅ Gmail permite ~500 emails/día (más que SendGrid gratuito)

**Desventajas:**
- ⚠️ Requiere configurar App Password de Gmail
- ⚠️ Gmail puede tener límites de envío si envías muchos emails

### Opción 3: Actualizar Plan de SendGrid (Pago)

1. Ve a SendGrid → Settings → Billing
2. Actualiza a un plan de pago
3. Los planes empiezan desde $15/mes (40,000 emails)

**Ventajas:**
- ✅ Más créditos disponibles
- ✅ Mejor deliverability
- ✅ Analytics avanzados

**Desventajas:**
- ❌ Requiere pago mensual
- ❌ Puede ser costoso si no envías muchos emails

## 🔄 Fallback Automático

El sistema ahora detecta automáticamente cuando SendGrid se queda sin créditos y:

1. **Detecta el error:** `Maximum credits exceeded`
2. **Registra el problema:** Logs claros explicando el problema
3. **Usa fallback automático:** Cambia a Gmail SMTP si está configurado
4. **Continúa funcionando:** Los emails se envían normalmente

### Logs Esperados

**Cuando SendGrid falla por créditos:**
```
❌ Error enviando email con SendGrid a email@example.com:
   ⚠️ ERROR: SendGrid ha agotado sus créditos gratuitos
   → El plan gratuito de SendGrid incluye 100 emails por día
   → Has alcanzado el límite de créditos
   🔄 Cambiando automáticamente a Gmail SMTP como fallback...
⚠️ SendGrid sin créditos, usando Gmail SMTP como fallback automático...
📧 Preparando email con SMTP para email@example.com...
✅ Email enviado exitosamente a email@example.com (SMTP)
```

## 📋 Checklist de Configuración

### Para Usar Fallback Automático a Gmail SMTP

- [ ] `SMTP_HOST=smtp.gmail.com` configurado en Render
- [ ] `SMTP_PORT=587` configurado en Render
- [ ] `SMTP_SECURE=false` configurado en Render
- [ ] `SMTP_USER=jerlibgnzlz@gmail.com` configurado en Render
- [ ] `SMTP_PASSWORD=tu_app_password` configurado en Render (App Password de 16 caracteres)
- [ ] App Password generada en https://myaccount.google.com/apppasswords
- [ ] Reiniciar servicio en Render después de configurar variables

### Verificar que Funciona

1. Revisa los logs de Render
2. Busca: `✅ Servicio de email configurado (Gmail SMTP)` o `✅ Servicio de email configurado (SendGrid)`
3. Si SendGrid falla, deberías ver: `🔄 Cambiando automáticamente a Gmail SMTP como fallback...`

## 🎯 Recomendación

**Para producción:** Configura Gmail SMTP como fallback automático. Esto asegura que:

1. ✅ Los emails se envíen incluso si SendGrid se queda sin créditos
2. ✅ No tengas que esperar hasta mañana
3. ✅ El sistema funcione de forma más confiable

**Configuración recomendada:**
- `EMAIL_PROVIDER=sendgrid` (principal)
- `SMTP_USER` y `SMTP_PASSWORD` configurados (fallback automático)

## 📊 Monitoreo

### Verificar Créditos de SendGrid

1. Ve a SendGrid → Dashboard
2. Revisa "Email Activity" → "Usage"
3. Verás cuántos emails has enviado hoy y cuántos quedan

### Verificar Límites de Gmail

- Gmail permite ~500 emails/día
- Si envías más, Gmail puede bloquear temporalmente
- Revisa la bandeja de entrada de Gmail para ver si hay advertencias

## 🐛 Troubleshooting

### Problema: "SMTP no configurado" cuando SendGrid falla

**Causa:** No tienes `SMTP_USER` y `SMTP_PASSWORD` configurados

**Solución:** Configura las variables de SMTP en Render (ver checklist arriba)

### Problema: Gmail SMTP también falla

**Causa:** App Password incorrecta o Gmail bloqueando conexiones

**Solución:**
1. Verifica que el App Password sea correcto (16 caracteres, sin espacios)
2. Verifica que "Less secure app access" esté habilitado (si aplica)
3. Revisa los logs para ver el error específico de Gmail

### Problema: SendGrid sigue fallando después de actualizar el plan

**Causa:** Puede tardar unos minutos en activarse

**Solución:** Espera 5-10 minutos y prueba nuevamente

---

**Última actualización:** Diciembre 2025

