# 🚀 Opciones de Deployment en Digital Ocean

## ❓ ¿Docker es Obligatorio?

**NO, Docker NO es obligatorio.** Puedes desplegar de **dos formas**:

---

## 📋 Opción 1: Sin Docker (Instalación Directa)

### ✅ Ventajas

- ✅ **Más simple** - Instalas Node.js directamente
- ✅ **Menos configuración** - No necesitas Dockerfiles
- ✅ **Más control** - Ves exactamente qué está corriendo
- ✅ **Menos recursos** - No hay overhead de Docker

### ❌ Desventajas

- ❌ **Más manual** - Tienes que instalar todo tú mismo
- ❌ **Menos portable** - Depende del sistema operativo
- ❌ **Más difícil de escalar** - Si necesitas múltiples instancias

### 🔧 Cómo funciona

```bash
# En tu servidor Digital Ocean
# 1. Instalar Node.js
sudo apt update
sudo apt install nodejs npm

# 2. Clonar tu repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 3. Instalar dependencias del backend
cd backend
npm install
npx prisma generate
npm run build

# 4. Instalar dependencias del frontend
cd ..
npm install
npm run build

# 5. Correr con PM2 (gestor de procesos)
pm2 start backend/dist/main.js --name backend
pm2 start npm --name frontend -- start
```

---

## 📋 Opción 2: Con Docker (Recomendado)

### ✅ Ventajas

- ✅ **Más portable** - Funciona igual en cualquier servidor
- ✅ **Más fácil de escalar** - Puedes agregar más instancias fácilmente
- ✅ **Aislamiento** - Cada servicio está aislado
- ✅ **Más fácil de mantener** - Un solo comando para todo
- ✅ **Mejor para producción** - Estándar de la industria

### ❌ Desventajas

- ❌ **Más configuración inicial** - Necesitas Dockerfiles
- ❌ **Más recursos** - Docker consume un poco más de memoria
- ❌ **Curva de aprendizaje** - Si no conoces Docker

### 🔧 Cómo funciona

```bash
# En tu servidor Digital Ocean
# 1. Instalar Docker y Docker Compose
sudo apt update
sudo apt install docker.io docker-compose

# 2. Clonar tu repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Levantar todo con un comando
docker-compose up -d
```

---

## 🎯 Comparación Rápida

| Aspecto | Sin Docker | Con Docker |
|---------|------------|------------|
| **Complejidad inicial** | ✅ Simple | ⚠️ Más complejo |
| **Configuración** | ⚠️ Manual | ✅ Automática |
| **Portabilidad** | ❌ Depende del OS | ✅ Universal |
| **Escalabilidad** | ❌ Difícil | ✅ Fácil |
| **Mantenimiento** | ⚠️ Manual | ✅ Automático |
| **Recursos** | ✅ Menos | ⚠️ Un poco más |
| **Recomendado para** | Proyectos pequeños | Producción |

---

## 💡 Recomendación

### Para tu proyecto (Ministerio AMVA):

**Recomiendo empezar SIN Docker** si:
- ✅ Es tu primer deployment
- ✅ Quieres algo rápido y simple
- ✅ Solo tienes un servidor pequeño
- ✅ No planeas escalar pronto

**Recomiendo usar Docker** si:
- ✅ Quieres mejores prácticas
- ✅ Planeas escalar en el futuro
- ✅ Quieres facilitar el mantenimiento
- ✅ Tienes experiencia con Docker

---

## 🔧 Guía: Deployment Sin Docker

### Paso 1: Preparar el Servidor

```bash
# Conectar a tu servidor Digital Ocean
ssh root@tu-servidor-ip

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar PostgreSQL client (si necesitas)
sudo apt install -y postgresql-client
```

### Paso 2: Clonar y Configurar

```bash
# Clonar repositorio
cd /var/www
sudo git clone https://github.com/tu-usuario/tu-repo.git amva-auth
cd amva-auth

# Configurar backend
cd backend
npm install
npx prisma generate
cp .env.example .env
# Editar .env con tus valores de producción
npm run build

# Configurar frontend
cd ..
npm install
cp .env.example .env.local
# Editar .env.local con tus valores
npm run build
```

### Paso 3: Configurar PM2

```bash
# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/dist/src/main.js',
      cwd: '/var/www/amva-auth',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/amva-auth',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M'
    }
  ]
}
EOF

# Iniciar aplicaciones
pm2 start ecosystem.config.js

# Guardar configuración para que inicie al reiniciar
pm2 save
pm2 startup
```

### Paso 4: Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/amva-auth
```

```nginx
# /etc/nginx/sites-available/amva-auth
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Backend API
    location /api {
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
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/amva-auth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 5: Configurar SSL (cuando despliegues)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados SSL
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## 🔧 Guía: Deployment Con Docker

Si decides usar Docker después, puedes seguir la guía del checklist que creamos antes.

---

## ✅ Resumen

### ¿Puedes desplegar sin Docker?

**SÍ, absolutamente.** Docker es una herramienta útil pero **NO es obligatoria**.

### ¿Cuál elegir?

**Sin Docker** (Recomendado para empezar):
- ✅ Más simple
- ✅ Menos configuración
- ✅ Perfecto para proyectos pequeños

**Con Docker** (Recomendado para producción a largo plazo):
- ✅ Mejor para escalar
- ✅ Más portable
- ✅ Mejores prácticas

---

## 🎯 Plan Recomendado

### Para empezar:

1. ✅ **Despliega SIN Docker** (más rápido y simple)
2. ✅ Configura SSL/HTTPS
3. ✅ Verifica que todo funciona

### Para el futuro:

4. ⏸️ Si necesitas escalar o mejorar mantenimiento, migra a Docker

---

**¿Quieres que te ayude a crear los archivos necesarios para deployment sin Docker?** Puedo crear:
- Scripts de setup del servidor
- Configuración de PM2
- Configuración de Nginx
- Guía paso a paso

