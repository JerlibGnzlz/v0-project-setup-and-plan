#!/bin/bash

# Script de diagnóstico completo para Google Sign-In

echo "🔍 ========================================"
echo "🔍 DIAGNÓSTICO COMPLETO DE GOOGLE SIGN-IN"
echo "🔍 ========================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar app.json
echo "1️⃣ Verificando app.json..."
if [ -f "app.json" ]; then
    WEB_CLIENT_ID=$(grep -o '"googleClientId": "[^"]*"' app.json | cut -d'"' -f4)
    ANDROID_CLIENT_ID=$(grep -o '"googleAndroidClientId": "[^"]*"' app.json | cut -d'"' -f4)
    
    if [ -n "$WEB_CLIENT_ID" ]; then
        echo -e "${GREEN}✅ Web Client ID encontrado:${NC} $WEB_CLIENT_ID"
    else
        echo -e "${RED}❌ Web Client ID NO encontrado${NC}"
    fi
    
    if [ -n "$ANDROID_CLIENT_ID" ]; then
        echo -e "${GREEN}✅ Android Client ID encontrado:${NC} $ANDROID_CLIENT_ID"
    else
        echo -e "${RED}❌ Android Client ID NO encontrado${NC}"
    fi
    
    # Verificar que sean diferentes
    if [ "$WEB_CLIENT_ID" = "$ANDROID_CLIENT_ID" ]; then
        echo -e "${YELLOW}⚠️  Web Client ID y Android Client ID son iguales (deberían ser diferentes)${NC}"
    fi
else
    echo -e "${RED}❌ app.json no encontrado${NC}"
fi

echo ""

# 2. Información de configuración requerida
echo "2️⃣ Configuración requerida en Google Cloud Console:"
echo ""
echo -e "${YELLOW}Cliente Android:${NC}"
echo "   Client ID: 378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo "   Package name: org.vidaabundante.app"
echo "   SHA-1 requerido: BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"
echo ""

# 3. Verificar SHA-1
echo "3️⃣ Verificar SHA-1 en Google Cloud Console:"
echo ""
echo "   URL: https://console.cloud.google.com/apis/credentials?project=amva-digital"
echo "   Pasos:"
echo "   1. Busca 'AMVA Android Client'"
echo "   2. Haz clic en 'Edit'"
echo "   3. Verifica que el SHA-1 BC:0C:2C... esté en la lista"
echo "   4. Si no está, agrégalo y guarda"
echo ""

# 4. Tiempo de propagación
echo "4️⃣ Tiempo de propagación:"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC} Después de agregar el SHA-1, espera 15-30 minutos"
echo "   Los cambios en Google Cloud Console pueden tardar hasta 30 minutos"
echo ""

# 5. Verificar logs esperados
echo "5️⃣ Logs esperados en la app:"
echo ""
echo -e "${GREEN}✅ Logs correctos:${NC}"
echo "   🔍 Configurando con Android Client ID: 378853205278-c2e1..."
echo "   ✅ Google Sign-In configurado correctamente"
echo ""
echo -e "${RED}❌ Logs incorrectos:${NC}"
echo "   DEVELOPER_ERROR: El SHA-1 del keystore no está configurado"
echo "   (Significa que el SHA-1 no está agregado o no se propagó)"
echo ""

# 6. Pasos de solución
echo "6️⃣ Pasos para resolver:"
echo ""
echo "   1. Verifica que el SHA-1 esté agregado en Google Cloud Console"
echo "   2. Espera 15-30 minutos para propagación"
echo "   3. Reinicia la app completamente (ciérrala y ábrela)"
echo "   4. Verifica los logs (deben mostrar Android Client ID)"
echo "   5. Prueba el login con Google"
echo ""

# 7. URLs útiles
echo "7️⃣ URLs útiles:"
echo ""
echo "   Credentials: https://console.cloud.google.com/apis/credentials?project=amva-digital"
echo "   OAuth Consent: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital"
echo ""

echo -e "${GREEN}✅ Diagnóstico completado${NC}"
echo ""
echo "📖 Para más detalles, consulta: docs/VERIFICAR_CONFIGURACION_COMPLETA_GOOGLE_SIGNIN.md"

