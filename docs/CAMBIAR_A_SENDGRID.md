# 🔄 Cambiar de Resend a SendGrid

## 📋 Pasos en Render

### 1. Ir a Variables de Entorno

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. Ve a **Settings** → **Environment**

### 2. Actualizar Variables

**Actualiza estas variables:**

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx... (tu API Key de SendGrid)
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
SENDGRID_FROM_NAME=AMVA Digital
```

**Pasos:**
1. Busca `EMAIL_PROVIDER` → Cambia el valor a `sendgrid`
2. Busca `SENDGRID_API_KEY` → Verifica que tenga tu API Key completa (empieza con `SG.`)
3. Busca `SENDGRID_FROM_EMAIL` → Verifica que sea `jerlibgnzlz@gmail.com` (exactamente así)
4. Busca `SENDGRID_FROM_NAME` → Verifica que sea `AMVA Digital` (o agrégalo si no existe)

### 3. Eliminar o Comentar Variables de Resend (Opcional)

Puedes eliminar o comentar estas variables (no son necesarias con SendGrid):

```bash
# RESEND_API_KEY=re_xxx...
# RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com
# RESEND_FROM_NAME=AMVA Digital
```

**Nota:** Si las dejas, no causarán problemas. El sistema usará SendGrid porque `EMAIL_PROVIDER=sendgrid`.

### 4. Reiniciar el Servicio

1. Ve a tu servicio en Render
2. Haz clic en **Manual Deploy** → **Clear build cache & deploy**
3. Espera a que termine el deploy (puede tardar unos minutos)

## ✅ Verificación

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

**Crear una Inscripción:**
1. Ve a la landing page
2. Completa el formulario de inscripción
3. Revisa los logs de Render inmediatamente
4. Busca:
   ```
   📧 Preparando email con SendGrid para email@example.com...
   ✅ Email enviado exitosamente a email@example.com (SendGrid)
   ```

**Enviar Recordatorios:**
1. Ve al admin dashboard
2. Haz clic en "Enviar Recordatorios"
3. Revisa los logs de Render inmediatamente
4. Busca mensajes similares a los de arriba

## 📋 Checklist Final

Antes de reportar un problema, verifica:

- [ ] `EMAIL_PROVIDER=sendgrid` está configurado en Render
- [ ] `SENDGRID_API_KEY` tiene el valor completo (empieza con `SG.`)
- [ ] `SENDGRID_FROM_EMAIL` es exactamente `jerlibgnzlz@gmail.com` (sin espacios)
- [ ] `SENDGRID_FROM_NAME` está configurado (opcional pero recomendado)
- [ ] El email `jerlibgnzlz@gmail.com` está verificado en SendGrid (checkmark verde ✅)
- [ ] La API Key tiene permisos de "Mail Send" o "Full Access"
- [ ] El servicio en Render se reinició después de cambiar las variables
- [ ] Los logs muestran `✅ Servicio de email configurado (SendGrid)`

## 🎯 Resumen

**Variables necesarias:**
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
SENDGRID_FROM_NAME=AMVA Digital
```

**Pasos:**
1. Actualizar variables en Render
2. Reiniciar servicio
3. Verificar logs
4. Probar envío de email

¡Listo! SendGrid debería funcionar inmediatamente con tu Gmail verificado. 🚀

