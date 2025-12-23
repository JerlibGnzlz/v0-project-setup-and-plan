# 🚀 Checklist de Despliegue en Digital Ocean

## 📋 Estado Actual del Proyecto

### ✅ Lo que YA está listo:

- [x] Backend NestJS configurado
- [x] Frontend Next.js configurado
- [x] Base de datos PostgreSQL (Neon)
- [x] Autenticación JWT
- [x] Cloudinary para imágenes
- [x] Sistema de notificaciones (con Redis opcional)
- [x] Validación de seguridad (Helmet, Rate Limiting)
- [x] Variables de entorno documentadas
- [x] Migraciones de Prisma
- [x] Seed data

### ❌ Lo que FALTA para Digital Ocean:

---

## 🔴 CRÍTICO - Debe estar listo antes de desplegar

### 1. **Dockerfiles** (FALTA)

- [ ] `Dockerfile` para Backend (NestJS)
- [ ] `Dockerfile` para Frontend (Next.js)
- [ ] `.dockerignore` para optimizar builds

**Prioridad**: 🔴 ALTA - Sin esto no puedes desplegar

---

### 2. **Docker Compose** (FALTA)

- [ ] `docker-compose.yml` para producción
- [ ] `docker-compose.dev.yml` para desarrollo local
- [ ] Configuración de servicios (backend, frontend, nginx, redis)

**Prioridad**: 🔴 ALTA - Necesario para orquestar servicios

---

### 3. **Nginx Configuration** (FALTA - Se puede crear después)

- [ ] `nginx.conf` para reverse proxy (template básico)
- [ ] Configuración SSL/HTTPS (se configura en el servidor con Certbot)
- [ ] Configuración de dominio (se configura en Digital Ocean)
- [ ] Headers de seguridad

**Prioridad**: 🔴 ALTA - Necesario para servir la aplicación
**Nota**: ⚠️ El template de `nginx.conf` se puede crear ahora, pero la configuración SSL/HTTPS se hace **directamente en el servidor** cuando despliegues.

---

### 4. **Variables de Entorno de Producción** (FALTA)

- [ ] `.env.production` template completo
- [ ] Documentación de todas las variables necesarias
- [ ] Validación de variables críticas en startup

**Variables críticas que deben estar configuradas**:
```env
# Base de Datos
DATABASE_URL=postgresql://...

# JWT (debe ser seguro, mínimo 32 caracteres)
JWT_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend URL
FRONTEND_URL=https://tu-dominio.com

# Email (SendGrid o Resend recomendado)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...

# Redis (opcional pero recomendado)
REDIS_URL=redis://...

# Google OAuth (si se usa)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Mercado Pago (si se usa)
MERCADOPAGO_ACCESS_TOKEN=...
```

**Prioridad**: 🔴 ALTA - Sin esto la app no funcionará

---

### 5. **Scripts de Deployment** (FALTA)

- [ ] `scripts/deploy.sh` - Script de deployment automatizado
- [ ] `scripts/setup-server.sh` - Setup inicial del servidor
- [ ] `scripts/backup-db.sh` - Backup de base de datos
- [ ] `scripts/restore-db.sh` - Restaurar backup

**Prioridad**: 🔴 ALTA - Necesario para deployment automatizado

---

### 6. **SSL/HTTPS** (FALTA - Se configura en el servidor)

- [ ] Configuración de Let's Encrypt / Certbot (en Digital Ocean)
- [ ] Renovación automática de certificados (en Digital Ocean)
- [ ] Redirección HTTP → HTTPS (en Nginx del servidor)

**Prioridad**: 🔴 ALTA - Necesario para producción segura
**Nota**: ⚠️ Esto se configura **directamente en el servidor de Digital Ocean**, no en el código del proyecto. Puedes dejarlo para cuando despliegues.

---

## 🟡 IMPORTANTE - Debe estar listo pronto

### 7. **Base de Datos en Digital Ocean** (FALTA)

- [ ] Crear PostgreSQL Managed Database en Digital Ocean
- [ ] Configurar conexión desde Droplet
- [ ] Migrar datos desde Neon (si aplica)
- [ ] Configurar backups automáticos

**Prioridad**: 🟡 MEDIA - Puedes usar Neon temporalmente

---

### 8. **Redis en Digital Ocean** (FALTA)

- [ ] Crear Redis Managed Database (opcional pero recomendado)
- [ ] Configurar conexión desde Backend
- [ ] Verificar que las colas de Bull funcionen

**Prioridad**: 🟡 MEDIA - Opcional, pero mejora performance

---

### 9. **Dominio y DNS** (FALTA)

- [ ] Configurar dominio en Digital Ocean
- [ ] Configurar registros DNS (A, CNAME)
- [ ] Configurar subdominios (api.tudominio.com, www.tudominio.com)

**Prioridad**: 🟡 MEDIA - Necesario para producción

---

### 10. **Monitoreo y Logging** (FALTA)

- [ ] Configurar logging centralizado (Papertrail, Logtail, etc.)
- [ ] Configurar monitoreo de uptime (UptimeRobot, Pingdom)
- [ ] Configurar alertas de errores (Sentry, Rollbar)
- [ ] Dashboard de métricas (Grafana, DataDog)

**Prioridad**: 🟡 MEDIA - Importante para producción

---

### 11. **Backups Automáticos** (FALTA)

- [ ] Script de backup de base de datos
- [ ] Configurar backups diarios automáticos
- [ ] Almacenar backups en Spaces (Digital Ocean)
- [ ] Script de restauración

**Prioridad**: 🟡 MEDIA - Crítico para recuperación

---

### 12. **CI/CD Pipeline** (FALTA)

- [ ] GitHub Actions workflow para deployment
- [ ] Tests automatizados antes de deploy
- [ ] Deployment automático en push a main
- [ ] Rollback automático en caso de error

**Prioridad**: 🟡 MEDIA - Mejora el proceso de deployment

---

## 🟢 OPCIONAL - Puede esperar

### 13. **CDN** (OPCIONAL)

- [ ] Configurar Cloudflare o similar
- [ ] Cache de assets estáticos
- [ ] DDoS protection

**Prioridad**: 🟢 BAJA - Mejora performance pero no crítico

---

### 14. **Load Balancer** (OPCIONAL)

- [ ] Configurar Load Balancer si hay múltiples instancias
- [ ] Health checks
- [ ] SSL termination

**Prioridad**: 🟢 BAJA - Solo si escalas horizontalmente

---

### 15. **Documentación de Deployment** (FALTA)

- [ ] Guía paso a paso de deployment
- [ ] Troubleshooting común
- [ ] Comandos útiles
- [ ] Rollback procedures

**Prioridad**: 🟢 BAJA - Importante para mantenimiento

---

## 📝 Plan de Acción Recomendado

### Fase 1: Preparación (1-2 días)

1. ✅ Crear Dockerfiles (Backend + Frontend)
2. ✅ Crear docker-compose.yml
3. ✅ Configurar Nginx
4. ✅ Preparar variables de entorno

### Fase 2: Infraestructura (1-2 días)

5. ✅ Crear Droplet en Digital Ocean
6. ✅ Configurar dominio y DNS
7. ✅ Configurar SSL/HTTPS
8. ✅ Crear PostgreSQL Managed Database

### Fase 3: Deployment (1 día)

9. ✅ Desplegar aplicación
10. ✅ Configurar backups
11. ✅ Configurar monitoreo
12. ✅ Testing completo

### Fase 4: Optimización (Opcional)

13. ✅ Configurar CI/CD
14. ✅ Optimizar performance
15. ✅ Configurar CDN

---

## 🔧 Archivos que Necesitas Crear

### 1. `Dockerfile` (Backend)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

### 2. `Dockerfile` (Frontend)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... más variables
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 4. `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:4000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name tudominio.com www.tudominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tudominio.com www.tudominio.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # API Backend
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 🎯 Resumen de Prioridades

### 🔴 CRÍTICO (Debe estar antes de desplegar):
1. Dockerfiles
2. Docker Compose
3. Nginx Configuration
4. Variables de Entorno
5. Scripts de Deployment
6. SSL/HTTPS

### 🟡 IMPORTANTE (Debe estar pronto):
7. Base de Datos
8. Redis
9. Dominio y DNS
10. Monitoreo
11. Backups
12. CI/CD

### 🟢 OPCIONAL (Puede esperar):
13. CDN
14. Load Balancer
15. Documentación

---

## ✅ Checklist Final

Antes de decir "listo para producción", verifica:

- [ ] Todos los archivos Docker creados
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS funcionando
- [ ] Base de datos conectada
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] Tests pasando
- [ ] Documentación completa
- [ ] Rollback plan listo

---

**¿Necesitas ayuda creando estos archivos?** Puedo ayudarte a crear todos los archivos necesarios paso a paso.

