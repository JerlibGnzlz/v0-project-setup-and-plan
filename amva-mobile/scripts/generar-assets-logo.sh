#!/bin/bash

# Script para generar los assets de logo correctos desde el logo original
# Requiere ImageMagick: sudo apt-get install imagemagick

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS_DIR="$PROJECT_ROOT/assets/images"

echo "🎨 Generador de Assets de Logo para AMVA Móvil"
echo "=============================================="
echo ""

# Verificar que ImageMagick esté instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick no está instalado."
    echo "   Instala con: sudo apt-get install imagemagick"
    exit 1
fi

# Verificar que existe el logo original
LOGO_ORIGINAL="$ASSETS_DIR/amvamovil.png"
if [ ! -f "$LOGO_ORIGINAL" ]; then
    echo "❌ No se encuentra el logo original: $LOGO_ORIGINAL"
    echo "   Asegúrate de que el archivo existe."
    exit 1
fi

echo "📁 Directorio de assets: $ASSETS_DIR"
echo "🖼️  Logo original: $LOGO_ORIGINAL"
echo ""

# Crear directorio de backups
BACKUP_DIR="$ASSETS_DIR/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Hacer backup del logo original si no existe backup
if [ ! -f "$BACKUP_DIR/amvamovil_${TIMESTAMP}.png" ]; then
    echo "💾 Creando backup del logo original..."
    cp "$LOGO_ORIGINAL" "$BACKUP_DIR/amvamovil_${TIMESTAMP}.png"
fi

echo "🔧 Generando assets..."
echo ""

# 1. Icono de app (1024x1024, logo centrado con 10% padding)
echo "1️⃣  Generando icon.png (1024x1024, 10% padding)..."
convert "$LOGO_ORIGINAL" \
    -resize 820x820 \
    -gravity center \
    -extent 1024x1024 \
    -background transparent \
    "$ASSETS_DIR/icon.png"
echo "   ✅ Creado: $ASSETS_DIR/icon.png"

# 2. Splash screen (1024x1024, logo completo)
echo "2️⃣  Generando splash-logo.png (1024x1024, logo completo)..."
convert "$LOGO_ORIGINAL" \
    -resize 1024x1024 \
    -gravity center \
    -background transparent \
    "$ASSETS_DIR/splash-logo.png"
echo "   ✅ Creado: $ASSETS_DIR/splash-logo.png"

# 3. Adaptive icon (1024x1024, logo centrado con 20% padding)
echo "3️⃣  Generando adaptive-icon.png (1024x1024, 20% padding)..."
convert "$LOGO_ORIGINAL" \
    -resize 614x614 \
    -gravity center \
    -extent 1024x1024 \
    -background transparent \
    "$ASSETS_DIR/adaptive-icon.png"
echo "   ✅ Creado: $ASSETS_DIR/adaptive-icon.png"

echo ""
echo "✅ Assets generados exitosamente!"
echo ""
echo "📋 Archivos creados:"
echo "   - icon.png (1024x1024, para icono de app)"
echo "   - splash-logo.png (1024x1024, para splash screen)"
echo "   - adaptive-icon.png (1024x1024, para adaptive icon Android)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Verifica que los logos se vean bien centrados"
echo "   - Si el logo original tiene texto 'Movil', considera crear versiones sin texto para iconos"
echo "   - El splash-logo.png puede tener el texto completo"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Revisa los archivos generados en $ASSETS_DIR"
echo "   2. Si es necesario, ajusta manualmente con un editor de imágenes"
echo "   3. Actualiza app.json con las nuevas rutas (ya está preparado)"
echo "   4. Ejecuta: npx expo prebuild --clean"
echo "   5. Compila: eas build --platform android --profile production"

