#!/bin/bash

# Script para probar endpoints del backend en Render
# Uso: ./scripts/test-endpoints.sh [BACKEND_URL]
# Ejemplo: ./scripts/test-endpoints.sh https://ministerio-backend-wdbj.onrender.com

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Obtener URL del backend
BACKEND_URL="${1:-https://ministerio-backend-wdbj.onrender.com}"

echo ""
echo -e "${BLUE}🧪 Probando endpoints del backend${NC}"
echo -e "${BLUE}📍 URL: ${BACKEND_URL}${NC}"
echo ""

# Función para probar un endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4
  
  echo -e "${YELLOW}Testing: ${description}${NC}"
  echo -e "  ${BLUE}${method} ${endpoint}${NC}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}${endpoint}" || echo -e "\n000")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BACKEND_URL}${endpoint}" || echo -e "\n000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      "${BACKEND_URL}${endpoint}" || echo -e "\n000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✅ Status: ${http_code}${NC}"
    if [ -n "$body" ] && [ "$body" != "null" ]; then
      echo -e "  ${GREEN}Response: $(echo "$body" | head -c 200)${NC}"
    fi
  elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
    echo -e "  ${YELLOW}⚠️  Status: ${http_code} (Client Error - puede ser esperado)${NC}"
  elif [ "$http_code" -ge 500 ]; then
    echo -e "  ${RED}❌ Status: ${http_code} (Server Error)${NC}"
  else
    echo -e "  ${RED}❌ Error: No se pudo conectar${NC}"
  fi
  echo ""
}

# 1. Health Check / Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. HEALTH CHECK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/mercado-pago/status" "Mercado Pago Status"

# 2. Convenciones (públicas)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. CONVENCIONES (Públicas)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/convenciones" "Listar todas las convenciones"
test_endpoint "GET" "/api/convenciones/active" "Obtener convención activa"

# 3. Pastores (públicas)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. PASTORES (Públicas)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/pastores/landing" "Listar pastores para landing"
test_endpoint "GET" "/api/pastores/directiva" "Listar directiva"

# 4. Noticias (públicas)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. NOTICIAS (Públicas)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/noticias/publicadas" "Listar noticias publicadas"
test_endpoint "GET" "/api/noticias/destacadas" "Listar noticias destacadas"

# 5. Galería (pública)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. GALERÍA (Pública)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/galeria" "Listar imágenes de galería"

# 6. Autenticación (públicas - sin token)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. AUTENTICACIÓN (Públicas)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Nota: Estos endpoints requieren datos válidos${NC}"
echo ""

# 7. Endpoints que requieren autenticación (mostrar que están protegidos)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. ENDPOINTS PROTEGIDOS (Requieren JWT)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "GET" "/api/auth/me" "Obtener perfil (sin token - debe fallar)"
test_endpoint "GET" "/api/inscripciones" "Listar inscripciones (sin token - debe fallar)"
test_endpoint "GET" "/api/pagos" "Listar pagos (sin token - debe fallar)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Pruebas completadas${NC}"
echo ""
echo -e "${YELLOW}📝 NOTAS:${NC}"
echo -e "  • Los endpoints públicos deberían responder con 200 OK"
echo -e "  • Los endpoints protegidos deberían responder con 401 Unauthorized"
echo -e "  • Los 404 son normales para rutas que no existen"
echo ""
echo -e "${BLUE}🔗 URL del backend: ${BACKEND_URL}${NC}"
echo ""

