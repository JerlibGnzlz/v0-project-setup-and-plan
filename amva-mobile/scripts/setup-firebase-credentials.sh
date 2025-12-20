#!/bin/bash

# Script para configurar credenciales de Firebase en EAS
# Ejecuta este script DESPUÉS de haber colocado google-services.json

set -e

echo "🔥 Configuración de Credenciales de Firebase en EAS"
echo "===================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que google-services.json existe
if [ ! -f "android/app/google-services.json" ]; then
    echo -e "${RED}❌ Error: google-services.json no encontrado${NC}"
    echo ""
    echo "Por favor:"
    echo "1. Descarga google-services.json de Firebase Console"
    echo "2. Colócalo en: android/app/google-services.json"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ google-services.json encontrado${NC}"
echo ""

# Verificar EAS CLI
if ! command -v eas-cli &> /dev/null; then
    echo -e "${RED}❌ EAS CLI no está instalado${NC}"
    echo ""
    echo "Instalando EAS CLI..."
    npm install -g eas-cli
fi

echo -e "${GREEN}✅ EAS CLI disponible${NC}"
echo ""

# Verificar login en EAS
echo -e "${BLUE}Verificando login en EAS...${NC}"
if eas whoami &> /dev/null; then
    echo -e "${GREEN}✅ Ya estás logueado en EAS${NC}"
    eas whoami
else
    echo -e "${YELLOW}⚠️  No estás logueado en EAS${NC}"
    echo ""
    echo "Iniciando login..."
    eas login
fi

echo ""
echo -e "${BLUE}📋 Información que necesitarás de Firebase Console:${NC}"
echo ""
echo "1. Ve a Firebase Console → Tu proyecto → Configuración (⚙️)"
echo "2. Ve a la pestaña 'Cloud Messaging'"
echo "3. Necesitarás:"
echo "   - Server key (o Cloud Messaging API key)"
echo "   - Sender ID (Project number)"
echo ""

read -p "¿Tienes esta información lista? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo ""
    echo "Por favor, obtén la información de Firebase Console primero."
    echo "Luego ejecuta este script nuevamente."
    exit 0
fi

echo ""
echo -e "${BLUE}Iniciando configuración de credenciales en EAS...${NC}"
echo ""
echo "Sigue las instrucciones en pantalla."
echo "Cuando EAS te pregunte, proporciona:"
echo "  - Platform: Android"
echo "  - Workflow: production (o preview para testing)"
echo "  - Push Notifications Setup: Set up Firebase Cloud Messaging (FCM)"
echo ""

# Ejecutar eas credentials
eas credentials

echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Rebuild la app: eas build --platform android --profile production"
echo "2. Instalar en dispositivo físico"
echo "3. Probar notificaciones push"
echo ""

