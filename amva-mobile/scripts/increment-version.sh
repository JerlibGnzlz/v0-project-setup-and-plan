#!/bin/bash

# Script para incrementar versiones de la app
# Uso: ./scripts/increment-version.sh [major|minor|patch|build]

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_JSON="app.json"
BUILD_GRADLE="android/app/build.gradle"

# Función para obtener versión actual
get_current_version() {
    local version=$(grep -o '"version": "[^"]*"' "$APP_JSON" | cut -d'"' -f4)
    echo "$version"
}

# Función para obtener versionCode actual
get_current_version_code() {
    local version_code=$(grep -o '"versionCode": [0-9]*' "$APP_JSON" | grep -o '[0-9]*')
    echo "$version_code"
}

# Función para incrementar versión semántica
increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -ra ADDR <<< "$version"
    local major=${ADDR[0]}
    local minor=${ADDR[1]}
    local patch=${ADDR[2]}
    
    case $type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            echo "Tipo inválido. Usa: major, minor, o patch"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Función para incrementar versionCode
increment_version_code() {
    local current=$1
    echo $((current + 1))
}

# Obtener versión actual
CURRENT_VERSION=$(get_current_version)
CURRENT_VERSION_CODE=$(get_current_version_code)

echo "📱 Incrementador de Versión - AMVA Móvil"
echo "=========================================="
echo ""
echo "Versión actual: $CURRENT_VERSION (versionCode: $CURRENT_VERSION_CODE)"
echo ""

# Determinar tipo de incremento
if [ -z "$1" ]; then
    echo "¿Qué versión deseas incrementar?"
    echo "  1) Major (1.0.0 -> 2.0.0) - Cambios incompatibles"
    echo "  2) Minor (1.0.0 -> 1.1.0) - Nuevas funcionalidades"
    echo "  3) Patch (1.0.0 -> 1.0.1) - Correcciones de bugs"
    echo "  4) Build (solo versionCode) - Build interno"
    echo ""
    read -p "Selecciona una opción [1-4]: " choice
    
    case $choice in
        1) TYPE="major" ;;
        2) TYPE="minor" ;;
        3) TYPE="patch" ;;
        4) TYPE="build" ;;
        *)
            echo "❌ Opción inválida"
            exit 1
            ;;
    esac
else
    TYPE=$1
fi

# Incrementar versión
if [ "$TYPE" = "build" ]; then
    NEW_VERSION_CODE=$(increment_version_code "$CURRENT_VERSION_CODE")
    NEW_VERSION=$CURRENT_VERSION
    echo "🔨 Incrementando versionCode: $CURRENT_VERSION_CODE -> $NEW_VERSION_CODE"
else
    NEW_VERSION=$(increment_version "$CURRENT_VERSION" "$TYPE")
    NEW_VERSION_CODE=$(increment_version_code "$CURRENT_VERSION_CODE")
    echo "📦 Incrementando versión: $CURRENT_VERSION -> $NEW_VERSION"
    echo "🔨 Incrementando versionCode: $CURRENT_VERSION_CODE -> $NEW_VERSION_CODE"
fi

echo ""
read -p "¿Confirmar cambios? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

# Actualizar app.json
echo ""
echo "📝 Actualizando app.json..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$APP_JSON"
    sed -i '' "s/\"versionCode\": $CURRENT_VERSION_CODE/\"versionCode\": $NEW_VERSION_CODE/" "$APP_JSON"
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$APP_JSON"
    sed -i "s/\"versionCode\": $CURRENT_VERSION_CODE/\"versionCode\": $NEW_VERSION_CODE/" "$APP_JSON"
fi

# Actualizar build.gradle
echo "📝 Actualizando build.gradle..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$BUILD_GRADLE"
    sed -i '' "s/versionName \"$CURRENT_VERSION\"/versionName \"$NEW_VERSION\"/" "$BUILD_GRADLE"
else
    # Linux
    sed -i "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" "$BUILD_GRADLE"
    sed -i "s/versionName \"$CURRENT_VERSION\"/versionName \"$NEW_VERSION\"/" "$BUILD_GRADLE"
fi

echo ""
echo -e "${GREEN}✅ Versión actualizada exitosamente${NC}"
echo ""
echo "Nueva versión: $NEW_VERSION (versionCode: $NEW_VERSION_CODE)"
echo ""
echo "📋 Archivos modificados:"
echo "   - $APP_JSON"
echo "   - $BUILD_GRADLE"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Revisar los cambios: git diff"
echo "   2. Commit: git add -A && git commit -m \"chore: Bump version to $NEW_VERSION\""
echo "   3. Crear build: eas build --platform android --profile production"

