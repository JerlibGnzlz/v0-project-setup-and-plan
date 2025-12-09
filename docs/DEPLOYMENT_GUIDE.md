# 🚀 Guía de Deployment - Proyecto AMVA Digital

Esta guía te ayudará a deployar tu proyecto completo (Frontend + Backend) con tu base de datos en Neon.

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Obtener la URL de Neon](#obtener-la-url-de-neon)
3. [Deployment del Backend](#deployment-del-backend)
4. [Deployment del Frontend](#deployment-del-frontend)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Ejecutar Migraciones](#ejecutar-migraciones)
7. [Verificar Deployment](#verificar-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Base de datos creada en Neon (https://console.neon.tech)
- ✅ Cuenta en Vercel (para el frontend)
- ✅ Cuenta en Railway o Render (para el backend)
- ✅ Cuenta en Cloudinary (para imágenes/videos)
- ✅ Cuenta en SendGrid o Gmail (para emails)
- ✅ Cuenta en Redis (Upstash o Railway) para colas de notificaciones

---

## 🔗 Obtener la URL de Neon

### Paso 1: Obtener Connection String

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a la sección **"Connection Details"** o **"Dashboard"**
4. Copia el **Connection String** que se ve así:

```
postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE**: Guarda esta URL de forma segura, la necesitarás para configurar tanto el backend como el frontend.

### ✅ Compatibilidad con Plataformas

**Neon funciona perfectamente con:**
- ✅ **Railway** - Funciona directamente, solo agrega `DATABASE_URL`
- ✅ **Render** - Funciona perfectamente, solo agrega `DATABASE_URL`
- ✅ **Vercel** - Funciona para el frontend (aunque generalmente no es necesario)
- ✅ **Cualquier plataforma** - Neon es compatible con cualquier servicio que soporte PostgreSQL

**No necesitas integración especial**, solo agrega la variable `DATABASE_URL` de Neon en las variables de entorno de tu plataforma.

### Paso 2: Verificar Conexión (Opcional)

Puedes probar la conexión localmente antes de deployar:

```bash
# En la raíz del proyecto
cd backend
npm install
npx prisma generate
npx prisma db pull  # Verifica que puedes conectarte
```

---

## 🖥️ Deployment del Backend

### Opción A: Railway (Recomendado)

Railway es ideal para NestJS y tiene integración directa con Neon.

#### 1. Crear Proyecto en Railway

1. Ve a https://railway.app
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"** (conecta tu repositorio)
   - O usa **"Empty Project"** y luego **"Deploy from GitHub"**

#### 2. Configurar el Servicio

1. En tu proyecto de Railway, haz clic en **"New"** → **"GitHub Repo"**
2. Selecciona tu repositorio
3. Railway detectará automáticamente que es un proyecto Node.js
4. Configura el **Root Directory** como `backend/`
5. Configura el **Start Command** como `npm run start:prod`

#### 3. Configurar Variables de Entorno

En Railway, ve a **"Variables"** y agrega:

```env
# Base de Datos (Neon)
DATABASE_URL=postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres-genera-con-openssl-rand-base64-32
JWT_EXPIRES_IN=7d

# Servidor
PORT=4000
NODE_ENV=production

# Frontend URL (se configurará después de deployar el frontend)
FRONTEND_URL=https://tu-dominio.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Redis (Upstash o Railway Redis)
REDIS_HOST=tu-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password
REDIS_DB=0

# Email (SendGrid o SMTP)
SENDGRID_API_KEY=tu-sendgrid-api-key
# O si usas SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

#### 4. Configurar Build Command

En Railway, en la sección **"Settings"** → **"Build"**, configura:

- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm run start:prod`

#### 5. Agregar Script de Post-Deploy (Opcional)

Crea un archivo `railway.json` en la carpeta `backend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && npx prisma generate"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 6. Deployar

Railway detectará automáticamente los cambios y hará el deploy. Una vez completado, obtendrás una URL como:

```
https://tu-backend.railway.app
```

**⚠️ IMPORTANTE**: Guarda esta URL, la necesitarás para configurar el frontend.

---

### Opción B: Render (Con Neon)

Render es otra excelente opción para NestJS. **Sí, puedes usar Neon perfectamente con Render**, aunque no hay integración automática como en Railway. Solo necesitas agregar la variable `DATABASE_URL` de Neon.

#### 1. Crear Servicio Web en Render

1. Ve a https://render.com
2. Haz clic en **"New"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `ministerio-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start:prod`

#### 2. Configurar Variables de Entorno con Neon

En Render, ve a **"Environment"** y agrega las variables. **IMPORTANTE**: Para usar Neon, agrega:

```env
# Base de Datos (Neon) - Obtén esta URL desde https://console.neon.tech
DATABASE_URL=postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres-genera-con-openssl-rand-base64-32
JWT_EXPIRES_IN=7d

# Servidor
PORT=4000
NODE_ENV=production

# Frontend URL (se configurará después de deployar el frontend)
FRONTEND_URL=https://tu-dominio.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Redis (Upstash recomendado para Render)
REDIS_HOST=tu-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password
REDIS_DB=0

# Email (SendGrid o SMTP)
SENDGRID_API_KEY=tu-sendgrid-api-key
# O si usas SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

**✅ Ventajas de usar Neon con Render:**
- Neon es gratuito hasta cierto límite
- Mejor rendimiento que PostgreSQL de Render en el plan gratuito
- Puedes usar Neon desde cualquier plataforma
- Connection pooling incluido

**⚠️ Nota**: Render también ofrece su propio PostgreSQL, pero Neon funciona perfectamente y es una excelente opción.

#### 3. Configurar Auto-Deploy (Opcional)

En Render, puedes configurar:
- **Auto-Deploy**: `Yes` (se deploya automáticamente en cada push a `main`)
- **Branch**: `main` (o la rama que uses)

#### 4. Deployar

Render hará el deploy automáticamente. Obtendrás una URL como:

```
https://ministerio-backend.onrender.com
```

**⚠️ IMPORTANTE**: 
- El primer deploy puede tardar varios minutos
- Render "duerme" los servicios gratuitos después de 15 minutos de inactividad
- Para evitar esto, considera el plan pago o usa Railway

---

## 🎨 Deployment del Frontend

### Vercel (Recomendado para Next.js)

Vercel es la mejor opción para Next.js y tiene integración directa con GitHub.

#### 1. Conectar Repositorio

1. Ve a https://vercel.com
2. Haz clic en **"Add New"** → **"Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

#### 2. Configurar Variables de Entorno

En Vercel, ve a **"Settings"** → **"Environment Variables"** y agrega:

```env
# API Backend (URL de Railway/Render)
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api

# Base de Datos (Neon) - Solo si necesitas acceso directo desde el frontend
# Generalmente NO es necesario, el frontend se comunica con el backend
DATABASE_URL=postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ NOTA**: El frontend generalmente NO necesita `DATABASE_URL` directamente, ya que se comunica con el backend a través de `NEXT_PUBLIC_API_URL`.

#### 3. Configurar Build Settings

Vercel detectará automáticamente:
- **Framework Preset**: Next.js
- **Root Directory**: `/` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

#### 4. Deployar

1. Haz clic en **"Deploy"**
2. Vercel construirá y deployará tu aplicación
3. Obtendrás una URL como:

```
https://tu-proyecto.vercel.app
```

#### 5. Actualizar FRONTEND_URL en Backend

Una vez que tengas la URL de Vercel, actualiza la variable `FRONTEND_URL` en Railway/Render:

```env
FRONTEND_URL=https://tu-proyecto.vercel.app
```

Esto es importante para CORS y autenticación.

---

## 🔧 Configurar Variables de Entorno

### Checklist Completo de Variables

#### Backend (Railway/Render)

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Servidor
PORT=4000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://tu-proyecto.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Redis
REDIS_HOST=tu-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password
REDIS_DB=0

# Email
SENDGRID_API_KEY=tu-sendgrid-api-key
# O SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

#### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

---

## 🗄️ Ejecutar Migraciones

Una vez deployado el backend, necesitas ejecutar las migraciones de Prisma en la base de datos de producción.

### Opción 1: Desde tu Máquina Local (Recomendado)

```bash
# 1. Configura DATABASE_URL temporalmente
export DATABASE_URL="postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 2. Ve a la carpeta del backend
cd backend

# 3. Genera el cliente de Prisma
npx prisma generate

# 4. Ejecuta las migraciones
npx prisma migrate deploy

# 5. (Opcional) Verifica el estado
npx prisma migrate status
```

### Opción 2: Desde Railway/Render (SSH)

Si Railway/Render te permite acceder por SSH:

```bash
# Conéctate al servidor
railway run bash  # Para Railway
# O
ssh tu-servidor  # Para Render

# Ejecuta las migraciones
cd backend
npx prisma migrate deploy
```

### Opción 3: Script de Post-Deploy

Puedes agregar un script en `package.json` del backend:

```json
{
  "scripts": {
    "postdeploy": "npx prisma migrate deploy"
  }
}
```

Y configurarlo en Railway/Render para que se ejecute después del deploy.

---

## ✅ Verificar Deployment

### 1. Verificar Backend

```bash
# Prueba el endpoint de salud (si existe)
curl https://tu-backend.railway.app/api

# O prueba Swagger (si está habilitado)
# Abre en el navegador: https://tu-backend.railway.app/api
```

### 2. Verificar Frontend

1. Abre https://tu-proyecto.vercel.app
2. Verifica que la página carga correctamente
3. Prueba hacer login en `/admin/login`

### 3. Verificar Conexión a Base de Datos

```bash
# Desde tu máquina local
cd backend
export DATABASE_URL="tu-database-url-de-produccion"
npx prisma studio
```

Esto abrirá Prisma Studio y podrás verificar que las tablas existen y tienen datos.

### 4. Verificar API

```bash
# Prueba un endpoint público
curl https://tu-backend.railway.app/api/convenciones

# Prueba autenticación
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org","password":"admin123"}'
```

---

## 🔍 Troubleshooting

### Error: "Cannot connect to database"

**Solución**:
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Asegúrate de que la URL incluya `?sslmode=require`
3. Verifica que Neon permita conexiones desde la IP de Railway/Render
4. En Neon, ve a **"Settings"** → **"Connection Pooling"** y verifica la configuración

### Error: "Prisma Client not generated"

**Solución**:
```bash
# En Railway/Render, agrega al build command:
npm install && npx prisma generate && npm run build
```

### Error: "CORS policy"

**Solución**:
1. Verifica que `FRONTEND_URL` en el backend sea correcta
2. Asegúrate de que incluya `https://` y no termine en `/`
3. Verifica la configuración de CORS en `backend/src/main.ts`

### Error: "JWT_SECRET must be at least 32 characters"

**Solución**:
```bash
# Genera un secreto seguro
openssl rand -base64 32

# Cópialo en la variable JWT_SECRET
```

### Error: "Migration failed"

**Solución**:
1. Verifica que la base de datos esté vacía o que las migraciones estén sincronizadas
2. Ejecuta `npx prisma migrate status` para ver el estado
3. Si hay conflictos, puedes resetear (⚠️ CUIDADO: esto borra datos):
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

### Error: "Redis connection failed"

**Solución**:
1. Verifica que las variables de Redis estén correctas
2. Si usas Upstash, copia la URL completa desde el dashboard
3. Verifica que Redis esté activo y accesible

---

## 📝 Checklist Final

Antes de considerar el deployment completo, verifica:

- [ ] Backend deployado y accesible
- [ ] Frontend deployado y accesible
- [ ] Variables de entorno configuradas correctamente
- [ ] Migraciones ejecutadas en producción
- [ ] Base de datos conectada y funcionando
- [ ] API respondiendo correctamente
- [ ] Autenticación funcionando
- [ ] CORS configurado correctamente
- [ ] Cloudinary configurado (si usas imágenes)
- [ ] Email configurado (si usas notificaciones)
- [ ] Redis configurado (si usas colas)

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] `DATABASE_URL` no está expuesta en el código
- [ ] Variables de entorno están configuradas en la plataforma (no en código)
- [ ] `NODE_ENV=production` está configurado
- [ ] CORS está configurado correctamente
- [ ] Rate limiting está habilitado
- [ ] Helmet está configurado (seguridad HTTP headers)
- [ ] Logs no exponen información sensible

---

## 📚 Recursos Adicionales

- [Documentación de Neon](https://neon.tech/docs)
- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)

---

## 🆘 Soporte

Si tienes problemas con el deployment:

1. Revisa los logs en Railway/Render
2. Revisa los logs en Vercel
3. Verifica las variables de entorno
4. Consulta la sección de Troubleshooting
5. Revisa la documentación de cada plataforma

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

