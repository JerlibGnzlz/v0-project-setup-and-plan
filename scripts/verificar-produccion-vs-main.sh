#!/bin/bash
# Script para ejecutar en el servidor de Digital Ocean (SSH)
# Compara el estado de producción con origin/main
# Uso: ssh tu-servidor "cd /var/www/amva-production && bash -s" < scripts/verificar-produccion-vs-main.sh
# O: ssh tu-servidor "cd /var/www/amva-production && bash scripts/verificar-produccion-vs-main.sh"

set -e

APP_DIR="${1:-/var/www/amva-production}"
cd "$APP_DIR" 2>/dev/null || { echo "❌ Directorio $APP_DIR no existe"; exit 1; }

echo "=========================================="
echo "📋 Verificación: Producción vs main"
echo "=========================================="
echo "📁 Directorio: $(pwd)"
echo ""

echo "1️⃣ Rama actual:"
git branch --show-current
echo ""

echo "2️⃣ Último commit en producción:"
git log -1 --oneline
echo ""

echo "3️⃣ Estado de Git (cambios locales):"
git status --short
if [ -z "$(git status --short)" ]; then
  echo "   ✅ Sin cambios locales - coincide con el repo"
else
  echo "   ⚠️ Hay cambios locales no commiteados"
  echo ""
  echo "   Archivos modificados:"
  git diff --name-only
fi
echo ""

echo "4️⃣ Comparando con origin/main (remoto):"
git fetch origin 2>/dev/null || true
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "   ✅ Producción = origin/main (sincronizado)"
else
  echo "   📌 Producción: $LOCAL"
  echo "   📌 origin/main: $REMOTE"
  echo ""
  echo "   Commits en producción que NO están en origin/main:"
  git log origin/main..HEAD --oneline 2>/dev/null || echo "   (ninguno)"
  echo ""
  echo "   Commits en origin/main que NO están en producción:"
  git log HEAD..origin/main --oneline 2>/dev/null || echo "   (ninguno)"
fi
echo ""

echo "5️⃣ Última fecha de deploy (modificación de archivos):"
ls -la .next/BUILD_ID 2>/dev/null && echo "   Frontend build: $(cat .next/BUILD_ID 2>/dev/null)" || echo "   (no encontrado)"
ls -la backend/dist 2>/dev/null | head -3 || echo "   (no encontrado)"
echo ""

echo "=========================================="
echo "✅ Verificación completada"
echo "=========================================="
