# 🚀 Estrategia de Deployment Simple para Digital Ocean (Sin Docker)

## 📋 Resumen Ejecutivo

Esta guía define una estrategia **simple y directa** para desplegar AMVA Digital en Digital Ocean sin Docker, usando PM2 para gestión de procesos y scripts simples de deployment.

**Fecha**: Enero 2025  
**Objetivo**: Deployment simple y eficiente sin contenedores

---

## 🎯 Principios Clave

### ✅ **Separación de Ambientes**
- **Development**: Desarrollo local
- **Staging**: Pruebas antes de producción
- **Production**: Ambiente en vivo

### ✅ **Branches de Git**
- `main`: Producción (solo código probado)
- `staging`: Pre-producción (testing)
- `develop`: Desarrollo activo

### ✅ **Herramientas Simples**
- **PM2**: Gestión de procesos Node.js
- **Nginx**: Reverse proxy
- **Git**: Control de versiones
- **Scripts bash**: Deployment automatizado

---

## 🌳 Estrategia de Branches

### **Flujo de Trabajo:**

```
feature/nueva-funcionalidad
  ↓
develop (desarrollo)
  ↓
staging (pruebas)
  ↓
main (producción)
```

### **Comandos:**

```bash
# 1. Desarrollo en feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad
# ... trabajar ...
git push origin feature/nueva-funcionalidad
# Crear PR a develop

# 2. Merge a staging para probar
git checkout staging
git pull origin staging
git merge develop
git push origin staging
# → Se despliega automáticamente a staging

# 3. Si todo está bien, merge a production
git checkout main
git pull origin main
git merge staging
git push origin main
# → Se despliega automáticamente a production
```

---

## 🖥️ Configuración en Digital Ocean

### **1. Crear Droplets**

#### **Droplet para Staging:**
- **Size**: Basic ($12/mes) - 2GB RAM, 1 vCPU
- **Region**: Más cercano a tu ubicación
- **Image**: Ubuntu 22.04 LTS
- **Hostname**: `amva-staging`

#### **Droplet para Production:**
- **Size**: Regular ($24/mes) - 4GB RAM, 2 vCPU
- **Region**: Más cercano a usuarios
- **Image**: Ubuntu 22.04 LTS
- **Hostname**: `amva-production`

### **2. Base de Datos (Digital Ocean Managed Database)**

#### **Staging Database:**
- **Engine**: PostgreSQL 16
- **Size**: Basic ($15/mes) - 1GB RAM, 1 vCPU
- **Database Name**: `amva_staging`

#### **Production Database:**
- **Engine**: PostgreSQL 16
- **Size**: Professional ($90/mes) - 2GB RAM, 1 vCPU
- **Database Name**: `amva_production`
- **Backups**: Diarios automáticos

### **3. Redis (Digital Ocean Managed)**

#### **Staging Redis:**
- **Size**: Basic ($15/mes) - 1GB RAM

#### **Production Redis:**
- **Size**: Professional ($45/mes) - 2GB RAM

---

## 🔧 Setup Inicial en el Servidor

### **1. Conectarse al Droplet**

```bash
ssh root@your-droplet-ip
```

### **2. Actualizar Sistema**

```bash
apt update && apt upgrade -y
```

### **3. Instalar Node.js 20**

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalación
node --version  # Debe ser v20.x.x
npm --version
```

### **4. Instalar PM2**

```bash
npm install -g pm2
pm2 startup
# Ejecutar el comando que aparece para iniciar PM2 al boot
```

### **5. Instalar Nginx**

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### **6. Instalar Git**

```bash
apt install -y git
```

### **7. Crear Usuario para Deployment**

```bash
# Crear usuario
adduser deployer
usermod -aG sudo deployer

# Permitir SSH sin password (opcional, más seguro)
# Configurar SSH keys en lugar de password
```

### **8. Configurar Directorios**

```bash
# Crear directorio del proyecto
mkdir -p /var/www/amva-production
mkdir -p /var/www/amva-staging

# Dar permisos
chown -R deployer:deployer /var/www/amva-production
chown -R deployer:deployer /var/www/amva-staging
```

### **9. Configurar SSL (Let's Encrypt)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificados (después de configurar Nginx)
certbot --nginx -d amva.org -d www.amva.org -d api.amva.org
```

---

## 📁 Estructura en el Servidor

```
/var/www/amva-production/
├── backend/
│   ├── dist/
│   ├── node_modules/
│   ├── prisma/
│   └── .env
├── frontend/
│   ├── .next/
│   ├── node_modules/
│   ├── public/
│   └── .env.local
├── ecosystem.config.js
├── deploy.sh
└── .env (variables compartidas)
```

---

## 📝 Variables de Entorno

### **Staging** (`/var/www/amva-staging/.env`)

```env
# Environment
NODE_ENV=staging

# Database
DATABASE_URL=postgresql://user:password@staging-db-host:5432/amva_staging

# Backend
PORT=4000
JWT_SECRET=staging_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://staging.amva.org

# Redis
REDIS_URL=redis://staging-redis:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=amva_staging
CLOUDINARY_API_KEY=staging_api_key
CLOUDINARY_API_SECRET=staging_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=staging@amva.org
SMTP_PASS=staging_password
```

### **Production** (`/var/www/amva-production/.env`)

```env
# Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@production-db-host:5432/amva_production

# Backend
PORT=4000
JWT_SECRET=production_jwt_secret_SUPER_SECURE_CHANGE_THIS
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://amva.org

# Redis
REDIS_URL=redis://production-redis:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=amva_production
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@amva.org
SMTP_PASS=production_password
```

### **Frontend Staging** (`/var/www/amva-staging/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api-staging.amva.org/api
```

### **Frontend Production** (`/var/www/amva-production/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.amva.org/api
```

---

## 🚀 Script de Deployment

### **`deploy.sh`** (Para usar en el servidor)

```bash
#!/bin/bash

# Script de deployment simple
# Uso: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
APP_DIR="/var/www/amva-${ENVIRONMENT}"

echo "🚀 Desplegando a ${ENVIRONMENT}..."

cd $APP_DIR

# Pull latest code
echo "📥 Actualizando código..."
git fetch origin
git reset --hard origin/${ENVIRONMENT}

# Install dependencies
echo "📦 Instalando dependencias..."

# Frontend
cd frontend
npm ci --legacy-peer-deps --production=false

# Backend
cd ../backend
npm ci --legacy-peer-deps --production=false

# Generate Prisma Client
echo "🔧 Generando Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️ Ejecutando migraciones..."
npx prisma migrate deploy

# Build applications
echo "🏗️ Construyendo aplicaciones..."

# Build Frontend
cd ../frontend
npm run build

# Build Backend
cd ../backend
npm run build

# Restart PM2
echo "🔄 Reiniciando servicios..."
pm2 restart ecosystem.config.js --update-env

echo "✅ Deployment completado!"
```

### **Hacer ejecutable:**

```bash
chmod +x /var/www/amva-production/deploy.sh
chmod +x /var/www/amva-staging/deploy.sh
```

---

## ⚙️ Configuración PM2

### **`ecosystem.config.js`** (En la raíz del proyecto)

```javascript
module.exports = {
  apps: [
    {
      name: 'amva-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/amva-production/backend',
      instances: 2, // O 'max' para usar todos los CPUs
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/pm2/amva-backend-error.log',
      out_file: '/var/log/pm2/amva-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'amva-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/amva-production/frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/amva-frontend-error.log',
      out_file: '/var/log/pm2/amva-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
}
```

### **Copiar a servidor:**

```bash
# En el servidor
cp ecosystem.config.js /var/www/amva-production/
cp ecosystem.config.js /var/www/amva-staging/
```

---

## 🌐 Configuración Nginx

### **Production** (`/etc/nginx/sites-available/amva-production`)

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name amva.org www.amva.org api.amva.org;
    return 301 https://$server_name$request_uri;
}

# Frontend (HTTPS)
server {
    listen 443 ssl http2;
    server_name amva.org www.amva.org;

    ssl_certificate /etc/letsencrypt/live/amva.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amva.org/privkey.pem;

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
}

# Backend API (HTTPS)
server {
    listen 443 ssl http2;
    server_name api.amva.org;

    ssl_certificate /etc/letsencrypt/live/amva.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amva.org/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Habilitar sitio:**

```bash
# Crear symlink
ln -s /etc/nginx/sites-available/amva-production /etc/nginx/sites-enabled/

# Test configuración
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 🔄 CI/CD con GitHub Actions

### **`.github/workflows/deploy-staging.yml`**

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USERNAME }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/amva-staging
            ./deploy.sh staging
```

### **`.github/workflows/deploy-production.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          npm install --legacy-peer-deps
          cd backend && npm install --legacy-peer-deps
      
      - name: Run lint
        run: npm run lint
        continue-on-error: true

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USERNAME }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/amva-production
            ./deploy.sh production
```

---

## 📋 Checklist de Deployment

### **Pre-Deployment:**

- [ ] Crear branches `main`, `staging`, `develop`
- [ ] Crear droplets en Digital Ocean
- [ ] Configurar base de datos PostgreSQL
- [ ] Configurar Redis
- [ ] Setup inicial en servidor (Node.js, PM2, Nginx)
- [ ] Configurar variables de entorno
- [ ] Configurar Nginx
- [ ] Configurar SSL (Let's Encrypt)
- [ ] Configurar dominios DNS
- [ ] Copiar `ecosystem.config.js` a servidor
- [ ] Crear script `deploy.sh` en servidor
- [ ] Configurar GitHub Actions
- [ ] Configurar secrets en GitHub

### **Post-Deployment:**

- [ ] Verificar que PM2 está corriendo
- [ ] Verificar conexión a base de datos
- [ ] Verificar conexión a Redis
- [ ] Verificar que frontend puede conectar a backend
- [ ] Probar autenticación
- [ ] Probar funcionalidades críticas
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo

---

## 🔧 Comandos Útiles

### **PM2:**

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs amva-backend
pm2 logs amva-frontend

# Reiniciar
pm2 restart all
pm2 restart amva-backend
pm2 restart amva-frontend

# Detener
pm2 stop all

# Eliminar
pm2 delete all
```

### **Nginx:**

```bash
# Ver estado
systemctl status nginx

# Test configuración
nginx -t

# Reload
systemctl reload nginx

# Restart
systemctl restart nginx

# Ver logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### **Deployment Manual:**

```bash
# En el servidor
cd /var/www/amva-production
./deploy.sh production
```

---

## 🚨 Rollback en Caso de Problemas

```bash
# 1. Ver commits recientes
cd /var/www/amva-production
git log --oneline -10

# 2. Volver a commit anterior
git checkout <commit-hash>

# 3. Re-deploy
./deploy.sh production
```

---

## 🔒 Seguridad

### **1. Firewall (UFW)**

```bash
# Permitir solo puertos necesarios
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### **2. Variables de Entorno**

**NUNCA** commitear `.env` files. Guardar en:
- `/var/www/amva-production/.env`
- `/var/www/amva-staging/.env`
- Proteger con permisos: `chmod 600 .env`

### **3. SSL/TLS**

Usar Let's Encrypt para certificados gratuitos:

```bash
certbot --nginx -d amva.org -d www.amva.org -d api.amva.org
certbot renew --dry-run  # Test renovación automática
```

---

## 📊 Monitoreo

### **Ver logs:**

```bash
# PM2 logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### **Monitorear recursos:**

```bash
# CPU y memoria
htop

# Disco
df -h

# PM2 monit
pm2 monit
```

---

## 📚 Próximos Pasos

1. ✅ Crear droplets en Digital Ocean
2. ✅ Setup inicial en servidor
3. ✅ Configurar base de datos y Redis
4. ✅ Clonar repositorio en servidor
5. ✅ Configurar variables de entorno
6. ✅ Configurar PM2 y Nginx
7. ✅ Primer deployment a staging
8. ✅ Testing en staging
9. ✅ Primer deployment a production

---

**Última actualización**: Enero 2025  
**Versión**: 2.0.0 (Sin Docker)

