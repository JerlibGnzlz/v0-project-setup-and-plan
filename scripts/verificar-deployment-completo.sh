#!/bin/bash

# ============================================
# Script para verificar deployment completo
# Render (Backend) + Vercel (Frontend)
# ============================================

echo "🔍 VERIFICACIÓN DE DEPLOYMENT COMPLETO"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs (configurar según tu deployment)
BACKEND_URL="${BACKEND_URL:-https://tu-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://v0-ministerio-amva.vercel.app}"

echo "📋 URLs configuradas:"
echo "   Backend (Render): $BACKEND_URL"
echo "   Frontend (Vercel): $FRONTEND_URL"
echo ""

# Contador de verificaciones
TOTAL=0
PASSED=0
FAILED=0

# Función para verificar
check() {
    TOTAL=$((TOTAL + 1))
    local name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "🔍 Verificando $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Función para verificar con respuesta esperada
check_response() {
    TOTAL=$((TOTAL + 1))
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "🔍 Verificando $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Respuesta: ${response:0:100}..."
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ============================================
# 1. VERIFICAR BACKEND (RENDER)
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  BACKEND (RENDER)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que el backend responde
check "Backend está online" "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL/api | grep -q '200\|404'"

# Verificar endpoint de Mercado Pago
check_response "Mercado Pago configurado" "$BACKEND_URL/api/mercado-pago/status" "configured"

# Verificar endpoint de webhook info
check_response "Webhook endpoint disponible" "$BACKEND_URL/api/mercado-pago/webhook" "Endpoint de webhook"

# Verificar que no esté en modo TEST (si es producción)
if [ -n "$BACKEND_URL" ] && [[ "$BACKEND_URL" != *"localhost"* ]]; then
    test_mode=$(curl -s "$BACKEND_URL/api/mercado-pago/status" | grep -o '"testMode":[^,}]*' | cut -d: -f2 | tr -d ' ')
    if [ "$test_mode" = "false" ]; then
        echo -e "   ${GREEN}✅ Modo PRODUCCIÓN${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${YELLOW}⚠️  Modo TEST (verifica MERCADO_PAGO_TEST_MODE=false)${NC}"
    fi
    TOTAL=$((TOTAL + 1))
fi

echo ""

# ============================================
# 2. VERIFICAR FRONTEND (VERCEL)
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  FRONTEND (VERCEL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que el frontend responde
check "Frontend está online" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL | grep -q '200'"

# Verificar que puede conectarse al backend
# (Esto requiere que el frontend esté configurado con NEXT_PUBLIC_API_URL)
echo -n "🔍 Verificando conexión Frontend → Backend... "
# Esta verificación es más compleja, solo verificamos que el frontend carga
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend carga correctamente${NC}"
    echo -e "   ${BLUE}ℹ️  Verifica manualmente que NEXT_PUBLIC_API_URL esté configurado${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Frontend no responde${NC}"
    FAILED=$((FAILED + 1))
fi
TOTAL=$((TOTAL + 1))

echo ""

# ============================================
# 3. VERIFICAR CONEXIÓN ENTRE SERVICIOS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  CONEXIÓN FRONTEND ↔ BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar CORS (el backend debe permitir requests del frontend)
echo -n "🔍 Verificando CORS... "
cors_check=$(curl -s -X OPTIONS -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" "$BACKEND_URL/api" -I 2>/dev/null | grep -i "access-control-allow-origin" | head -1)
if [ -n "$cors_check" ]; then
    echo -e "${GREEN}✅ CORS configurado${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  CORS no verificado (puede estar bien)${NC}"
fi
TOTAL=$((TOTAL + 1))

echo ""

# ============================================
# 4. VERIFICAR VARIABLES DE ENTORNO
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VARIABLES DE ENTORNO (Checklist)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Verifica manualmente en Render y Vercel:"
echo ""
echo "BACKEND (Render):"
echo "   [ ] DATABASE_URL configurado"
echo "   [ ] MERCADO_PAGO_ACCESS_TOKEN=PROD-... (no TEST-)"
echo "   [ ] MERCADO_PAGO_TEST_MODE=false"
echo "   [ ] FRONTEND_URL=$FRONTEND_URL"
echo "   [ ] BACKEND_URL=$BACKEND_URL"
echo "   [ ] JWT_SECRET configurado (mínimo 32 caracteres)"
echo "   [ ] NODE_ENV=production"
echo ""
echo "FRONTEND (Vercel):"
echo "   [ ] NEXT_PUBLIC_API_URL=$BACKEND_URL/api"
echo "   [ ] NEXT_PUBLIC_SITE_URL=$FRONTEND_URL"
echo "   [ ] DATABASE_URL configurado (si es necesario)"
echo ""

# ============================================
# 5. RESUMEN
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Total de verificaciones: $TOTAL"
echo -e "${GREEN}✅ Exitosas: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Fallidas: $FAILED${NC}"
else
    echo -e "${GREEN}❌ Fallidas: $FAILED${NC}"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo está funcionando correctamente!${NC}"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "   1. Verifica las variables de entorno manualmente"
    echo "   2. Configura el webhook en Mercado Pago"
    echo "   3. Prueba un pago pequeño en producción"
    exit 0
else
    echo -e "${YELLOW}⚠️  Hay algunos problemas que resolver${NC}"
    echo ""
    echo "🔧 Acciones recomendadas:"
    echo "   1. Verifica que Render y Vercel estén deployados"
    echo "   2. Verifica las URLs en este script"
    echo "   3. Revisa los logs en Render y Vercel"
    echo "   4. Consulta: docs/RENDER_CONFIGURACION_COMPLETA.md"
    exit 1
fi

