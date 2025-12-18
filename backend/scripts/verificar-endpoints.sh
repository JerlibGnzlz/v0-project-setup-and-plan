#!/bin/bash

# Script para verificar que los endpoints estén disponibles
# Ejecutar después del despliegue en Render.com

API_URL="${1:-https://ministerio-backend-wdbj.onrender.com/api}"

echo "🔍 Verificando endpoints del backend..."
echo "📍 URL base: $API_URL"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar endpoint
check_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Verificando $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "400" ] || [ "$response" = "401" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    elif [ "$response" = "404" ]; then
        echo -e "${RED}❌ NO ENCONTRADO${NC} (HTTP $response)"
        return 1
    else
        echo -e "${YELLOW}⚠️  RESPUESTA INESPERADA${NC} (HTTP $response)"
        return 1
    fi
}

# Verificar endpoints públicos
echo "📋 Endpoints públicos:"
check_endpoint "GET" "/convenciones" "Convenciones"
check_endpoint "GET" "/convenciones/active" "Convención activa"
check_endpoint "GET" "/noticias/publicadas" "Noticias publicadas"
echo ""

# Verificar endpoints de autenticación de invitados
echo "📋 Endpoints de autenticación de invitados:"
check_endpoint "POST" "/auth/invitado/refresh" "Refresh token de invitado" '{"refreshToken":"test"}'
check_endpoint "POST" "/auth/invitado/login" "Login de invitado" '{"email":"test@test.com","password":"test"}'
check_endpoint "POST" "/auth/invitado/register" "Registro de invitado" '{"email":"test@test.com","password":"test","nombre":"Test","apellido":"User"}'
echo ""

# Verificar endpoints protegidos (deberían dar 401 sin token)
echo "📋 Endpoints protegidos (deberían dar 401 sin token):"
check_endpoint "GET" "/inscripciones/my" "Mis inscripciones"
check_endpoint "GET" "/credenciales-ministeriales/mis-credenciales" "Mis credenciales ministeriales"
check_endpoint "GET" "/credenciales-capellania/mis-credenciales" "Mis credenciales de capellanía"
echo ""

echo "✅ Verificación completada"
echo ""
echo "💡 Nota: Los endpoints protegidos deberían dar 401 sin token (esto es correcto)"
echo "💡 Si algún endpoint da 404, significa que no está desplegado en producción"

