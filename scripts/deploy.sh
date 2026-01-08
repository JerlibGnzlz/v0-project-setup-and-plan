#!/bin/bash

# Script de deployment simple para Digital Ocean
# Uso: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
APP_DIR="/var/www/amva-${ENVIRONMENT}"

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: Directorio $APP_DIR no existe"
    exit 1
fi

echo "🚀 Desplegando a ${ENVIRONMENT}..."
echo "📁 Directorio: ${APP_DIR}"

cd $APP_DIR

# Pull latest code
echo "📥 Actualizando código desde Git..."
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$ENVIRONMENT" ]; then
    echo "⚠️  Warning: Branch actual es $CURRENT_BRANCH, debería ser $ENVIRONMENT"
fi
git reset --hard origin/$ENVIRONMENT

# Install dependencies
echo "📦 Instalando dependencias..."

# Frontend
echo "  → Frontend..."
cd frontend
npm ci --legacy-peer-deps --production=false
cd ..

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

# Build Frontend
echo "  → Frontend..."
cd frontend
npm run build
cd ..

# Build Backend
echo "  → Backend..."
cd backend
npm run build
cd ..

# Restart PM2
echo "🔄 Reiniciando servicios con PM2..."
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "✅ Deployment completado!"
echo ""
echo "📊 Estado de servicios:"
pm2 status

echo ""
echo "📝 Ver logs con:"
echo "  pm2 logs amva-backend"
echo "  pm2 logs amva-frontend"

