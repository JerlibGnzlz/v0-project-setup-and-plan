#!/bin/bash

# Script para crear un nuevo APK usando EAS Build
# Uso: ./scripts/crear-apk.sh [preview|production]

PROFILE="${1:-preview}"

echo "📱 Creando nuevo APK..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "eas.json" ]; then
    echo "❌ Error: No se encontró eas.json"
    echo "   Ejecuta este script desde el directorio amva-mobile"
    exit 1
fi

echo "📋 Profile seleccionado: $PROFILE"
echo ""

if [ "$PROFILE" = "production" ]; then
    echo "⚠️  Nota: Build de producción (usa keystore de producción)"
    echo "   SHA-1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
elif [ "$PROFILE" = "preview" ]; then
    echo "ℹ️  Build de preview (más rápido, para pruebas)"
else
    echo "❌ Profile inválido. Usa 'preview' o 'production'"
    exit 1
fi

echo ""
echo "🚀 Iniciando build..."
echo ""

# Crear build
eas build --platform android --profile "$PROFILE" --type apk

echo ""
echo "✅ Build iniciado!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Espera 10-15 minutos para que termine el build"
echo "  2. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds"
echo "  3. Descarga el APK cuando esté listo"
echo "  4. Transfiere al teléfono e instala"
echo "  5. Prueba Google OAuth"
echo ""

