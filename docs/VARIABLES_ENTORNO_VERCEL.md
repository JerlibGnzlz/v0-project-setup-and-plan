# 🌐 Variables de Entorno para Vercel

## Dominio de Vercel
**Frontend:** `https://v0-ministerio-amva.vercel.app`

---

## 📋 Variables para el Frontend (Next.js)

Configura estas variables en **Vercel → Tu Proyecto → Settings → Environment Variables**

### Variables Públicas (NEXT_PUBLIC_*)

```env
# URL del sitio (frontend)
NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app

# URL del API (backend)
# Si el backend está en el mismo proyecto de Vercel:
NEXT_PUBLIC_API_URL=https://v0-ministerio-amva.vercel.app/api

# Si el backend está en un proyecto separado de Vercel:
# NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app/api
```

### Variables Privadas (si las necesitas)

```env
# Otras variables que no empiezan con NEXT_PUBLIC_
# (solo si las necesitas en el servidor)
```

---

## 📋 Variables para el Backend (NestJS)

Si el backend está en Vercel (mismo proyecto o separado), configura estas variables:

```env
# URL del frontend
FRONTEND_URL=https://v0-ministerio-amva.vercel.app

# URL del backend (si está en Vercel)
BACKEND_URL=https://v0-ministerio-amva.vercel.app

# O si el backend está en un proyecto separado:
# BACKEND_URL=https://tu-backend.vercel.app

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-tu-token-aqui
MERCADO_PAGO_TEST_MODE=true

# Base de datos (Neon)
DATABASE_URL=postgresql://tu-database-url

# JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d

# Cloudinary (si lo usas)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Puerto (Vercel lo asigna automáticamente)
PORT=4000
NODE_ENV=production
```

---

## 🔧 Cómo Configurar en Vercel

### Paso 1: Ir a Environment Variables

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar Variables

Para cada variable:
1. Haz clic en **"Add New"**
2. Ingresa el **Name** (ej: `NEXT_PUBLIC_SITE_URL`)
3. Ingresa el **Value** (ej: `https://v0-ministerio-amva.vercel.app`)
4. Selecciona los **Environments** donde aplica:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)
5. Haz clic en **"Save"**

### Paso 3: Redeploy

Después de agregar las variables:
1. Ve a **Deployments**
2. Haz clic en los **3 puntos** del deployment más reciente
3. Selecciona **"Redeploy"**
4. Esto aplicará las nuevas variables de entorno

---

## ✅ Checklist de Variables

### Frontend (Next.js)

- [ ] `NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL=https://v0-ministerio-amva.vercel.app/api` (o tu backend URL)
- [ ] `DATABASE_URL` (si Next.js necesita acceso directo a la DB)
- [ ] Otras variables que tu frontend necesite

### Backend (NestJS)

- [ ] `FRONTEND_URL=https://v0-ministerio-amva.vercel.app`
- [ ] `BACKEND_URL=https://v0-ministerio-amva.vercel.app` (o tu backend URL)
- [ ] `MERCADO_PAGO_ACCESS_TOKEN=TEST-tu-token`
- [ ] `MERCADO_PAGO_TEST_MODE=true`
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `JWT_SECRET=tu-clave-secreta`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `PORT=4000`
- [ ] `NODE_ENV=production`
- [ ] Variables de Cloudinary (si las usas)

---

## 🔍 Verificar que Funciona

### 1. Verificar Variables en Vercel

1. Ve a **Settings** → **Environment Variables**
2. Verifica que todas las variables estén configuradas
3. Asegúrate de que estén en el environment correcto (Production)

### 2. Verificar en los Logs

1. Ve a **Deployments** → Selecciona el deployment más reciente
2. Haz clic en **"View Function Logs"**
3. Busca errores relacionados con variables de entorno

### 3. Verificar en el Navegador

1. Abre tu aplicación: `https://v0-ministerio-amva.vercel.app`
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores de conexión con el API
4. Verifica que las peticiones vayan a la URL correcta

---

## 📝 Nota Importante

Si el backend está en un proyecto **separado** de Vercel:
- Usa la URL del backend en `NEXT_PUBLIC_API_URL`
- Ejemplo: `NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app/api`

Si el backend está en el **mismo proyecto** de Vercel:
- Puedes usar la misma URL: `NEXT_PUBLIC_API_URL=https://v0-ministerio-amva.vercel.app/api`
- O configurar rutas API en Next.js que redirijan al backend

---

## 🚀 Webhook de Mercado Pago

Una vez configuradas las variables, configura el webhook en Mercado Pago:

**URL del Webhook (Modo Prueba):**
```
https://v0-ministerio-amva.vercel.app/api/mercado-pago/webhook
```

**Eventos:**
- ✅ Pagos (Payments)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que todas las variables estén en el environment correcto
2. Haz un redeploy después de agregar variables
3. Revisa los logs de Vercel para errores
4. Verifica que las URLs sean correctas (https://, sin trailing slash)

























