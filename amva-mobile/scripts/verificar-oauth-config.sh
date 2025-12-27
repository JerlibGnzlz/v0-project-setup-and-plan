#!/bin/bash

# Script para verificar la configuración de Google OAuth
# Ayuda a diagnosticar el error "Access blocked Authorization Error"

echo "🔍 Verificando configuración de Google OAuth..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar app.json
echo "1️⃣ Verificando app.json..."
if [ -f "app.json" ]; then
    GOOGLE_CLIENT_ID=$(grep -o '"googleClientId": "[^"]*"' app.json | cut -d'"' -f4)
    SCHEME=$(grep -o '"scheme": "[^"]*"' app.json | cut -d'"' -f4)
    OWNER=$(grep -o '"owner": "[^"]*"' app.json | cut -d'"' -f4)
    SLUG=$(grep -o '"slug": "[^"]*"' app.json | cut -d'"' -f4)
    
    if [ -n "$GOOGLE_CLIENT_ID" ]; then
        echo -e "${GREEN}✅ Google Client ID encontrado:${NC} $GOOGLE_CLIENT_ID"
    else
        echo -e "${RED}❌ Google Client ID no encontrado en app.json${NC}"
    fi
    
    if [ -n "$SCHEME" ]; then
        echo -e "${GREEN}✅ Scheme encontrado:${NC} $SCHEME"
    else
        echo -e "${YELLOW}⚠️  Scheme no encontrado en app.json${NC}"
    fi
    
    if [ -n "$OWNER" ] && [ -n "$SLUG" ]; then
        echo -e "${GREEN}✅ Owner y Slug encontrados:${NC} $OWNER / $SLUG"
    fi
else
    echo -e "${RED}❌ app.json no encontrado${NC}"
fi

echo ""

# 2. Calcular Redirect URIs posibles
echo "2️⃣ Redirect URIs que debes agregar en Google Cloud Console:"
echo ""

if [ -n "$OWNER" ] && [ -n "$SLUG" ]; then
    EXPO_PROXY_URI="https://auth.expo.io/@${OWNER}/${SLUG}"
    echo -e "${YELLOW}📋 URI con proxy de Expo:${NC}"
    echo "   $EXPO_PROXY_URI"
    echo ""
fi

if [ -n "$SCHEME" ]; then
    SCHEME_URI="${SCHEME}://"
    echo -e "${YELLOW}📋 URI con scheme personalizado:${NC}"
    echo "   $SCHEME_URI"
    echo ""
fi

echo -e "${YELLOW}📋 URIs adicionales recomendados:${NC}"
echo "   exp://localhost:8081"
echo "   exp://192.168.*.*:8081"
echo ""

# 3. Instrucciones
echo "3️⃣ Pasos para resolver 'Access blocked Authorization Error':"
echo ""
echo "   1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital"
echo "   2. Busca el cliente OAuth de tipo 'Web application'"
echo "   3. Haz clic en el nombre del cliente para editarlo"
echo "   4. En 'Authorized redirect URIs', agrega los URIs mostrados arriba"
echo "   5. Haz clic en 'SAVE'"
echo "   6. Espera 5-10 minutos para propagación"
echo "   7. Reinicia la app completamente"
echo ""

# 4. Verificar OAuth Consent Screen
echo "4️⃣ Verificar OAuth Consent Screen:"
echo ""
echo "   1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital"
echo "   2. Verifica que 'Publishing status' sea 'Published' (no 'Testing')"
echo "   3. Si está en 'Testing', haz clic en 'PUBLISH APP'"
echo ""

# 5. Verificar scopes
echo "5️⃣ Verificar Scopes:"
echo ""
echo "   Los siguientes scopes deben estar agregados:"
echo "   - openid"
echo "   - profile"
echo "   - email"
echo ""

echo -e "${GREEN}✅ Verificación completada${NC}"
echo ""
echo "📖 Para más detalles, consulta: docs/SOLUCION_ACCESS_BLOCKED_OAUTH.md"

