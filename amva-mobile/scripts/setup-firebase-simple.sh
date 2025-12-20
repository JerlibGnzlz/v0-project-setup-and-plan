#!/bin/bash

# Script simplificado para configurar Firebase usando la API Key existente
# Útil si no encuentras el Server Key en Firebase Console

set -e

echo "🔥 Configuración Simplificada de Firebase"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que google-services.json existe
if [ ! -f "android/app/google-services.json" ]; then
    echo "❌ Error: google-services.json no encontrado"
    exit 1
fi

echo -e "${GREEN}✅ google-services.json encontrado${NC}"
echo ""

# Extraer API Key del google-services.json
API_KEY=$(cat android/app/google-services.json | grep -o '"current_key": "[^"]*' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
    echo "❌ No se pudo extraer API Key del google-services.json"
    exit 1
fi

echo -e "${BLUE}📋 Información encontrada:${NC}"
echo "   API Key: ${API_KEY:0:20}..."
echo "   Sender ID: 804089781668"
echo ""

echo -e "${YELLOW}⚠️  NOTA:${NC}"
echo "   Estamos usando la API Key del google-services.json"
echo "   Esto puede funcionar, pero es mejor crear una clave específica para Cloud Messaging"
echo ""

read -p "¿Continuar con esta API Key? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Por favor, crea una clave específica desde Google Cloud Console"
    exit 0
fi

# Verificar EAS CLI
if ! command -v eas-cli &> /dev/null; then
    echo "Instalando EAS CLI..."
    npm install -g eas-cli
fi

# Verificar login
if ! eas whoami &> /dev/null; then
    echo "Iniciando login en EAS..."
    eas login
fi

echo ""
echo -e "${BLUE}Configurando credenciales en EAS...${NC}"
echo ""
echo "Cuando EAS te pregunte:"
echo "  1. Platform: Android"
echo "  2. Workflow: production (o preview)"
echo "  3. Push Notifications Setup: Set up Firebase Cloud Messaging (FCM)"
echo "  4. Server Key: Usa esta API Key: $API_KEY"
echo "  5. Sender ID: 804089781668"
echo ""

read -p "¿Continuar? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    exit 0
fi

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

