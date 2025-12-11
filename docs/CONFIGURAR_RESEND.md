# 📧 Configurar Resend para Envío de Emails

## 🎯 Resend Agregado al Proyecto

✅ **Soporte para Resend implementado** - El código ya está listo para usar Resend.

## 📋 Pasos para Configurar Resend

### Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com
2. Haz clic en "Sign Up" o "Get Started"
3. Crea una cuenta (puedes usar Google, GitHub, o email)
4. Verifica tu email

### Paso 2: Obtener API Key

1. Una vez dentro de Resend, ve a **API Keys**
2. Haz clic en **"Create API Key"**
3. Nombre: `amva-production` (o el que prefieras)
4. Permisos: Selecciona **"Full Access"** (o al menos "Send Emails")
5. Haz clic en **"Create"**
6. **IMPORTANTE:** Copia la API Key completa (empieza con `re_`)
   - Solo se muestra una vez
   - Guárdala en un lugar seguro

### Paso 3: Verificar Email o Dominio

Tienes dos opciones:

#### Opción A: Verificar Email Individual (Más Rápido)

1. Ve a **Emails** → **Add Email**
2. Ingresa el email que quieres usar (ej: `noreply@ministerio-amva.org`)
3. Revisa tu email y confirma la verificación
4. Espera a que aparezca el checkmark verde ✅

**Ventaja:** Más rápido, no requiere configuración DNS

**Desventaja:** Solo puedes usar ese email específico

#### Opción B: Verificar Dominio (Recomendado para Producción)

1. Ve a **Domains** → **Add Domain**
2. Ingresa tu dominio (ej: `ministerio-amva.org`)
3. Resend te dará registros DNS para agregar:
   - **SPF Record**
   - **DKIM Record**
   - **DMARC Record** (opcional)
4. Agrega estos registros en tu proveedor DNS (donde compraste el dominio)
5. Espera a que Resend verifique el dominio (puede tardar hasta 48 horas, pero generalmente es más rápido)

**Ventaja:** Puedes usar cualquier email del dominio (ej: `noreply@`, `contacto@`, etc.)

**Desventaja:** Requiere acceso a DNS

### Paso 4: Configurar Variables en Render

1. Ve a tu servicio en Render → **Settings** → **Environment**
2. Agrega estas variables:

```bash
# Proveedor de email (debe ser "resend")
EMAIL_PROVIDER=resend

# API Key de Resend (empieza con re_)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email remitente (debe estar verificado en Resend)
RESEND_FROM_EMAIL=noreply@ministerio-amva.org

# Nombre del remitente (opcional pero recomendado)
RESEND_FROM_NAME=AMVA Digital
```

**⚠️ IMPORTANTE:**
- `RESEND_FROM_EMAIL` debe ser exactamente el email verificado en Resend
- Si verificaste un dominio, puedes usar cualquier email de ese dominio
- Si verificaste un email individual, solo puedes usar ese email

### Paso 5: Eliminar Variables de SendGrid (Opcional)

Si ya no vas a usar SendGrid, puedes eliminar estas variables:

```bash
❌ SENDGRID_API_KEY
❌ SENDGRID_FROM_EMAIL
❌ SENDGRID_FROM_NAME
```

**Nota:** Si las dejas, no causarán problemas. El sistema usará Resend si `EMAIL_PROVIDER=resend`.

### Paso 6: Reiniciar el Servicio

1. Ve a tu servicio en Render
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. Espera a que termine el deploy (puede tardar unos minutos)

## ✅ Verificación

### 1. Verificar Logs al Iniciar

Después de reiniciar, revisa los logs de Render. Deberías ver:

```
✅ Servicio de email configurado (Resend)
📧 Provider: Resend
👤 From: noreply@ministerio-amva.org
```

**Si NO ves esto:**
- Verifica que `EMAIL_PROVIDER=resend` esté configurado
- Verifica que `RESEND_API_KEY` tenga el valor correcto
- Verifica que `RESEND_FROM_EMAIL` sea exactamente el email verificado

### 2. Probar Envío de Email

**Opción A: Crear una Inscripción**
1. Ve a la landing page
2. Completa el formulario de inscripción
3. Revisa los logs de Render inmediatamente
4. Busca mensajes como:
   ```
   📧 Preparando email con Resend para email@example.com...
   📧 Enviando email a email@example.com desde noreply@ministerio-amva.org (Resend)...
   ✅ Email enviado exitosamente a email@example.com (Resend)
   ```

**Opción B: Enviar Recordatorios**
1. Ve al admin dashboard
2. Haz clic en "Enviar Recordatorios"
3. Revisa los logs de Render inmediatamente
4. Busca mensajes similares a los de arriba

## 🐛 Troubleshooting

### Error: "Resend no configurado (falta RESEND_API_KEY)"

**Causa:** La variable `RESEND_API_KEY` no está configurada.

**Solución:**
1. Verifica que `RESEND_API_KEY` esté en Render
2. Verifica que tenga el valor correcto (empieza con `re_`)
3. Reinicia el servicio

### Error: "RESEND_FROM_EMAIL no configurado"

**Causa:** La variable `RESEND_FROM_EMAIL` no está configurada.

**Solución:**
1. Verifica que `RESEND_FROM_EMAIL` esté en Render
2. Verifica que sea exactamente el email verificado en Resend
3. Reinicia el servicio

### Error: "403 Forbidden" de Resend

**Causa:** El email "from" no está verificado en Resend.

**Solución:**
1. Ve a Resend → Emails o Domains
2. Verifica que el email esté verificado (checkmark verde ✅)
3. Si verificaste un dominio, asegúrate de que el email sea de ese dominio
4. En Render, verifica que `RESEND_FROM_EMAIL` sea exactamente igual al verificado

### Error: "401 Unauthorized" de Resend

**Causa:** La API Key es inválida o fue revocada.

**Solución:**
1. Ve a Resend → API Keys
2. Verifica que la API Key tenga permisos correctos
3. Si es necesario, crea una nueva API Key
4. Actualiza `RESEND_API_KEY` en Render
5. Reinicia el servicio

## 📊 Comparación: Resend vs SendGrid

| Característica | Resend | SendGrid |
|----------------|--------|----------|
| **Facilidad de uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentación** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gratis** | 3,000/mes | 100/día |
| **Deliverability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **API** | Simple | Compleja |
| **Soporte** | Excelente | Bueno |

## 💡 Tips

1. **Usa un dominio verificado** para mejor deliverability
2. **Guarda la API Key** en un lugar seguro (solo se muestra una vez)
3. **Verifica los logs** después de cada cambio
4. **Reinicia el servicio** después de cambiar variables
5. **Prueba con un email real** antes de usar en producción

## 🎯 Resumen

**Variables necesarias en Render:**
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=noreply@ministerio-amva.org
RESEND_FROM_NAME=AMVA Digital
```

**Pasos:**
1. Crear cuenta en Resend
2. Obtener API Key
3. Verificar email o dominio
4. Configurar variables en Render
5. Reiniciar servicio
6. Verificar logs

¡Listo! Resend está configurado y funcionando. 🚀

