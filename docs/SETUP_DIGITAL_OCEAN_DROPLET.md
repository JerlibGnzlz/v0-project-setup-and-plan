# 🚀 Configuración Completa en Digital Ocean (Droplet 1GB)

Guía paso a paso para desplegar AMVA Digital en tu droplet **64.225.115.122**.

**Estructura del proyecto:** Monorepo (raíz = Next.js, `backend/` = NestJS)

---

## 📋 Requisitos Previos

- [ ] Droplet con Ubuntu 22.04 (ya tienes: 64.225.115.122)
- [ ] Base de datos PostgreSQL (Neon o Digital Ocean Managed DB)
- [ ] Repositorio en GitHub
- [ ] Variables de entorno (DATABASE_URL, JWT_SECRET, etc.)

---

## Paso 1: Conectarte y actualizar el servidor

```bash
ssh root@64.225.115.122
apt update && apt upgrade -y
```

---

## Paso 2: Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version   # Debe ser v20.x.x
npm --version
```

---

## Paso 3: Instalar PM2 y Nginx

```bash
npm install -g pm2
apt install -y nginx git
systemctl enable nginx
systemctl start nginx
```

---

## Paso 4: Configurar PM2 para que inicie al reiniciar

```bash
pm2 startup
# Ejecuta el comando que te muestre (ej: env PATH=... pm2 startup systemd -u root --hp /root)
```

---

## Paso 5: Crear directorio y clonar el proyecto

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/TU_USUARIO/TU_REPO.git amva-production
cd amva-production
git checkout main
```

**Reemplaza** `TU_USUARIO/TU_REPO` con tu repositorio real (ej: `jerlibgnzlz/v0-project-setup-and-plan`).

---

## Paso 6: Variables de entorno

### Backend (`/var/www/amva-production/backend/.env`)

```bash
nano /var/www/amva-production/backend/.env
```

Contenido (ajusta con tus valores reales):

```env
NODE_ENV=production
PORT=4000

# Base de datos (Neon o tu PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Frontend URL (para CORS)
FRONTEND_URL=http://64.225.115.122

# Redis (opcional - si no tienes, deja localhost)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cloudinary (si usas subida de imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`/var/www/amva-production/.env.local`)

```bash
nano /var/www/amva-production/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://64.225.115.122/api
NEXT_PUBLIC_APK_DOWNLOAD_URL=https://expo.dev/artifacts/eas/xxxxx.apk
```

---

## Paso 7: Ecosystem config para monorepo

El proyecto tiene frontend en la raíz y backend en `backend/`. Crea o actualiza:

```bash
nano /var/www/amva-production/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'amva-backend',
      script: './dist/src/main.js',
      cwd: '/var/www/amva-production/backend',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 4000 },
      error_file: '/var/log/pm2/amva-backend-error.log',
      out_file: '/var/log/pm2/amva-backend-out.log',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'amva-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/amva-production',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: '/var/log/pm2/amva-frontend-error.log',
      out_file: '/var/log/pm2/amva-frontend-out.log',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
}
```

---

## Paso 8: Script de deploy adaptado

```bash
nano /var/www/amva-production/deploy.sh
```

```bash
#!/bin/bash
set -e
APP_DIR="/var/www/amva-production"
cd $APP_DIR

echo "📥 Actualizando código..."
git fetch origin
git reset --hard origin/main

echo "📦 Instalando dependencias..."
npm ci --legacy-peer-deps

echo "📦 Backend..."
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy || true
npm run build
cd ..

echo "🏗️ Build Frontend..."
npm run build

echo "🔄 Reiniciando PM2..."
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "✅ Listo!"
pm2 status
```

```bash
chmod +x /var/www/amva-production/deploy.sh
```

---

## Paso 9: Primer deploy manual

```bash
cd /var/www/amva-production
./deploy.sh
```

Si hay errores, revisa:
- `pm2 logs amva-backend`
- `pm2 logs amva-frontend`

---

## Paso 10: Configurar Nginx

```bash
nano /etc/nginx/sites-available/amva
```

```nginx
server {
    listen 80;
    server_name 64.225.115.122;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/amva /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## Paso 11: Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

---

## Paso 12: Verificar

1. Abre **http://64.225.115.122** en el navegador
2. Prueba login en **http://64.225.115.122/admin/login**

---

## 📝 Comandos útiles

```bash
pm2 status
pm2 logs
pm2 restart all
cd /var/www/amva-production && ./deploy.sh
```

---

## 🔐 Con dominio propio (opcional)

Cuando tengas dominio (ej: amvadigital.com):

1. Apunta el DNS a 64.225.115.122
2. Instala Certbot: `apt install certbot python3-certbot-nginx`
3. Obtén SSL: `certbot --nginx -d amvadigital.com -d www.amvadigital.com -d api.amvadigital.com`
4. Actualiza `FRONTEND_URL` y `NEXT_PUBLIC_API_URL` con el dominio

---

**Última actualización:** Febrero 2026
