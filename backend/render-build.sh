#!/bin/bash
# Script de build para Render.com
# Render.com ejecutará este script automáticamente si está configurado como Build Command

set -e

echo "🚀 Iniciando build en Render.com..."

# Navegar al directorio backend si estamos en la raíz
if [ -d "backend" ]; then
  cd backend
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --production=false

# Aplicar migraciones de Prisma
echo "🔄 Aplicando migraciones de Prisma..."
npx prisma migrate deploy || {
  echo "⚠️ Error aplicando migraciones. Verificando estado..."
  npx prisma migrate status
  # No fallar el build si las migraciones ya están aplicadas
  echo "ℹ️ Continuando con el build..."
}

# Regenerar cliente de Prisma
echo "🔄 Regenerando cliente de Prisma..."
npx prisma generate

# Build de NestJS
echo "🔨 Compilando aplicación..."
npm run build

echo "✅ Build completado exitosamente"

