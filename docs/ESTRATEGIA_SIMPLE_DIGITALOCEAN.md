# Estrategia Simple para Digital Ocean

## 🎯 Estrategia Simple Adaptada para Digital Ocean

### Concepto: **Dos Entornos + Deploy Manual Controlado**

```
┌─────────────────┐     ┌─────────────────┐
│   DESARROLLO    │ --> │   PRODUCCIÓN    │
│  (Local/Dev)    │     │  (DigitalOcean) │
└─────────────────┘     └─────────────────┘
```

## ✅ Lo Mínimo Necesario con Digital Ocean

### Opción 1: App Platform (Más Simple - Recomendado)

Digital Ocean App Platform es similar a Vercel pero para cualquier stack.

**Ventajas**:
- ✅ Deploy automático desde GitHub
- ✅ Build automático
- ✅ SSL automático
- ✅ Escalado automático
- ✅ Mismo flujo que Vercel

### Opción 2: Droplet + GitHub Actions (Más Control)

Para más control sobre el servidor.

## 🚀 Opción 1: App Platform (Recomendado)

### Configuración Inicial (Una Vez)

1. **Crear App en Digital Ocean**

```yaml
# .do/app.yaml (opcional, se puede crear desde UI)
name: amva-digital
region: nyc
services:
  - name: frontend
    github:
      repo: tu-usuario/v0-project-setup-and-plan
      branch: main
      deploy_on_push: true
    build_command: npm install && npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: ${api.PUBLIC_URL}
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET

  - name: backend
    github:
      repo: tu-usuario/v0-project-setup-and-plan
      branch: main
      deploy_on_push: true
    source_dir: backend
    build_command: npm install && npm run build
    run_command: npm run start:prod
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET
      - key: JWT_SECRET
        scope: RUN_TIME
        type: SECRET

databases:
  - name: amva-db
    engine: PG
    version: "15"
    production: true
    cluster_name: amva-db-cluster
```

### Flujo de Trabajo (Igual que Vercel)

```bash
# 1. Desarrollar en develop
git checkout develop
# ... hacer cambios ...
git commit -m "feat: Nueva funcionalidad"
git push origin develop

# 2. Probar localmente
npm run dev
# Verificar que funciona

# 3. Deploy a producción
git checkout main
git merge develop
git push origin main
# → Digital Ocean App Platform despliega automáticamente
```

### Configuración en Digital Ocean Dashboard

1. **Crear App**:
   - Ir a Digital Ocean → Apps → Create App
   - Conectar repositorio de GitHub
   - Seleccionar rama `main`
   - Configurar build command: `npm install && npm run build`
   - Configurar run command: `npm start`

2. **Configurar Variables de Entorno**:
   - Settings → App-Level Environment Variables
   - Agregar todas las variables necesarias

3. **Configurar Auto-Deploy**:
   - Settings → GitHub Integration
   - Activar "Deploy on Push"
   - Seleccionar rama `main`

## 🖥️ Opción 2: Droplet + GitHub Actions (Más Control)

### Configuración Inicial

1. **Crear Droplet**
   - Ubuntu 22.04 LTS
   - Mínimo: 2GB RAM, 1 vCPU (para empezar)
   - Instalar Node.js, PM2, Nginx

2. **Configurar GitHub Actions**

```yaml
# .github/workflows/deploy-do.yml
name: Deploy to Digital Ocean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/amva-digital
            git pull origin main
            npm install
            npm run build
            pm2 restart amva-digital
```

### Scripts de Deploy Simple

```bash
# scripts/deploy-do.sh
#!/bin/bash

echo "🔍 Verificando antes de deploy..."
npm run build || exit 1

echo "⚠️  ¿Desplegar a Digital Ocean? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Cancelado"
  exit 1
fi

echo "🚀 Desplegando..."
git checkout main
git merge develop
git push origin main

echo "✅ Deploy iniciado. Digital Ocean desplegará automáticamente"
echo "📊 Revisa: https://cloud.digitalocean.com/apps"
```

## 🔄 Rollback en Digital Ocean

### Opción 1: App Platform (Fácil)

1. Ir a Digital Ocean → Apps → Tu App
2. Ir a "Activity" o "Deployments"
3. Encontrar versión anterior que funcionaba
4. Click en "..." → "Redeploy"

### Opción 2: Droplet (Con Git)

```bash
# scripts/rollback-do.sh
#!/bin/bash

echo "⚠️  ¿Hacer rollback? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Cancelado"
  exit 1
fi

git checkout main
git revert HEAD --no-edit
git push origin main

echo "✅ Rollback iniciado"
```

## 📋 Checklist Simple (Igual que Antes)

Antes de cada deploy:

- [ ] ✅ Probar localmente (`npm run dev`)
- [ ] ✅ Verificar que no hay errores
- [ ] ✅ Probar funcionalidades críticas
- [ ] ✅ Backup de base de datos (si hay cambios)
- [ ] ✅ Merge a `main` y push
- [ ] ✅ Monitorear Digital Ocean dashboard por 5 minutos
- [ ] ✅ Verificar que el sitio carga correctamente

## 🗄️ Base de Datos en Digital Ocean

### Opción 1: Managed Database (Recomendado)

- ✅ Backups automáticos
- ✅ Escalado automático
- ✅ Monitoreo incluido
- ✅ Alta disponibilidad

**Configuración**:
1. Digital Ocean → Databases → Create Database
2. Seleccionar PostgreSQL
3. Seleccionar región
4. Configurar conexión desde App Platform

### Opción 2: Database en Droplet

```bash
# Instalar PostgreSQL en Droplet
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar
sudo -u postgres psql
CREATE DATABASE amva_digital;
CREATE USER amva_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE amva_digital TO amva_user;
```

## 🔐 Variables de Entorno en Digital Ocean

### App Platform

1. Settings → App-Level Environment Variables
2. Agregar variables:
   - `DATABASE_URL` (desde Managed Database)
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - etc.

### Droplet

```bash
# Crear archivo .env en servidor
nano /var/www/amva-digital/.env

# O usar variables de sistema
export DATABASE_URL="postgresql://..."
export JWT_SECRET="..."
```

## 📊 Monitoreo Simple

### 1. Digital Ocean Monitoring (Incluido)

- CPU, RAM, Disco
- Uptime
- Alertas automáticas

### 2. Health Check Simple

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verificar base de datos
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return Response.json(
      { status: 'error', error: error.message },
      { status: 503 }
    )
  }
}
```

Verificar: `https://tu-dominio.com/api/health`

## 💰 Costos Estimados (Digital Ocean)

### Opción 1: App Platform

- **Frontend**: Basic ($5/mes) o Professional ($12/mes)
- **Backend**: Basic ($5/mes) o Professional ($12/mes)
- **Database**: Basic ($15/mes) o Professional ($60/mes)
- **Total**: ~$25-84/mes

### Opción 2: Droplet

- **Droplet**: Basic ($6/mes) o Regular ($12/mes)
- **Database**: Managed ($15/mes) o en Droplet (incluido)
- **Total**: ~$6-27/mes

## 🎯 Recomendación para Digital Ocean

### Para Empezar: App Platform

**Razones**:
- ✅ Más simple (similar a Vercel)
- ✅ Deploy automático desde GitHub
- ✅ SSL automático
- ✅ Escalado automático
- ✅ Menos configuración manual

### Migrar a Droplet Si:

- Necesitas más control
- Quieres optimizar costos
- Necesitas configuración específica
- Tienes experiencia con servidores

## 📝 Flujo de Trabajo (Igual que Antes)

### Desarrollo Normal

```bash
# 1. Trabajar en develop
git checkout develop
# ... código ...

# 2. Commit y push
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin develop

# 3. Probar localmente
npm run dev

# 4. Cuando esté listo → Deploy
git checkout main
git merge develop
git push origin main
# → Digital Ocean despliega automáticamente
```

## 🔄 Migración desde Vercel a Digital Ocean

### Paso 1: Preparar Digital Ocean

1. Crear cuenta en Digital Ocean
2. Crear App Platform
3. Conectar repositorio de GitHub
4. Configurar variables de entorno

### Paso 2: Configurar Base de Datos

1. Crear Managed Database en Digital Ocean
2. Migrar datos desde Neon (si aplica)
3. Actualizar `DATABASE_URL`

### Paso 3: Probar en Digital Ocean

1. Hacer deploy de prueba
2. Verificar que todo funciona
3. Probar funcionalidades críticas

### Paso 4: Cambiar DNS

1. Actualizar registros DNS
2. Apuntar dominio a Digital Ocean
3. Esperar propagación DNS (24-48 horas)

### Paso 5: Desactivar Vercel

1. Mantener Vercel como backup por 1 semana
2. Verificar que todo funciona en Digital Ocean
3. Desactivar Vercel cuando estés seguro

## ✅ Ventajas de Digital Ocean

1. ✅ **Más económico** que Vercel para apps grandes
2. ✅ **Más control** sobre infraestructura
3. ✅ **Escalable** fácilmente
4. ✅ **Base de datos** incluida (Managed Database)
5. ✅ **Spaces** para archivos estáticos (similar a S3)

## 🚨 Consideraciones

### Diferencias con Vercel

- ⚠️ **Build time**: Puede ser más lento que Vercel
- ⚠️ **Edge Functions**: No tiene edge functions como Vercel
- ⚠️ **CDN**: Necesitas configurar Spaces para CDN
- ✅ **Base de datos**: Managed Database incluido
- ✅ **Costos**: Más predecibles y escalables

## 📚 Scripts Útiles para Digital Ocean

### `scripts/deploy-do.sh`

```bash
#!/bin/bash

echo "🔍 Verificando antes de deploy..."
npm run build || exit 1

echo "⚠️  ¿Desplegar a Digital Ocean? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Cancelado"
  exit 1
fi

echo "🚀 Desplegando..."
git checkout main
git merge develop
git push origin main

echo "✅ Deploy iniciado"
echo "📊 Revisa: https://cloud.digitalocean.com/apps"
```

### `scripts/backup-db-do.sh`

```bash
#!/bin/bash

echo "📦 Creando backup de base de datos..."

# Si usas Managed Database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# O usar Digital Ocean API para backup automático
# curl -X POST https://api.digitalocean.com/v2/databases/$DB_ID/backups \
#   -H "Authorization: Bearer $DO_TOKEN"

echo "✅ Backup creado"
```

## 🎓 Resumen: Estrategia Simple para Digital Ocean

1. **Desarrollar** → Trabajar en rama `develop`
2. **Probar** → Verificar localmente
3. **Deployar** → Merge a `main` → Digital Ocean despliega automáticamente

**Si algo sale mal**:
- Rollback en Digital Ocean dashboard (30 segundos)

**Todo funciona igual que con Vercel**, solo cambia la plataforma de hosting.

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0 - Digital Ocean Simple

