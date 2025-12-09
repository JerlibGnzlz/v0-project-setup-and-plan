#!/bin/bash

# ============================================
# Script para preparar commit de deployment
# ============================================
# Este script agrega solo los archivos importantes
# y deja los cambios menores de formato sin agregar

echo "📦 Preparando commit de deployment..."
echo ""

# Archivos nuevos importantes
echo "✅ Agregando archivos nuevos de documentación..."
git add docs/DEPLOYMENT_GUIDE.md
git add docs/DEPLOYMENT_QUICK_START.md
git add docs/MERCADO_PAGO_CREDENCIALES.md
git add docs/NEON_RENDER_INTEGRATION.md
git add env.production.example
git add scripts/verificar-deployment.sh

# Cambio importante en env.example.txt
echo "✅ Agregando cambio importante en backend/env.example.txt..."
git add backend/env.example.txt

echo ""
echo "📊 Estado actual:"
echo "=================="
git status --short | head -20
echo "..."

echo ""
echo "📝 Archivos agregados al staging:"
git diff --cached --name-only

echo ""
echo "⚠️  Archivos NO agregados (cambios menores de formato):"
git status --short | grep "^ M" | wc -l
echo "   (solo líneas en blanco agregadas por Prettier)"

echo ""
echo "✅ Listo para hacer commit!"
echo ""
echo "💡 Para hacer commit:"
echo "   git commit -m 'docs: Agregar guías de deployment y configuración de Mercado Pago'"
echo ""
echo "💡 Si quieres descartar los cambios menores de formato:"
echo "   git checkout -- ."
echo "   (Esto descartará TODOS los cambios no agregados)"

