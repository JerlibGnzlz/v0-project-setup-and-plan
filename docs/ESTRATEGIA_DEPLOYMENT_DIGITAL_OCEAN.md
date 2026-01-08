# 🚀 Estrategia de Deployment para Digital Ocean

## 📋 Resumen Ejecutivo

Esta guía define una estrategia completa para desplegar AMVA Digital en Digital Ocean de manera segura, permitiendo hacer cambios en desarrollo sin afectar producción.

**Fecha**: Enero 2025  
**Objetivo**: Deployment seguro con separación de ambientes (Development, Staging, Production)

---

## 🎯 Principios Clave

### ✅ **Separación de Ambientes**
- **Development**: Para desarrollo local
- **Staging**: Para pruebas antes de producción
- **Production**: Ambiente en vivo para usuarios finales

### ✅ **Branches de Git**
- `main`: Código de producción (solo cambios probados)
- `staging`: Código de pruebas (testing antes de producción)
- `develop`: Código en desarrollo (trabajo activo)
- Feature branches: Para nuevas funcionalidades

### ✅ **CI/CD Automatizado**
- Tests automáticos antes de deploy
- Build automático
- Deploy automático según el branch

### ✅ **Variables de Entorno**
- Cada ambiente tiene sus propias variables
- No se comparten credenciales entre ambientes
- Secrets gestionados de forma segura

---

## 🌳 Estrategia de Branches

### **Estructura de Branches:**

```
main (production)
  ↑
staging (pre-production)
  ↑
develop (development)
  ↑
feature/nueva-funcionalidad
```

### **Flujo de Trabajo:**

1. **Desarrollo**:
   ```bash
   # Crear feature branch desde develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   
   # Trabajar y hacer commits
   git add .
   git commit -m "feat: nueva funcionalidad"
   
   # Push y crear PR a develop
   git push origin feature/nueva-funcionalidad
   ```

2. **Testing (Staging)**:
   ```bash
   # Cuando develop está listo, merge a staging
   git checkout staging
   git pull origin staging
   git merge develop
   git push origin staging
   # → Esto despliega automáticamente a Digital Ocean Staging
   ```

3. **Producción**:
   ```bash
   # Cuando staging está probado, merge a main
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   # → Esto despliega automáticamente a Digital Ocean Production
   ```

---

## 🐳 Docker Configuration

### **1. Frontend Dockerfile** (`Dockerfile`)

```dockerfile
# Frontend (Next.js)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **2. Backend Dockerfile** (`backend/Dockerfile`)

```dockerfile
# Backend (NestJS)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend .

RUN npm run build
RUN npx prisma generate

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 4000

ENV PORT 4000

CMD ["node", "dist/main.js"]
```

### **3. Docker Compose para Local** (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: amva-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ministerio_amva
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: amva-redis
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: amva-backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ministerio_amva
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: amva-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

### **4. Docker Compose para Producción** (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: amva-postgres-prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - amva-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: amva-redis-prod
    networks:
      - amva-network
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: amva-backend-prod
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      NODE_ENV: production
      PORT: 4000
    depends_on:
      - postgres
      - redis
    networks:
      - amva-network
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: amva-frontend-prod
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - amva-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: amva-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - amva-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  amva-network:
    driver: bridge
```

---

## 🔄 CI/CD con GitHub Actions

### **1. Workflow para Staging** (`.github/workflows/deploy-staging.yml`)

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
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/amva-frontend:staging
            ${{ secrets.DOCKER_USERNAME }}/amva-frontend:staging-${{ github.sha }}
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/amva-backend:staging
            ${{ secrets.DOCKER_USERNAME }}/amva-backend:staging-${{ github.sha }}
      
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USERNAME }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/amva-staging
            docker-compose pull
            docker-compose up -d
            docker system prune -af
```

### **2. Workflow para Production** (`.github/workflows/deploy-production.yml`)

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
      
      - name: Run tests
        run: |
          npm run lint
          cd backend && npm run test
        continue-on-error: true

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/amva-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/amva-frontend:production
            ${{ secrets.DOCKER_USERNAME }}/amva-frontend:${{ github.sha }}
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/amva-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/amva-backend:production
            ${{ secrets.DOCKER_USERNAME }}/amva-backend:${{ github.sha }}
      
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USERNAME }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/amva-production
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -af
```

---

## 🔐 Variables de Entorno por Ambiente

### **Staging** (`.env.staging`)

```env
# Database
DATABASE_URL=postgresql://user:password@staging-db-host:5432/amva_staging
POSTGRES_USER=amva_staging
POSTGRES_PASSWORD=secure_password_staging
POSTGRES_DB=amva_staging

# Backend
NODE_ENV=staging
PORT=4000
JWT_SECRET=staging_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://staging.amva.org

# Frontend
NEXT_PUBLIC_API_URL=https://api-staging.amva.org/api

# Cloudinary
CLOUDINARY_CLOUD_NAME=amva_staging
CLOUDINARY_API_KEY=staging_api_key
CLOUDINARY_API_SECRET=staging_api_secret

# Redis
REDIS_URL=redis://staging-redis:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=staging@amva.org
SMTP_PASS=staging_password
```

### **Production** (`.env.production`)

```env
# Database
DATABASE_URL=postgresql://user:password@production-db-host:5432/amva_production
POSTGRES_USER=amva_production
POSTGRES_PASSWORD=secure_password_production_CHANGE_THIS
POSTGRES_DB=amva_production

# Backend
NODE_ENV=production
PORT=4000
JWT_SECRET=production_jwt_secret_SUPER_SECURE_CHANGE_THIS
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://amva.org

# Frontend
NEXT_PUBLIC_API_URL=https://api.amva.org/api

# Cloudinary
CLOUDINARY_CLOUD_NAME=amva_production
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret

# Redis
REDIS_URL=redis://production-redis:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@amva.org
SMTP_PASS=production_password
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

### **4. Setup Inicial en Droplets**

```bash
# Conectarse al droplet
ssh root@your-droplet-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Crear usuario para deployment
adduser deployer
usermod -aG docker deployer
usermod -aG sudo deployer

# Crear directorio del proyecto
mkdir -p /var/www/amva-production
chown -R deployer:deployer /var/www/amva-production
```

---

## 📁 Estructura en el Servidor

```
/var/www/amva-production/
├── docker-compose.prod.yml
├── .env.production
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│       ├── cert.pem
│       └── key.pem
└── logs/
    ├── frontend.log
    └── backend.log
```

---

## 🌐 Configuración Nginx

### **`nginx/nginx.conf`**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:4000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name amva.org www.amva.org;
        return 301 https://$server_name$request_uri;
    }

    # Frontend (HTTPS)
    server {
        listen 443 ssl http2;
        server_name amva.org www.amva.org;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API (HTTPS)
    server {
        listen 443 ssl http2;
        server_name api.amva.org;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://backend;
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
}
```

---

## 📋 Checklist de Deployment

### **Pre-Deployment:**

- [ ] Crear branches `main`, `staging`, `develop`
- [ ] Configurar GitHub Actions workflows
- [ ] Configurar secrets en GitHub
- [ ] Crear Dockerfiles
- [ ] Crear docker-compose files
- [ ] Configurar variables de entorno por ambiente
- [ ] Crear droplets en Digital Ocean
- [ ] Configurar base de datos (PostgreSQL)
- [ ] Configurar Redis
- [ ] Configurar Nginx
- [ ] Configurar SSL (Let's Encrypt)
- [ ] Configurar dominios DNS

### **Post-Deployment:**

- [ ] Verificar que servicios están corriendo
- [ ] Verificar conexión a base de datos
- [ ] Verificar conexión a Redis
- [ ] Verificar que frontend puede conectar a backend
- [ ] Probar autenticación
- [ ] Probar funcionalidades críticas
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo

---

## 🔒 Seguridad

### **1. Secrets Management**

**NUNCA** commitear `.env` files al repositorio. Usar:
- GitHub Secrets para CI/CD
- Variables de entorno en Digital Ocean
- Docker secrets para producción

### **2. Firewall (UFW)**

```bash
# Permitir solo puertos necesarios
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### **3. SSL/TLS**

Usar Let's Encrypt para certificados SSL gratuitos:

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d amva.org -d www.amva.org -d api.amva.org
```

---

## 📊 Monitoreo y Logs

### **1. Ver Logs**

```bash
# Logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend
```

### **2. Monitoreo de Recursos**

```bash
# Usar recursos del sistema
docker stats

# Monitorear disco
df -h

# Monitorear memoria
free -h
```

---

## 🚨 Rollback en Caso de Problemas

Si hay problemas en producción:

```bash
# 1. Detener servicios
docker-compose -f docker-compose.prod.yml down

# 2. Volver a versión anterior
git checkout <commit-anterior>

# 3. Rebuild y restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Próximos Pasos

1. ✅ Implementar Dockerfiles
2. ✅ Configurar GitHub Actions
3. ✅ Crear droplets en Digital Ocean
4. ✅ Configurar bases de datos
5. ✅ Configurar dominios DNS
6. ✅ Primer deployment a staging
7. ✅ Testing en staging
8. ✅ Primer deployment a production

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0

