#!/bin/bash

# ============================================
# Script de Verificación de Callback URLs
# Google OAuth - Ministerio AMVA
# ============================================

echo "🔍 Verificando configuración de Callback URLs para Google OAuth"
echo "================================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si existe el archivo .env
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ No se encontró el archivo .env${NC}"
    echo "   Por favor, crea el archivo .env basándote en env.example.txt"
    exit 1
fi

# Leer variables de entorno
BACKEND_URL=$(grep "^BACKEND_URL=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
API_URL=$(grep "^API_URL=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
GOOGLE_CALLBACK_URL=$(grep "^GOOGLE_CALLBACK_URL=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
NODE_ENV=$(grep "^NODE_ENV=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

# Determinar el backend URL
if [ -n "$BACKEND_URL" ]; then
    BACKEND_BASE_URL="$BACKEND_URL"
elif [ -n "$API_URL" ]; then
    BACKEND_BASE_URL="$API_URL"
else
    BACKEND_BASE_URL="http://localhost:4000"
    echo -e "${YELLOW}⚠️  BACKEND_URL y API_URL no configurados, usando valor por defecto: $BACKEND_BASE_URL${NC}"
fi

# Determinar el callback path
if [ -z "$GOOGLE_CALLBACK_URL" ]; then
    CALLBACK_PATH="/api/auth/invitado/google/callback"
    echo -e "${YELLOW}⚠️  GOOGLE_CALLBACK_URL no configurado, usando valor por defecto: $CALLBACK_PATH${NC}"
else
    CALLBACK_PATH="$GOOGLE_CALLBACK_URL"
fi

# Construir la URL completa de callback
if [[ "$CALLBACK_PATH" == http* ]]; then
    # Si ya es una URL completa, usarla tal cual
    CALLBACK_URL_FULL="$CALLBACK_PATH"
else
    # Si es un path, combinarlo con el backend URL
    # Asegurarse de que no haya doble slash
    BACKEND_BASE_URL=$(echo "$BACKEND_BASE_URL" | sed 's|/$||')
    CALLBACK_PATH=$(echo "$CALLBACK_PATH" | sed 's|^/||')
    CALLBACK_URL_FULL="${BACKEND_BASE_URL}/${CALLBACK_PATH}"
fi

echo -e "${BLUE}📋 Configuración Actual:${NC}"
echo "   BACKEND_URL/API_URL: $BACKEND_BASE_URL"
echo "   GOOGLE_CALLBACK_URL: $CALLBACK_PATH"
echo "   NODE_ENV: ${NODE_ENV:-development}"
echo ""
echo -e "${GREEN}✅ URL de Callback Calculada:${NC}"
echo "   $CALLBACK_URL_FULL"
echo ""

# Determinar URLs según el entorno
echo -e "${BLUE}📝 URLs que DEBEN estar configuradas en Google Cloud Console:${NC}"
echo ""

# URL de desarrollo
DEV_CALLBACK="http://localhost:4000/api/auth/invitado/google/callback"
echo -e "${YELLOW}🔧 Desarrollo (si trabajas localmente):${NC}"
echo "   $DEV_CALLBACK"
echo ""

# URL de producción (si está configurada)
if [[ "$BACKEND_BASE_URL" == https://* ]] || [[ "$NODE_ENV" == "production" ]]; then
    PROD_CALLBACK="$CALLBACK_URL_FULL"
    echo -e "${GREEN}🚀 Producción:${NC}"
    echo "   $PROD_CALLBACK"
    echo ""
else
    echo -e "${YELLOW}⚠️  URL de Producción no detectada${NC}"
    echo "   Si estás en producción, asegúrate de configurar BACKEND_URL con HTTPS"
    echo ""
fi

# Verificar si la URL calculada coincide con alguna de las esperadas
echo -e "${BLUE}🔍 Verificación:${NC}"
echo ""

# Verificar formato
if [[ "$CALLBACK_URL_FULL" == http://* ]] || [[ "$CALLBACK_URL_FULL" == https://* ]]; then
    echo -e "${GREEN}✅ Formato de URL válido${NC}"
else
    echo -e "${RED}❌ Formato de URL inválido${NC}"
    echo "   La URL debe comenzar con http:// o https://"
fi

# Verificar que termine con /callback
if [[ "$CALLBACK_URL_FULL" == */callback ]]; then
    echo -e "${GREEN}✅ La URL termina correctamente con /callback${NC}"
else
    echo -e "${YELLOW}⚠️  La URL no termina con /callback${NC}"
    echo "   Asegúrate de que el path sea: /api/auth/invitado/google/callback"
fi

echo ""
echo -e "${BLUE}📖 Instrucciones para Google Cloud Console:${NC}"
echo ""
echo "1. Ve a: https://console.cloud.google.com/"
echo "2. Selecciona tu proyecto"
echo "3. Ve a: APIs & Services > Credentials"
echo "4. Encuentra tu OAuth 2.0 Client ID (Web application)"
echo "5. Haz clic en editar (ícono de lápiz)"
echo "6. En 'Authorized redirect URIs', agrega las siguientes URLs:"
echo ""
echo -e "${GREEN}   Para Desarrollo:${NC}"
echo "   $DEV_CALLBACK"
echo ""
if [[ "$BACKEND_BASE_URL" == https://* ]] || [[ "$NODE_ENV" == "production" ]]; then
    echo -e "${GREEN}   Para Producción:${NC}"
    echo "   $CALLBACK_URL_FULL"
    echo ""
fi
echo "7. Haz clic en 'Save'"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   • Las URLs deben coincidir EXACTAMENTE (incluyendo http/https, puerto, path)"
echo "   • No agregues trailing slash (/) al final"
echo "   • En producción, DEBES usar HTTPS"
echo "   • Puedes agregar múltiples URLs (una por línea)"
echo ""

# Verificar si hay diferencias
if [[ "$CALLBACK_URL_FULL" != "$DEV_CALLBACK" ]] && [[ "$NODE_ENV" != "production" ]]; then
    echo -e "${YELLOW}💡 Nota:${NC}"
    echo "   Tu URL calculada ($CALLBACK_URL_FULL) es diferente a la de desarrollo."
    echo "   Asegúrate de agregar AMBAS URLs en Google Cloud Console."
    echo ""
fi

echo -e "${GREEN}✅ Verificación completada${NC}"
echo ""

















