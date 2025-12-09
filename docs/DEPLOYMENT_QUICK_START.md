# 🚀 Deployment Quick Start

Guía rápida para deployar tu proyecto con Neon en 5 pasos.

## ⚡ Pasos Rápidos

### 1️⃣ Obtener URL de Neon

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Copia el **Connection String** (debe incluir `?sslmode=require`)

```
postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2️⃣ Deployar Backend (Railway o Render)

#### Opción A: Railway (Recomendado)

1. Ve a https://railway.app → **New Project** → **Deploy from GitHub**
2. Selecciona tu repo y configura:
   - **Root Directory**: `backend/`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start:prod`
3. Agrega variables de entorno (ver `env.production.example`)
4. Guarda la URL del backend (ej: `https://tu-backend.railway.app`)

#### Opción B: Render (Con Neon)

1. Ve a https://render.com → **New** → **Web Service**
2. Conecta tu repo de GitHub y configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start:prod`
3. Agrega `DATABASE_URL` de Neon en **Environment Variables**
4. Agrega el resto de variables (ver `env.production.example`)
5. Guarda la URL del backend (ej: `https://tu-backend.onrender.com`)

**✅ Sí, Neon funciona perfectamente con Render** - Solo agrega la variable `DATABASE_URL` de Neon.

### 3️⃣ Deployar Frontend (Vercel)

1. Ve a https://vercel.com → **Add New Project**
2. Importa tu repo de GitHub
3. Agrega variable de entorno:
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
   ```
4. Deploya y guarda la URL (ej: `https://tu-proyecto.vercel.app`)

### 4️⃣ Actualizar FRONTEND_URL en Backend

En Railway o Render, actualiza la variable:
```env
FRONTEND_URL=https://tu-proyecto.vercel.app
```

### 5️⃣ Ejecutar Migraciones

```bash
cd backend
export DATABASE_URL="tu-database-url-de-neon"
npx prisma generate
npx prisma migrate deploy
```

## ✅ Verificar

1. **Backend**: `https://tu-backend.railway.app/api`
2. **Frontend**: `https://tu-proyecto.vercel.app`
3. **Login**: `https://tu-proyecto.vercel.app/admin/login`

## 📋 Variables Mínimas Requeridas

### Backend (Railway)
```env
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=tu-secreto-minimo-32-caracteres
FRONTEND_URL=https://tu-proyecto.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

## 🔍 Verificar Configuración

```bash
# Ejecuta el script de verificación
./scripts/verificar-deployment.sh
```

## 📚 Documentación Completa

Para más detalles, consulta: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**¿Problemas?** Revisa la sección de Troubleshooting en la guía completa.

