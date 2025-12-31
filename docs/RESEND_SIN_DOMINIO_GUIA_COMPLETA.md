# 📧 Usar Resend SIN Dominio Propio - Guía Completa

## ✅ Respuesta Rápida

**SÍ, puedes usar Resend sin dominio propio.** Resend permite verificar **emails individuales** (como `jerlibgnzlz@gmail.com`) sin necesidad de tener un dominio.

---

## 🎯 Dos Opciones en Resend

### Opción 1: Verificar Email Individual (Sin Dominio) ✅

**Perfecto para ti:**
- ✅ No necesitas dominio propio
- ✅ Verificas `jerlibgnzlz@gmail.com` directamente
- ✅ Funciona inmediatamente
- ✅ Ideal para empezar

**Limitaciones:**
- ⚠️ Solo puedes enviar desde el email verificado
- ⚠️ Deliverability puede ser ligeramente menor que con dominio
- ⚠️ Pero sigue siendo mejor que Gmail SMTP

---

### Opción 2: Verificar Dominio Propio (Opcional)

**Para el futuro:**
- ✅ Mejor deliverability
- ✅ Puedes enviar desde cualquier email del dominio
- ✅ Más profesional
- ⚠️ Requiere configurar registros DNS

**No es necesario ahora**, puedes hacerlo después si quieres mejorar.

---

## 🚀 Configurar Resend con Email Individual (Sin Dominio)

### Paso 1: Crear Cuenta en Resend

1. Ve a: **https://resend.com**
2. Haz clic en **"Start for free"** o **"Sign Up"**
3. Ingresa tu email: `jerlibgnzlz@gmail.com`
4. Crea una contraseña
5. Confirma tu cuenta

---

### Paso 2: Verificar Email Individual

**Método A: Desde "Emails" (Si está disponible)**

1. En Resend Dashboard, busca **"Emails"** en el menú lateral
2. Haz clic en **"Add Email"** o **"Verify Email"**
3. Ingresa: `jerlibgnzlz@gmail.com`
4. Haz clic en **"Send Verification Email"**
5. Revisa tu Gmail y verifica el email

**Método B: Desde "Domains" (Más común)**

1. En Resend Dashboard, haz clic en **"Domains"** en el menú lateral
2. Busca un botón o enlace que diga:
   - **"Verify Email"**
   - **"Add Email"**
   - **"Verify an email address instead"**
   - **"Use email instead of domain"**
3. Haz clic ahí
4. Ingresa: `jerlibgnzlz@gmail.com`
5. Haz clic en **"Send Verification Email"**
6. Revisa tu Gmail y verifica el email

**Método C: Desde Settings**

1. En Resend Dashboard, haz clic en **"Settings"**
2. Busca **"Sender Authentication"** o **"Email Verification"**
3. Haz clic en **"Add Email"** o **"Verify Email"**
4. Ingresa: `jerlibgnzlz@gmail.com`
5. Verifica el email

---

### Paso 3: Verificar el Email en Gmail

1. Abre tu Gmail (`jerlibgnzlz@gmail.com`)
2. Busca un email de Resend con asunto tipo:
   - "Verify your email address"
   - "Confirm your email"
   - "Verify email - Resend"
3. Haz clic en el botón **"Verify Email"** o en el enlace
4. Serás redirigido a Resend confirmando la verificación

---

### Paso 4: Crear API Key

1. En Resend Dashboard, ve a **"API Keys"** en el menú lateral
2. Haz clic en **"Create API Key"** o el botón **"+"**
3. **Name:** Ingresa `AMVA Backend` o `AMVA Production`
4. **Permission:** Selecciona **"Full Access"** o **"Sending Access"**
5. Haz clic en **"Add"** o **"Create API Key"**
6. **⚠️ IMPORTANTE:** Copia la API Key inmediatamente (solo se muestra una vez)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Ejemplo: `re_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
7. Guárdala en un lugar seguro

---

### Paso 5: Configurar en Render

1. Ve a **Render Dashboard** → Tu servicio backend
2. Ve a **Environment Variables**
3. Agrega estas variables:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
RESEND_FROM_NAME=AMVA Digital
```

**Reemplaza:**
- `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con tu API Key real
- `jerlibgnzlz@gmail.com` con tu email (debe ser el mismo que verificaste)

---

### Paso 6: Reiniciar Servicio en Render

1. En Render Dashboard, ve a tu servicio backend
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O simplemente espera a que se reinicie automáticamente

---

### Paso 7: Verificar que Funciona

**Método 1: Script de Verificación**

```bash
cd backend
npm run verify:email-resend
```

Si funciona, verás:
```
✅ EMAIL VERIFICADO Y FUNCIONANDO
✅ Email enviado exitosamente!
```

**Método 2: Probar Botón de Recordatorios**

1. Ve al panel admin: `/admin/inscripciones`
2. Haz clic en **"Recordatorios"**
3. Revisa los logs en Render
4. Deberías ver: `✅ Email enviado exitosamente`

---

## ✅ Ventajas de Resend con Email Individual

### Comparado con Gmail SMTP:

| Aspecto | Gmail SMTP | Resend (Email Individual) |
|---------|------------|---------------------------|
| **Funciona desde Render** | ❌ No (timeout) | ✅ Sí |
| **Deliverability** | ⚠️ Media | ✅ Buena |
| **Límite gratuito** | ⚠️ Limitado | ✅ 3,000 emails/mes |
| **Configuración** | ⚠️ Compleja | ✅ Simple |
| **Dominio requerido** | ❌ No | ❌ No |

### Comparado con SendGrid:

| Aspecto | SendGrid | Resend (Email Individual) |
|---------|----------|---------------------------|
| **Límite gratuito** | 100 emails/día | 3,000 emails/mes |
| **Deliverability** | ✅ Buena | ✅ Buena |
| **Configuración** | ⚠️ Más compleja | ✅ Más simple |
| **Dominio requerido** | ⚠️ Recomendado | ❌ No necesario |

---

## 🎯 Resumen: Qué Necesitas

### Para usar Resend SIN dominio:

1. ✅ **Cuenta en Resend** (gratis)
2. ✅ **Email verificado** (`jerlibgnzlz@gmail.com`)
3. ✅ **API Key** creada en Resend
4. ✅ **Variables configuradas** en Render:
   - `EMAIL_PROVIDER=resend`
   - `RESEND_API_KEY=tu_api_key`
   - `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`

**Eso es todo.** No necesitas dominio propio.

---

## 🔮 Para el Futuro: Agregar Dominio (Opcional)

Si más adelante quieres mejorar la deliverability:

1. **Compra un dominio** (ej: `amvadigital.com`)
2. **En Resend**, ve a **"Domains"** → **"Add Domain"**
3. **Configura registros DNS** que te da Resend:
   - SPF
   - DKIM
   - DMARC
4. **Verifica el dominio** en Resend
5. **Actualiza** `RESEND_FROM_EMAIL` a `noreply@amvadigital.com`

**Pero esto NO es necesario ahora.** Puedes empezar con email individual.

---

## 🆘 Si No Encuentras la Opción para Verificar Email

### Solución: Usar Script de Verificación

Si no encuentras la opción en Resend Dashboard, puedes verificar si el email funciona probando enviar:

```bash
cd backend
npm run verify:email-resend
```

Si funciona, significa que el email ya está verificado (o Resend lo verificó automáticamente).

Si falla con error "domain not verified", entonces necesitas verificar manualmente en Resend Dashboard.

---

## ✅ Checklist Final

- [ ] Creé cuenta en Resend
- [ ] Verifiqué `jerlibgnzlz@gmail.com` en Resend
- [ ] Creé API Key en Resend
- [ ] Configuré variables en Render:
  - [ ] `EMAIL_PROVIDER=resend`
  - [ ] `RESEND_API_KEY=re_xxx...`
  - [ ] `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`
- [ ] Reinicié el servicio en Render
- [ ] Probé con `npm run verify:email-resend`
- [ ] Los emails llegan correctamente

---

## 📖 Guías Relacionadas

- **Configurar Resend completo:** `docs/CONFIGURAR_RESEND_PRODUCCION.md`
- **Mejorar deliverability:** `docs/MEJORAR_DELIVERABILITY_SIN_DOMINIO.md`
- **Diagnóstico de emails:** `docs/POR_QUE_NO_LLEGAN_EMAILS.md`
- **Verificar email paso a paso:** `docs/COMO_VERIFICAR_EMAIL_RESEND_PASO_A_PASO.md`

---

**Última actualización**: Diciembre 2025  
**Conclusión**: Puedes usar Resend perfectamente sin dominio propio, solo verificando tu email individual.

