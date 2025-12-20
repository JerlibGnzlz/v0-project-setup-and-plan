#!/bin/bash

# Script de ayuda para configurar Firebase
# Este script NO configura Firebase automáticamente, solo te guía

set -e

echo "🔥 Configuración de Firebase para AMVA Móvil"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 PASO 1: Verificar Prerrequisitos${NC}"
echo ""

# Verificar EAS CLI
if command -v eas-cli &> /dev/null; then
    echo -e "${GREEN}✅ EAS CLI está instalado${NC}"
    eas-cli --version
else
    echo -e "${YELLOW}⚠️  EAS CLI no está instalado${NC}"
    echo ""
    echo "Instalando EAS CLI..."
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI instalado${NC}"
fi

echo ""
echo -e "${BLUE}📋 PASO 2: Verificar Configuración Actual${NC}"
echo ""

# Verificar app.json
if grep -q "googleServicesFile" app.json; then
    echo -e "${GREEN}✅ googleServicesFile configurado en app.json${NC}"
else
    echo -e "${YELLOW}⚠️  googleServicesFile NO está en app.json${NC}"
fi

# Verificar si existe google-services.json
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✅ google-services.json existe en android/app/${NC}"
    
    # Mostrar información del archivo
    echo ""
    echo "📄 Información del archivo:"
    cat android/app/google-services.json | grep -E "(project_id|package_name)" | head -2
else
    echo -e "${YELLOW}⚠️  google-services.json NO existe en android/app/${NC}"
    echo ""
    echo "Necesitas:"
    echo "1. Crear proyecto en Firebase Console"
    echo "2. Agregar app Android"
    echo "3. Descargar google-services.json"
    echo "4. Colocarlo en android/app/google-services.json"
fi

echo ""
echo -e "${BLUE}📋 PASO 3: Próximos Pasos Manuales${NC}"
echo ""
echo "1. Ve a Firebase Console: https://console.firebase.google.com/"
echo "2. Crea un nuevo proyecto (o selecciona uno existente)"
echo "3. Agrega app Android con package name: org.vidaabundante.app"
echo "4. Descarga google-services.json"
echo "5. Colócalo en: android/app/google-services.json"
echo ""
echo "Luego ejecuta:"
echo "  ./scripts/setup-firebase-credentials.sh"
echo ""

