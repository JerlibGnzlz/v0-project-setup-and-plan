# 🚀 Configurar Resend para Producción - Guía Paso a Paso

## 📋 Resumen

Resend es un servicio de email moderno con **mejor deliverability** que SendGrid cuando usas emails verificados individualmente. Perfecto si no tienes dominio propio.

**Ventajas:**
- ✅ Mejor deliverability que SendGrid con Single Sender
- ✅ 3,000 emails/mes gratis (vs 100/día de SendGrid)
- ✅ API moderna y fácil de usar
- ✅ Mejor para emails verificados individualmente

---

## 🎯 Paso 1: Crear Cuenta en Resend

### 1.1. Ir a Resend

1. Abre tu navegador
2. Ve a: **https://resend.com**
3. Haz clic en **"Start for free"** o **"Sign Up"**

### 1.2. Completar Registro

1. **Ingresa tu email:** `jerlibgnzlz@gmail.com`
2. **Crea una contraseña** segura
3. **Confirma tu contraseña**
4. Haz clic en **"Create Account"** o **"Sign Up"**

### 1.3. Verificar Email

1. Revisa tu bandeja de entrada de Gmail
2. Busca un email de Resend
3. Haz clic en el enlace de verificación
4. Serás redirigido a Resend Dashboard

---

## 🎯 Paso 2: Verificar Email Individual

### 2.1. Ir a Sección de Emails

1. En Resend Dashboard, ve a **"Emails"** en el menú lateral izquierdo
2. Haz clic en **"Add Email"** o **"Verify Email"**

### 2.2. Agregar Email

1. En el campo **"Email Address"**, ingresa: `jerlibgnzlz@gmail.com`
2. Haz clic en **"Send Verification Email"** o **"Add"**

### 2.3. Verificar Email

1. Revisa tu bandeja de entrada de Gmail (`jerlibgnzlz@gmail.com`)
2. Busca un email de Resend con asunto tipo "Verify your email address"
3. Haz clic en el botón **"Verify Email"** o en el enlace de verificación
4. Serás redirigido a Resend confirmando que el email está verificado

**✅ Verificación completada:** Deberías ver un checkmark verde ✅ junto a `jerlibgnzlz@gmail.com` en Resend

---

## 🎯 Paso 3: Crear API Key

### 3.1. Ir a API Keys

1. En Resend Dashboard, ve a **"API Keys"** en el menú lateral izquierdo
2. Haz clic en **"Create API Key"** o el botón **"+"**

### 3.2. Configurar API Key

1. **Name:** Ingresa `AMVA Backend` o `AMVA Production`
2. **Permission:** Selecciona **"Full Access"** (o "Sending Access" si está disponible)
3. Haz clic en **"Add"** o **"Create API Key"**

### 3.3. Copiar API Key

**⚠️ IMPORTANTE:** La API Key solo se muestra **UNA VEZ**

1. **Copia inmediatamente** la API Key que aparece
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Ejemplo: `re_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
2. **Guárdala en un lugar seguro** (notas, documento, etc.)
3. Haz clic en **"Done"** o **"Close"**

**✅ API Key creada:** Ya tienes tu API Key lista para usar

---

## 🎯 Paso 4: Configurar en Render

### 4.1. Ir a Render Dashboard

1. Abre tu navegador
2. Ve a: **https://dashboard.render.com**
3. Inicia sesión si es necesario

### 4.2. Seleccionar Servicio Backend

1. En la lista de servicios, encuentra tu servicio backend (ej: `ministerio-backend`)
2. Haz clic en el nombre del servicio

### 4.3. Ir a Environment Variables

1. En el menú del servicio, haz clic en **"Environment"**
2. O busca **"Environment Variables"** en la página

### 4.4. Agregar Variables de Entorno

Haz clic en **"Add Environment Variable"** y agrega estas variables **UNA POR UNA**:

#### Variable 1: EMAIL_PROVIDER
- **Key:** `EMAIL_PROVIDER`
- **Value:** `resend`
- Haz clic en **"Save"**

#### Variable 2: RESEND_API_KEY
- **Key:** `RESEND_API_KEY`
- **Value:** `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (la API Key que copiaste en el Paso 3)
- Haz clic en **"Save"**

#### Variable 3: RESEND_FROM_EMAIL
- **Key:** `RESEND_FROM_EMAIL`
- **Value:** `jerlibgnzlz@gmail.com`
- Haz clic en **"Save"**

#### Variable 4: RESEND_FROM_NAME (Opcional pero recomendado)
- **Key:** `RESEND_FROM_NAME`
- **Value:** `AMVA Digital`
- Haz clic en **"Save"**

### 4.5. Verificar Variables

Asegúrate de que tengas estas 4 variables configuradas:

```
✅ EMAIL_PROVIDER=resend
✅ RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
✅ RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
✅ RESEND_FROM_NAME=AMVA Digital
```

---

## 🎯 Paso 5: Reiniciar Servicio en Render

### 5.1. Reiniciar Manualmente

1. En Render Dashboard, ve a tu servicio backend
2. Haz clic en **"Manual Deploy"** (si está disponible)
3. O haz clic en **"..."** (menú) → **"Restart"**
4. Espera a que el servicio se reinicie (1-2 minutos)

**Nota:** Render puede reiniciar automáticamente cuando detecta cambios en variables de entorno.

### 5.2. Verificar Logs

1. En Render Dashboard, ve a tu servicio backend
2. Haz clic en **"Logs"** o **"View Logs"**
3. Busca estos logs al iniciar:

```
📧 Auto-detectado: Resend
📧 Inicializando EmailService con proveedor: resend
✅ Servicio de email configurado (Resend)
📧 Provider: Resend
👤 From: jerlibgnzlz@gmail.com
✅ EmailService configurado correctamente con: Resend
```

**✅ Si ves estos logs:** Resend está configurado correctamente

---

## 🎯 Paso 6: Probar el Sistema

### 6.1. Probar Botón de Recordatorios

1. Ve a tu aplicación: `/admin/inscripciones`
2. Inicia sesión como admin
3. Haz clic en el botón **"Recordatorios"**
4. Confirma el envío

### 6.2. Verificar Logs del Backend

En Render → Logs, deberías ver:

```
📧 [NotificationsService] Enviando email a usuario@ejemplo.com
📧 [EmailService] Estado de proveedores:
   SendGrid configurado: false
   Resend configurado: true
   SMTP configurado: false
📧 [EmailService] Intentando envío con Resend...
📧 Preparando email con Resend para usuario@ejemplo.com...
📧 Enviando email a usuario@ejemplo.com desde jerlibgnzlz@gmail.com (Resend)...
✅ Email enviado exitosamente a usuario@ejemplo.com (Resend)
   Message ID: xxxxxx
✅ [EmailService] Email enviado exitosamente con Resend
```

### 6.3. Verificar en Resend Dashboard

1. Ve a **https://resend.com** → **Emails** → **Logs**
2. Deberías ver los emails enviados con estado:
   - ✅ **Sent**: Email enviado correctamente
   - ✅ **Delivered**: Email entregado (objetivo)

### 6.4. Verificar en Bandeja de Entrada

1. Abre el email del destinatario
2. Revisa la **bandeja de entrada**
3. Revisa la **carpeta de spam** (por si acaso)
4. Busca emails de "AMVA Digital" o "Recordatorio de Pago Pendiente"

---

## ✅ Checklist de Verificación

Antes de considerar que está listo, verifica:

- [ ] Cuenta creada en Resend
- [ ] Email `jerlibgnzlz@gmail.com` verificado en Resend
- [ ] API Key creada y copiada
- [ ] Variables de entorno configuradas en Render:
  - [ ] `EMAIL_PROVIDER=resend`
  - [ ] `RESEND_API_KEY=re_xxx...`
  - [ ] `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`
  - [ ] `RESEND_FROM_NAME=AMVA Digital`
- [ ] Servicio reiniciado en Render
- [ ] Logs muestran "Resend configurado: true"
- [ ] Prueba de envío exitosa
- [ ] Emails aparecen en Resend Dashboard
- [ ] Emails llegan a bandeja de entrada (no spam)

---

## 🆘 Solución de Problemas

### Problema: "Resend no está inicializado"

**Causa:** API Key incorrecta o no configurada

**Solución:**
1. Verifica que `RESEND_API_KEY` esté configurada en Render
2. Verifica que la API Key comience con `re_`
3. Verifica que no tenga espacios al inicio/final
4. Reinicia el servicio en Render

### Problema: "domain is not verified"

**Causa:** Email no verificado en Resend

**Solución:**
1. Ve a Resend → Emails
2. Verifica que `jerlibgnzlz@gmail.com` tenga checkmark verde ✅
3. Si no está verificado, haz clic en "Verify" y completa el proceso

### Problema: "Forbidden" o "403"

**Causa:** API Key sin permisos o email no verificado

**Solución:**
1. Verifica que la API Key tenga permisos de "Full Access" o "Sending Access"
2. Verifica que el email esté verificado en Resend
3. Crea una nueva API Key si es necesario

### Problema: Emails no llegan

**Causa:** Pueden estar en spam o email no verificado

**Solución:**
1. Verifica en Resend → Logs el estado de los emails
2. Si dice "Sent" pero no llega, revisa spam del destinatario
3. Pide al destinatario que marque como "No es spam"
4. Verifica que el email esté completamente verificado en Resend

---

## 📊 Comparación SendGrid vs Resend

| Característica | SendGrid | Resend |
|---------------|----------|--------|
| **Deliverability** (sin dominio) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Plan Gratuito** | 100 emails/día | 3,000 emails/mes |
| **Verificación Individual** | ✅ Sí | ✅ Sí (mejor) |
| **Facilidad de Configuración** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **API Moderna** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Conclusión:** Resend es mejor para tu caso (sin dominio propio).

---

## 🎯 Resultado Esperado

Después de configurar Resend:

- ✅ Emails se envían correctamente
- ✅ Mejor deliverability (menos spam)
- ✅ Emails llegan a bandeja de entrada
- ✅ Estado "Delivered" en Resend Dashboard
- ✅ 3,000 emails/mes gratis (suficiente para recordatorios)

---

## 📝 Variables de Entorno Finales

Después de configurar, deberías tener estas variables en Render:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
RESEND_FROM_NAME=AMVA Digital
```

**Nota:** Puedes mantener las variables de SendGrid por si acaso, pero Resend tendrá prioridad.

---

## 🚀 Siguiente Paso

Una vez configurado Resend:

1. **Prueba el botón de recordatorios**
2. **Verifica que los emails lleguen** a la bandeja de entrada
3. **Revisa Resend Dashboard** para ver estadísticas
4. **Disfruta de mejor deliverability** 🎉

---

**Última actualización**: Diciembre 2025  
**Tiempo estimado**: 10-15 minutos  
**Resultado**: Resend configurado y funcionando ✅

