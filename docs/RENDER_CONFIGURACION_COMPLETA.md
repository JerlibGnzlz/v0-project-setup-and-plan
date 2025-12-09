# 🔧 Configuración Completa de Render - Backend

## ❌ Error Actual

Render está intentando hacer build del **frontend (Next.js)** en lugar del **backend (NestJS)**.

```
> my-v0-project@0.1.0 build
> next build
Error: Cannot find module '@tailwindcss/postcss'
```

## 🔍 Causa

El **Root Directory** NO está configurado como `backend` en Render.

---

## ✅ Solución: Configurar Root Directory

### Paso 1: Ir a Render Dashboard

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio (o crea uno nuevo)

### Paso 2: Configurar Settings

Ve a **Settings** → **Build & Deploy** y configura:

#### Root Directory (CRÍTICO)
```
backend
```

**⚠️ IMPORTANTE:** Debe ser exactamente `backend`, no `.` (punto) ni `/backend` ni `./backend`

#### Build Command
```bash
npm install --legacy-peer-deps && npm run build && npx prisma generate
```

#### Start Command
```bash
npm run start:prod
```

#### Environment
```
Node
```

#### Node Version (Opcional)
```
22.16.0
```

### Paso 3: Guardar y Deployar

1. Haz clic en **"Save Changes"**
2. Render debería hacer un nuevo deploy automáticamente
3. O haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📋 Configuración Completa

### Tabla de Configuración

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install --legacy-peer-deps && npm run build && npx prisma generate` |
| **Start Command** | `npm run start:prod` |
| **Environment** | `Node` |
| **Node Version** | `22.16.0` (o superior) |

---

## 🔄 Pasos Detallados

### 1. Crear/Editar Servicio en Render

1. Ve a: https://dashboard.render.com
2. Si no tienes servicio:
   - Haz clic en **"New"** → **"Web Service"**
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio: `v0-project-setup-and-plan`
3. Si ya tienes servicio:
   - Selecciona tu servicio
   - Ve a **Settings**

### 2. Configurar Root Directory

1. En **Settings** → **Build & Deploy**
2. Busca el campo **"Root Directory"**
3. Cambia de `.` (o vacío) a:
   ```
   backend
   ```
4. **⚠️ CRÍTICO:** Debe ser exactamente `backend`, sin puntos, barras, ni espacios

### 3. Configurar Build Command

En el mismo lugar, configura:

**Build Command:**
```bash
npm install --legacy-peer-deps && npm run build && npx prisma generate
```

**Start Command:**
```bash
npm run start:prod
```

### 4. Agregar Variables de Entorno

Ve a **Environment** y agrega todas las variables necesarias:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Mercado Pago - PRODUCCIÓN
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion
MERCADO_PAGO_TEST_MODE=false

# URLs
FRONTEND_URL=https://v0-ministerio-amva.vercel.app
BACKEND_URL=https://tu-backend.onrender.com

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Entorno
NODE_ENV=production
PORT=4000

# Email (SendGrid)
SENDGRID_API_KEY=tu-api-key-de-sendgrid
EMAIL_FROM=noreply@amvadigital.com

# Redis (si usas)
REDIS_URL=redis://default:password@host:port
```

### 5. Guardar y Deployar

1. Haz clic en **"Save Changes"**
2. Render debería detectar los cambios y hacer deploy automáticamente
3. O ve a **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Verificación

Después del deploy, verifica:

### 1. El Build Debe Completarse

Deberías ver en los logs:
```
> ministerio-backend@1.0.0 build
> nest build
✅ Build completed successfully
```

**NO deberías ver:**
```
> my-v0-project@0.1.0 build
> next build
```

### 2. El Servicio Debe Estar "Live"

En Render Dashboard, el estado debe ser **"Live"** (verde).

### 3. Probar el Endpoint

```bash
curl https://tu-backend.onrender.com/api/mercado-pago/status
```

Debe retornar:
```json
{
  "configured": true,
  "testMode": false
}
```

---

## 🐛 Troubleshooting

### Si Sigue Intentando Build de Next.js

**Problema:** El Root Directory no está configurado correctamente.

**Solución:**
1. Ve a **Settings** → **Build & Deploy**
2. Verifica que **Root Directory** sea exactamente `backend` (sin comillas, sin puntos, sin barras)
3. Guarda los cambios
4. Haz un nuevo deploy

### Si el Build Falla con "nest: not found"

**Problema:** Las dependencias no se instalaron correctamente.

**Solución:**
1. Verifica que el Build Command incluya `npm install`
2. Asegúrate de que el Root Directory sea `backend`
3. Haz un nuevo deploy

### Si Prisma Falla

**Problema:** El cliente de Prisma no se generó.

**Solución:**
1. Verifica que el Build Command incluya `npx prisma generate`
2. Asegúrate de que `DATABASE_URL` esté configurado
3. Haz un nuevo deploy

---

## 📝 Notas Importantes

1. **Root Directory es CRÍTICO:**
   - ✅ Correcto: `backend`
   - ❌ Incorrecto: `.` (raíz)
   - ❌ Incorrecto: `/backend`
   - ❌ Incorrecto: `./backend`

2. **Build Command:**
   - Debe ejecutarse desde `backend/`
   - Debe incluir `npm install` primero
   - Debe incluir `npx prisma generate` al final

3. **Start Command:**
   - Debe ser `npm run start:prod`
   - Esto ejecuta `node dist/main` desde `backend/`

---

## 🎯 Resumen

**El problema:** Render está ejecutando el build del frontend en lugar del backend.

**La solución:** Configurar **Root Directory** como `backend` en Render.

**Configuración necesaria:**
- Root Directory: `backend`
- Build Command: `npm install --legacy-peer-deps && npm run build && npx prisma generate`
- Start Command: `npm run start:prod`

---

**Última actualización**: Diciembre 2025

