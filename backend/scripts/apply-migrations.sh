#!/bin/bash
# Script para aplicar migraciones en producción
# Uso: ./scripts/apply-migrations.sh

set -e

echo "🔄 Aplicando migraciones de Prisma..."
npx prisma migrate deploy

echo "✅ Migraciones aplicadas exitosamente"

echo "🔄 Regenerando cliente de Prisma..."
npx prisma generate

echo "✅ Cliente de Prisma regenerado"

