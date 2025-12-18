#!/bin/bash
# Script de build para producción (Render.com)
# Este script se ejecuta automáticamente durante el build en Render.com

set -e

echo "🚀 Iniciando build de producción..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --production=false

# Aplicar migraciones de Prisma
echo "🔄 Aplicando migraciones de Prisma..."
npx prisma migrate deploy || {
  echo "⚠️ Error aplicando migraciones. Verificando estado..."
  npx prisma migrate status
  exit 1
}

# Regenerar cliente de Prisma
echo "🔄 Regenerando cliente de Prisma..."
npx prisma generate

# Build de NestJS
echo "🔨 Compilando aplicación..."
npm run build

echo "✅ Build completado exitosamente"

