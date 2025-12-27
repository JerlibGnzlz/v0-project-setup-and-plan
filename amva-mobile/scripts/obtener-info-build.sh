#!/bin/bash

# Script para obtener información del SHA-1 de un build de EAS
# Uso: ./scripts/obtener-info-build.sh [BUILD_ID]

BUILD_ID="${1:-509eaa2d-285d-474f-9a8a-c2d85488dc21}"

echo "🔍 Obteniendo información del build: $BUILD_ID"
echo ""

# Verificar si eas CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI no está instalado"
    echo "   Instala con: npm install -g eas-cli"
    exit 1
fi

# Verificar si está autenticado
if ! eas whoami &> /dev/null; then
    echo "❌ No estás autenticado en EAS"
    echo "   Autentica con: eas login"
    exit 1
fi

echo "📋 Información del build:"
echo ""

# Obtener información del build usando eas build:view
echo "Ejecutando: eas build:view $BUILD_ID"
echo ""

eas build:view "$BUILD_ID" --json 2>/dev/null || {
    echo "⚠️  No se pudo obtener información en formato JSON"
    echo "   Intentando obtener información básica..."
    echo ""
    eas build:view "$BUILD_ID"
    echo ""
    echo "💡 Para obtener el SHA-1 específico:"
    echo "   1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/$BUILD_ID"
    echo "   2. Busca 'Signing Key', 'Certificate', o 'SHA-1'"
    echo "   3. O usa: eas credentials (selecciona Android > production > View credentials)"
    exit 0
}

echo ""
echo "✅ Si no aparece el SHA-1 aquí, usa:"
echo "   eas credentials"
echo "   - Selecciona: Android"
echo "   - Selecciona: production (o el profile usado)"
echo "   - Selecciona: View credentials"
echo ""

