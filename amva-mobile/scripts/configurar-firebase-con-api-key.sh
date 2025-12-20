#!/bin/bash

# Script para configurar Firebase con la API Key proporcionada

set -e

echo "🔥 Configurando Firebase con tu API Key"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# API Key proporcionada por el usuario
API_KEY="AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA"
SENDER_ID="804089781668"

echo -e "${BLUE}📋 Credenciales a configurar:${NC}"
echo "   API Key (Server Key): ${API_KEY:0:20}..."
echo "   Sender ID: $SENDER_ID"
echo ""

# Verificar EAS CLI
if ! command -v eas-cli &> /dev/null; then
    echo "Instalando EAS CLI..."
    npm install -g eas-cli
fi

echo -e "${GREEN}✅ EAS CLI disponible${NC}"
echo ""

# Verificar login
echo -e "${BLUE}Verificando login en EAS...${NC}"
if eas whoami &> /dev/null; then
    echo -e "${GREEN}✅ Ya estás logueado en EAS${NC}"
    eas whoami
else
    echo -e "${YELLOW}⚠️  No estás logueado en EAS${NC}"
    echo "Iniciando login..."
    eas login
fi

echo ""
echo -e "${BLUE}📋 Instrucciones para configurar credenciales:${NC}"
echo ""
echo "EAS te hará varias preguntas. Responde así:"
echo ""
echo "1. Platform:"
echo "   → Selecciona: Android"
echo ""
echo "2. Workflow:"
echo "   → Selecciona: production (o preview si quieres probar primero)"
echo ""
echo "3. What would you like to do?:"
echo "   → Selecciona: Set up Push Notifications credentials"
echo ""
echo "4. Push Notifications Setup:"
echo "   → Selecciona: Set up Firebase Cloud Messaging (FCM)"
echo ""
echo "5. Server Key:"
echo "   → Pega esta API Key: $API_KEY"
echo ""
echo "6. Sender ID:"
echo "   → Ingresa: $SENDER_ID"
echo ""
echo "7. Google Services JSON:"
echo "   → El script puede detectarlo automáticamente"
echo "   → O proporciona la ruta: android/app/google-services.json"
echo ""

read -p "¿Listo para continuar? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo -e "${BLUE}Iniciando configuración de credenciales...${NC}"
echo ""
echo "⚠️  IMPORTANTE: Cuando EAS te pregunte por el Server Key, usa esta API Key:"
echo -e "${GREEN}$API_KEY${NC}"
echo ""

# Ejecutar eas credentials
eas credentials

echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Rebuild la app: eas build --platform android --profile production"
echo "2. Instalar en dispositivo físico Android"
echo "3. Probar notificaciones push (crear una inscripción)"
echo ""
echo "🔍 Para verificar que funcionó:"
echo "   - Inicia sesión en la app como invitado"
echo "   - Verifica en logs: '✅ Token registrado en el backend para invitado'"
echo "   - Crea una inscripción y verifica que recibes la notificación push"
echo ""

