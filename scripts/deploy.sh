#!/bin/bash

# Script de deployment simple para Digital Ocean
# Uso: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
APP_DIR="/var/www/amva-${ENVIRONMENT}"

# Mapear environment a branch
if [ "$ENVIRONMENT" = "staging" ]; then
    GIT_BRANCH="develop"
elif [ "$ENVIRONMENT" = "production" ]; then
    GIT_BRANCH="main"
else
    echo "❌ Error: Environment debe ser 'staging' o 'production'"
    exit 1
fi

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: Directorio $APP_DIR no existe"
    exit 1
fi

echo "🚀 Desplegando a ${ENVIRONMENT} (branch: ${GIT_BRANCH})..."
echo "📁 Directorio: ${APP_DIR}"

cd $APP_DIR

# Pull latest code
echo "📥 Actualizando código desde Git (branch: ${GIT_BRANCH})..."
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$GIT_BRANCH" ]; then
    echo "⚠️  Cambiando branch de $CURRENT_BRANCH a $GIT_BRANCH..."
    git checkout $GIT_BRANCH
fi
git reset --hard origin/$GIT_BRANCH

# Install dependencies
echo "📦 Instalando dependencias..."

# Frontend (Next.js en raíz)
echo "  → Frontend (raíz)..."
npm ci --legacy-peer-deps --production=false

# Backend
echo "  → Backend..."
cd backend
npm ci --legacy-peer-deps --production=false
cd ..

# Generate Prisma Client
echo "🔧 Generando Prisma Client..."
cd backend
npx prisma generate
cd ..

# Run migrations
echo "🗄️  Ejecutando migraciones de base de datos..."
cd backend
npx prisma migrate deploy || echo "⚠️  Warning: Error en migraciones (puede ser normal si no hay cambios)"
cd ..

# Build applications
echo "🏗️  Construyendo aplicaciones..."

# Build Frontend (Next.js en raíz)
echo "  → Frontend..."
npm run build

# Build Backend
echo "  → Backend..."
cd backend
npm run build
cd ..

# Restart PM2
echo "🔄 Reiniciando servicios con PM2..."
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js

# Actualizar Nginx si existe config
if [ -f "nginx/amva.conf" ]; then
  echo "🌐 Actualizando configuración Nginx..."
  sudo cp nginx/amva.conf /etc/nginx/sites-available/amva 2>/dev/null || true
  sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || echo "⚠️  Nginx: verificar manualmente"
fi

echo "✅ Deployment completado!"
echo ""
echo "📊 Estado de servicios:"
pm2 status

echo ""
echo "📝 Ver logs con:"
echo "  pm2 logs amva-backend"
echo "  pm2 logs amva-frontend"

