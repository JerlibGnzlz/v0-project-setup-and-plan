# 🌐 Guía de Configuración de Dominios para AMVA Digital

## 📋 Resumen

Esta guía te ayudará a adquirir y configurar dominios para:
- **Landing Page** (página pública)
- **Dashboard Admin** (panel administrativo)
- **API Backend** (opcional, subdominio)

**Fecha**: Enero 2025

---

## 🎯 Estructura de Dominios Recomendada

### **Opción 1: Un Dominio Principal + Subdominios (RECOMENDADO)**

```
amvadigital.com (o amvadigital.org)
├── www.amvadigital.com → Landing Page (pública)
├── admin.amvadigital.com → Dashboard Admin (privado)
└── api.amvadigital.com → Backend API (opcional)
```

**Ventajas:**
- ✅ Un solo dominio para comprar
- ✅ Más económico
- ✅ Más fácil de gestionar
- ✅ Un solo certificado SSL cubre todos los subdominios

**Ejemplo de URLs:**
- Landing: `https://www.amvadigital.com` o `https://amvadigital.com`
- Dashboard: `https://admin.amvadigital.com`
- API: `https://api.amvadigital.com`

---

### **Opción 2: Dos Dominios Separados**

```
amvadigital.com → Landing Page
admin.amvadigital.com → Dashboard Admin
```

**Ventajas:**
- ✅ Separación clara entre público y privado
- ✅ Puedes usar dominios diferentes si prefieres

**Ejemplo de URLs:**
- Landing: `https://amvadigital.com`
- Dashboard: `https://admin.amvadigital.com` (o `https://dashboard.amvadigital.com`)

---

## 🛒 Proveedores de Dominios Recomendados

### **1. Namecheap** (Recomendado para principiantes)
- **Precio**: ~$10-15 USD/año (.com)
- **Ventajas**: Interfaz simple, buen soporte, sin trucos de precios
- **URL**: https://www.namecheap.com
- **Recomendado para**: Principiantes, proyectos pequeños

### **2. Cloudflare Registrar** (Recomendado para seguridad)
- **Precio**: Precio al costo (~$8-10 USD/año .com)
- **Ventajas**: Sin markup, DNS rápido, seguridad integrada
- **URL**: https://www.cloudflare.com/products/registrar/
- **Recomendado para**: Proyectos que ya usan Cloudflare

### **3. Google Domains** (Ahora Squarespace Domains)
- **Precio**: ~$12 USD/año (.com)
- **Ventajas**: Integración con Google Workspace
- **URL**: https://domains.google
- **Nota**: Google vendió a Squarespace, pero sigue funcionando

### **4. DigitalOcean** (Si ya usas DO)
- **Precio**: ~$12-15 USD/año (.com)
- **Ventajas**: Todo en un solo lugar, fácil integración
- **URL**: https://www.digitalocean.com/products/domains
- **Recomendado para**: Si ya tienes cuenta en DigitalOcean

### **5. GoDaddy** (No recomendado)
- **Precio**: Barato el primer año, luego caro
- **Desventajas**: Upselling agresivo, renovaciones caras
- **Recomendación**: Evitar si es posible

---

## 📝 Pasos para Adquirir un Dominio

### **1. Elegir el Nombre del Dominio**

**Recomendaciones:**
- ✅ Corto y memorable: `amvadigital.com`
- ✅ Fácil de escribir: sin guiones ni números
- ✅ Relevante: relacionado con tu marca
- ✅ Extensión: `.com` (más confiable) o `.org` (para organizaciones)

**Ejemplos para AMVA:**
- `amvadigital.com` ✅
- `ministerioamva.com` ✅
- `amva.org` ✅
- `amva-digital.com` ⚠️ (guión puede confundir)

### **2. Comprar el Dominio**

**Ejemplo con Namecheap:**

1. Ve a https://www.namecheap.com
2. Busca tu dominio (ej: `amvadigital.com`)
3. Agrega al carrito
4. **IMPORTANTE**: Desactiva "Auto-Renew" si no quieres renovación automática (o déjalo activo si sí)
5. Completa el pago
6. Verifica tu email para confirmar la compra

### **3. Configurar DNS en DigitalOcean**

Una vez que tengas el dominio, necesitas apuntarlo a tu Droplet de DigitalOcean.

---

## 🔧 Configuración DNS en DigitalOcean

### **Paso 1: Obtener la IP de tu Droplet**

```bash
# En DigitalOcean Dashboard → Droplets → Tu Droplet
# Copia la IP pública (ej: 164.90.xxx.xxx)
```

### **Paso 2: Configurar DNS en tu Proveedor de Dominio**

**Si compraste en Namecheap:**

1. Ve a tu cuenta → **Domain List** → Click en tu dominio
2. Ve a la sección **"Advanced DNS"**
3. Agrega estos registros:

```
Tipo    Nombre          Valor                    TTL
A       @               164.90.xxx.xxx          3600
A       www             164.90.xxx.xxx          3600
A       admin           164.90.xxx.xxx          3600
A       api             164.90.xxx.xxx          3600
```

**Si compraste en Cloudflare:**

1. Agrega tu dominio a Cloudflare
2. Cambia los nameservers en tu registrador a los de Cloudflare
3. En Cloudflare → DNS → Agrega registros:

```
Tipo    Nombre          Contenido               Proxy
A       @               164.90.xxx.xxx          ☐ (desactivado)
A       www             164.90.xxx.xxx          ☐ (desactivado)
A       admin           164.90.xxx.xxx          ☐ (desactivado)
A       api             164.90.xxx.xxx          ☐ (desactivado)
```

**Nota**: Desactiva el proxy (☐) durante la configuración inicial. Puedes activarlo después si quieres usar Cloudflare CDN.

**Si compraste en DigitalOcean:**

1. Ve a **Networking** → **Domains**
2. Agrega tu dominio: `amvadigital.com`
3. Agrega estos registros:

```
Tipo    Hostname        Will Direct To          TTL
A       @               164.90.xxx.xxx          3600
A       www             164.90.xxx.xxx          3600
A       admin           164.90.xxx.xxx          3600
A       api             164.90.xxx.xxx          3600
```

### **Paso 3: Verificar Propagación DNS**

```bash
# Verifica que los DNS están propagados (puede tardar 5 minutos a 48 horas)
dig amvadigital.com
dig www.amvadigital.com
dig admin.amvadigital.com
dig api.amvadigital.com

# O usa herramientas online:
# https://www.whatsmydns.net/
```

---

## 🔒 Configuración SSL con Let's Encrypt

### **Paso 1: Instalar Certbot**

```bash
# En tu Droplet de DigitalOcean
ssh root@tu-ip-droplet

# Instalar Certbot
apt update
apt install -y certbot python3-certbot-nginx
```

### **Paso 2: Configurar Nginx (ANTES de obtener certificados)**

Crea el archivo de configuración de Nginx:

```bash
nano /etc/nginx/sites-available/amva-production
```

**⚠️ IMPORTANTE**: AMVA Digital usa Next.js con rutas separadas (`/` para landing, `/admin/*` para dashboard). Tienes dos opciones:

---

#### **Opción A: Un Solo Dominio (RECOMENDADO - Más Simple)**

Si prefieres usar un solo dominio y separar por rutas:

- `amvadigital.com` → Landing (`/`) y Admin (`/admin/*`)
- `api.amvadigital.com` → Backend API

**Contenido del archivo Nginx:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name amvadigital.com www.amvadigital.com api.amvadigital.com;
    return 301 https://$server_name$request_uri;
}

# Frontend Next.js (Landing + Admin en el mismo servidor)
server {
    listen 443 ssl http2;
    server_name amvadigital.com www.amvadigital.com;

    ssl_certificate /etc/letsencrypt/live/amvadigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amvadigital.com/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

# Backend API
server {
    listen 443 ssl http2;
    server_name api.amvadigital.com;

    ssl_certificate /etc/letsencrypt/live/amvadigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amvadigital.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

**Ventajas:**
- ✅ Más simple (un solo dominio)
- ✅ Next.js maneja el enrutamiento (`/` vs `/admin/*`)
- ✅ Menos configuración DNS

**URLs resultantes:**
- Landing: `https://amvadigital.com`
- Admin: `https://amvadigital.com/admin`
- API: `https://api.amvadigital.com`

---

#### **Opción B: Dominios Separados (Más Profesional)**

Si prefieres separar completamente landing y admin:

- `amvadigital.com` → Solo Landing (`/`)
- `admin.amvadigital.com` → Solo Admin (redirige a `/admin/*`)
- `api.amvadigital.com` → Backend API

**Contenido del archivo Nginx:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name amvadigital.com www.amvadigital.com admin.amvadigital.com api.amvadigital.com;
    return 301 https://$server_name$request_uri;
}

# Landing Page (Frontend Público)
server {
    listen 443 ssl http2;
    server_name amvadigital.com www.amvadigital.com;

    ssl_certificate /etc/letsencrypt/live/amvadigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amvadigital.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Solo servir rutas públicas (no /admin/*)
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

    # Bloquear acceso a /admin desde el dominio principal
    location /admin {
        return 301 https://admin.amvadigital.com$request_uri;
    }
}

# Dashboard Admin
server {
    listen 443 ssl http2;
    server_name admin.amvadigital.com;

    ssl_certificate /etc/letsencrypt/live/amvadigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amvadigital.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

# Backend API
server {
    listen 443 ssl http2;
    server_name api.amvadigital.com;

    ssl_certificate /etc/letsencrypt/live/amvadigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amvadigital.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

**Ventajas:**
- ✅ Separación clara entre público y privado
- ✅ Más profesional
- ✅ Puedes aplicar políticas de seguridad diferentes

**URLs resultantes:**
- Landing: `https://amvadigital.com`
- Admin: `https://admin.amvadigital.com` (redirige a `/admin/*` internamente)
- API: `https://api.amvadigital.com`

**⚠️ Nota**: Con esta opción, ambos dominios apuntan al mismo servidor Next.js (puerto 3000). Next.js manejará el enrutamiento según la ruta (`/` vs `/admin/*`).

**Habilitar el sitio:**

```bash
# Crear symlink
ln -s /etc/nginx/sites-available/amva-production /etc/nginx/sites-enabled/

# Test configuración
nginx -t

# Si hay errores, corrígelos antes de continuar
```

### **Paso 3: Obtener Certificados SSL**

**Para Opción A (Un solo dominio):**

```bash
# Obtener certificado para landing y API
certbot --nginx -d amvadigital.com -d www.amvadigital.com -d api.amvadigital.com

# Seguir las instrucciones:
# - Email: tu email (para notificaciones de renovación)
# - Términos: Aceptar
# - Compartir email: Opcional (puedes decir No)
# - Redirección HTTP a HTTPS: Sí (2)
```

**Para Opción B (Dominios separados):**

```bash
# Obtener certificado para todos los dominios
certbot --nginx -d amvadigital.com -d www.amvadigital.com -d admin.amvadigital.com -d api.amvadigital.com

# Seguir las instrucciones:
# - Email: tu email (para notificaciones de renovación)
# - Términos: Aceptar
# - Compartir email: Opcional (puedes decir No)
# - Redirección HTTP a HTTPS: Sí (2)
```

**Certbot automáticamente:**
- ✅ Obtiene los certificados SSL
- ✅ Configura Nginx para usar HTTPS
- ✅ Configura renovación automática

### **Paso 4: Verificar Renovación Automática**

```bash
# Test renovación (dry-run)
certbot renew --dry-run

# Si funciona, los certificados se renovarán automáticamente cada 90 días
```

---

## ⚙️ Configuración de Variables de Entorno

### **Backend** (`/var/www/amva-production/backend/.env`)

```env
# URLs de Frontend
FRONTEND_URL=https://www.amvadigital.com
ADMIN_URL=https://admin.amvadigital.com

# CORS (permitir ambos dominios)
CORS_ORIGIN=https://www.amvadigital.com,https://admin.amvadigital.com
```

### **Frontend** (`/var/www/amva-production/.env.local`)

```env
# URL del Backend API
NEXT_PUBLIC_API_URL=https://api.amvadigital.com/api

# URL del Frontend (para redirecciones y links)
NEXT_PUBLIC_FRONTEND_URL=https://amvadigital.com
```

---

## 🚀 Configuración de PM2 para Dos Frontends

Si tienes landing y admin en puertos diferentes, actualiza `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'amva-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/amva-production/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'amva-frontend-landing',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/amva-production/frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'amva-frontend-admin',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/amva-production/admin',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
```

---

## 📋 Checklist de Configuración

### **Pre-Deployment:**

- [ ] Comprar dominio (ej: `amvadigital.com`)
- [ ] Configurar registros DNS (A records) en tu proveedor
- [ ] Verificar propagación DNS (`dig` o herramienta online)
- [ ] Configurar Nginx con los dominios
- [ ] Obtener certificados SSL con Certbot
- [ ] Verificar renovación automática de SSL
- [ ] Actualizar variables de entorno (FRONTEND_URL, ADMIN_URL, etc.)
- [ ] Configurar PM2 para múltiples frontends si aplica
- [ ] Probar acceso a `https://www.amvadigital.com`
- [ ] Probar acceso a `https://admin.amvadigital.com`
- [ ] Probar acceso a `https://api.amvadigital.com`

---

## 🔍 Troubleshooting

### **Problema: "DNS no resuelve"**

```bash
# Verificar propagación
dig amvadigital.com
nslookup amvadigital.com

# Si no resuelve, espera 5 minutos a 48 horas (propagación DNS)
```

### **Problema: "Certbot falla al obtener certificado"**

```bash
# Verificar que Nginx está corriendo
systemctl status nginx

# Verificar que los dominios apuntan a tu IP
dig amvadigital.com

# Verificar que el puerto 80 está abierto
ufw allow 80/tcp
ufw allow 443/tcp
```

### **Problema: "502 Bad Gateway"**

```bash
# Verificar que PM2 está corriendo
pm2 status

# Verificar logs
pm2 logs amva-backend
pm2 logs amva-frontend-landing

# Verificar que los puertos están correctos en Nginx
# (localhost:3000 para landing, localhost:3001 para admin, localhost:4000 para API)
```

---

## 💰 Costos Estimados

### **Dominio:**
- **.com**: ~$10-15 USD/año
- **.org**: ~$12-18 USD/año
- **.net**: ~$10-15 USD/año

### **SSL:**
- **Let's Encrypt**: ✅ **GRATIS** (renovación automática)

### **Total Anual:**
- **~$10-18 USD/año** (solo el dominio)

---

## 📚 Recursos Adicionales

- **Let's Encrypt**: https://letsencrypt.org/
- **Certbot Docs**: https://certbot.eff.org/
- **DigitalOcean DNS**: https://www.digitalocean.com/docs/networking/dns/
- **Nginx Docs**: https://nginx.org/en/docs/

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0
