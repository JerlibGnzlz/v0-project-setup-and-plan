# 🔧 Variables de Entorno en Render

## 📋 Variables Necesarias Según el Proveedor de Email

### ✅ Si Usas SendGrid (Recomendado)

**Variables OBLIGATORIAS:**
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com  ← Debe estar verificado en SendGrid
SENDGRID_FROM_NAME=AMVA Digital
```

**Variables que PUEDES ELIMINAR (no son necesarias con SendGrid):**
```
❌ SMTP_HOST=smtp.gmail.com
❌ SMTP_PORT=587
❌ SMTP_SECURE=false
❌ SMTP_USER=jerlibgnzlz@gmail.com
❌ SMTP_PASSWORD=iswisphueoxplwvp
```

**Ventaja**: SendGrid no necesita estas variables SMTP, así que puedes eliminarlas para limpiar tu configuración.

### ⚠️ Si Usas Gmail SMTP (Fallback)

**Variables OBLIGATORIAS:**
```
EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=tu-app-password
```

**Variables que NO necesitas:**
```
❌ SENDGRID_API_KEY
❌ SENDGRID_FROM_EMAIL
❌ SENDGRID_FROM_NAME
```

## 🔄 Fallback Automático

El código tiene fallback automático:
- Si SendGrid está configurado pero falla → intenta con Gmail SMTP
- Si Gmail SMTP está configurado pero falla → no hay otro fallback

**Recomendación**: Si usas SendGrid, puedes eliminar las variables SMTP. Si SendGrid falla, el sistema intentará usar SMTP, pero si no están configuradas, simplemente fallará.

## 📝 Variables Comunes (Siempre Necesarias)

Estas variables son necesarias independientemente del proveedor de email:

```
# Base de Datos
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=tu-secreto-super-seguro-minimo-32-caracteres
JWT_EXPIRATION=15m

# Frontend URL (para CORS)
FRONTEND_URL=https://v0-ministerio-amva.vercel.app

# Redis (Opcional pero recomendado)
REDIS_URL=rediss://default:password@host:6379

# Puerto (Render lo asigna automáticamente)
PORT=4000  ← Render lo detecta automáticamente, pero puedes configurarlo
```

## 🔍 Sobre "Detected service running on port 4000"

Este mensaje viene de **Render** detectando que tu aplicación está corriendo en el puerto 4000.

**¿De dónde sale?**
- Render escanea los puertos comunes (3000, 4000, 5000, 8000, etc.)
- Cuando detecta que tu aplicación está escuchando en el puerto 4000, muestra ese mensaje
- Es normal y no es un problema

**Configuración del puerto:**
- Render asigna automáticamente el puerto via variable `PORT`
- Tu código en `backend/src/main.ts` usa: `process.env.PORT || 4000`
- Si Render no asigna `PORT`, usa 4000 por defecto
- Render detecta automáticamente en qué puerto está corriendo

**No necesitas hacer nada**: Render maneja esto automáticamente.

## ✅ Checklist de Variables para SendGrid

Si estás usando SendGrid, estas son las variables que DEBES tener:

```
✅ EMAIL_PROVIDER=sendgrid
✅ SENDGRID_API_KEY=SG.xxx...
✅ SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com (verificado en SendGrid)
✅ SENDGRID_FROM_NAME=AMVA Digital
✅ DATABASE_URL=postgresql://...
✅ JWT_SECRET=tu-secreto...
✅ FRONTEND_URL=https://v0-ministerio-amva.vercel.app
✅ REDIS_URL=rediss://... (opcional pero recomendado)
✅ PORT=4000 (Render lo asigna automáticamente)
```

**Variables que puedes ELIMINAR si usas SendGrid:**
```
❌ SMTP_HOST
❌ SMTP_PORT
❌ SMTP_SECURE
❌ SMTP_USER
❌ SMTP_PASSWORD
```

## 🧹 Limpiar Variables No Usadas

1. Ve a tu servicio en Render
2. Settings → Environment
3. Elimina las variables SMTP que no necesitas
4. Guarda los cambios
5. Render reiniciará automáticamente

Esto ayuda a:
- Mantener la configuración limpia
- Evitar confusiones
- Reducir el riesgo de usar credenciales incorrectas

