#!/bin/bash

# Script para generar logos más pequeños desde el logo original
# Requiere ImageMagick: sudo apt-get install imagemagick

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS_DIR="$PROJECT_ROOT/assets/images"

echo "🎨 Generador de Logos Pequeños para AMVA Móvil"
echo "================================================"
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

# Hacer backup de los logos actuales
echo "💾 Creando backup de logos actuales..."
if [ -f "$ASSETS_DIR/icon.png" ]; then
    cp "$ASSETS_DIR/icon.png" "$BACKUP_DIR/icon_${TIMESTAMP}.png"
fi
if [ -f "$ASSETS_DIR/splash-logo.png" ]; then
    cp "$ASSETS_DIR/splash-logo.png" "$BACKUP_DIR/splash-logo_${TIMESTAMP}.png"
fi
if [ -f "$ASSETS_DIR/adaptive-icon.png" ]; then
    cp "$ASSETS_DIR/adaptive-icon.png" "$BACKUP_DIR/adaptive-icon_${TIMESTAMP}.png"
fi

echo "🔧 Generando logos más pequeños..."
echo ""

# Tamaños más pequeños pero manteniendo calidad
# Icono: 512x512 (más pequeño que 1024x1024)
# Splash: 512x512 (más pequeño que 1024x1024)
# Adaptive icon: 512x512 (más pequeño que 1024x1024)

# 1. Icono de app (512x512, logo centrado con 10% padding)
echo "1️⃣  Generando icon.png (512x512, 10% padding)..."
convert "$LOGO_ORIGINAL" \
    -resize 410x410 \
    -gravity center \
    -extent 512x512 \
    -background transparent \
    "$ASSETS_DIR/icon.png"
echo "   ✅ Creado: $ASSETS_DIR/icon.png"

# 2. Splash screen (512x512, logo completo)
echo "2️⃣  Generando splash-logo.png (512x512, logo completo)..."
convert "$LOGO_ORIGINAL" \
    -resize 512x512 \
    -gravity center \
    -background transparent \
    "$ASSETS_DIR/splash-logo.png"
echo "   ✅ Creado: $ASSETS_DIR/splash-logo.png"

# 3. Adaptive icon (512x512, logo centrado con 20% padding)
echo "3️⃣  Generando adaptive-icon.png (512x512, 20% padding)..."
convert "$LOGO_ORIGINAL" \
    -resize 307x307 \
    -gravity center \
    -extent 512x512 \
    -background transparent \
    "$ASSETS_DIR/adaptive-icon.png"
echo "   ✅ Creado: $ASSETS_DIR/adaptive-icon.png"

echo ""
echo "✅ Logos pequeños generados exitosamente!"
echo ""
echo "📋 Archivos creados:"
echo "   - icon.png (512x512, para icono de app)"
echo "   - splash-logo.png (512x512, para splash screen)"
echo "   - adaptive-icon.png (512x512, para adaptive icon Android)"
echo ""
echo "⚠️  NOTA:"
echo "   - Los logos ahora son 512x512 (más pequeños que antes)"
echo "   - Mantienen la misma calidad pero ocupan menos espacio"
echo "   - El SHA-1 se mantiene igual: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Verifica que los logos se vean bien"
echo "   2. Regenera archivos nativos: npx expo prebuild"
echo "   3. Compila: eas build --platform android --profile production"
echo "   4. El nuevo APK tendrá logos más pequeños y Google Login funcionando"

