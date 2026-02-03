#!/bin/bash

# Script de prueba para verificar configuración de Google OAuth
# Ejecutar desde la raíz del proyecto: bash amva-mobile/scripts/test-google-login.sh

echo "🧪 PRUEBA DE CONFIGURACIÓN DE GOOGLE OAUTH"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="https://amva.org.es"
PRIVACY_POLICY_URL="${API_URL}/privacy-policy"
TERMS_URL="${API_URL}/terms-of-service"
GOOGLE_AUTH_ENDPOINT="${API_URL}/api/auth/invitado/google/mobile"
CLIENT_ID="378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com"

echo "📋 Verificando configuración..."
echo ""

# 1. Verificar URLs públicas
echo "1️⃣ Verificando URLs públicas..."
echo ""

echo "   Privacy Policy: ${PRIVACY_POLICY_URL}"
PRIVACY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${PRIVACY_POLICY_URL}")
if [ "$PRIVACY_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ Privacy Policy accesible (HTTP ${PRIVACY_STATUS})${NC}"
else
    echo -e "   ${RED}❌ Privacy Policy no accesible (HTTP ${PRIVACY_STATUS})${NC}"
    echo -e "   ${YELLOW}⚠️  Esto es OBLIGATORIO para Google OAuth${NC}"
fi

echo ""
echo "   Terms of Service: ${TERMS_URL}"
TERMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${TERMS_URL}")
if [ "$TERMS_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ Terms of Service accesible (HTTP ${TERMS_STATUS})${NC}"
else
    echo -e "   ${YELLOW}⚠️  Terms of Service no accesible (HTTP ${TERMS_STATUS})${NC}"
    echo -e "   ${YELLOW}   (Recomendado pero no obligatorio)${NC}"
fi

echo ""

# 2. Verificar endpoint de Google Auth
echo "2️⃣ Verificando endpoint de Google Auth..."
echo "   Endpoint: ${GOOGLE_AUTH_ENDPOINT}"
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${GOOGLE_AUTH_ENDPOINT}" \
    -H "Content-Type: application/json" \
    -d '{"idToken":"test"}')
if [ "$AUTH_STATUS" = "400" ] || [ "$AUTH_STATUS" = "401" ]; then
    echo -e "   ${GREEN}✅ Endpoint responde (HTTP ${AUTH_STATUS} - esperado para token inválido)${NC}"
elif [ "$AUTH_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ Endpoint funciona correctamente${NC}"
else
    echo -e "   ${RED}❌ Endpoint no responde correctamente (HTTP ${AUTH_STATUS})${NC}"
fi

echo ""

# 3. Verificar Client ID
echo "3️⃣ Verificando Client ID..."
if [ -n "$CLIENT_ID" ] && [[ "$CLIENT_ID" == *".apps.googleusercontent.com" ]]; then
    echo -e "   ${GREEN}✅ Client ID configurado: ${CLIENT_ID:0:30}...${NC}"
else
    echo -e "   ${RED}❌ Client ID no configurado o inválido${NC}"
fi

echo ""

# 4. Verificar app.json
echo "4️⃣ Verificando app.json..."
if [ -f "amva-mobile/app.json" ]; then
    if grep -q "googleClientId" "amva-mobile/app.json"; then
        echo -e "   ${GREEN}✅ googleClientId encontrado en app.json${NC}"
    else
        echo -e "   ${RED}❌ googleClientId no encontrado en app.json${NC}"
    fi
else
    echo -e "   ${RED}❌ app.json no encontrado${NC}"
fi

echo ""
echo "=========================================="
echo "📝 RESUMEN"
echo "=========================================="
echo ""

if [ "$PRIVACY_STATUS" = "200" ] && [ "$AUTH_STATUS" != "000" ]; then
    echo -e "${GREEN}✅ Configuración básica correcta${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Verifica en Google Cloud Console que las URLs estén configuradas"
    echo "2. Espera 5-15 minutos después de guardar cambios"
    echo "3. Cierra completamente la app móvil"
    echo "4. Reinicia la app y prueba el login con Google"
else
    echo -e "${RED}❌ Hay problemas con la configuración${NC}"
    echo ""
    echo "Problemas encontrados:"
    if [ "$PRIVACY_STATUS" != "200" ]; then
        echo "- Privacy Policy no accesible (OBLIGATORIO)"
    fi
    if [ "$AUTH_STATUS" = "000" ]; then
        echo "- Endpoint de Google Auth no responde"
    fi
fi

echo ""
echo "Para más información, consulta:"
echo "- amva-mobile/SOLUCION_ERRORES_OAUTH.md"
echo "- amva-mobile/PASOS_FINALES_GOOGLE_OAUTH.md"

