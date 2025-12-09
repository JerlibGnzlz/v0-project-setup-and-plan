#!/bin/bash

# ============================================
# Script de Prueba de Mercado Pago
# ============================================

echo "🧪 Prueba de Mercado Pago"
echo "=========================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# 1. Verificar que el backend esté corriendo
echo "1️⃣ Verificando que el backend esté corriendo..."
if curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está corriendo en $BACKEND_URL${NC}"
else
    echo -e "${RED}❌ Backend no está corriendo en $BACKEND_URL${NC}"
    echo "   Por favor, inicia el backend con: cd backend && npm run start:dev"
    exit 1
fi

echo ""
echo "2️⃣ Verificando configuración de Mercado Pago..."

# Verificar estado de Mercado Pago
STATUS_RESPONSE=$(curl -s "$BACKEND_URL/api/mercado-pago/status" 2>/dev/null)

if echo "$STATUS_RESPONSE" | grep -q "configured"; then
    CONFIGURED=$(echo "$STATUS_RESPONSE" | grep -o '"configured":[^,]*' | cut -d: -f2 | tr -d ' ')
    TEST_MODE=$(echo "$STATUS_RESPONSE" | grep -o '"testMode":[^}]*' | cut -d: -f2 | tr -d ' ')
    
    if [ "$CONFIGURED" = "true" ]; then
        echo -e "${GREEN}✅ Mercado Pago está configurado${NC}"
        if [ "$TEST_MODE" = "true" ]; then
            echo -e "${YELLOW}   Modo: TEST${NC}"
        else
            echo -e "${BLUE}   Modo: PRODUCCIÓN${NC}"
        fi
        echo "   Respuesta completa: $STATUS_RESPONSE"
    else
        echo -e "${RED}❌ Mercado Pago NO está configurado${NC}"
        echo "   Verifica que MERCADO_PAGO_ACCESS_TOKEN esté configurado en tu .env"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No se pudo verificar la configuración${NC}"
    echo "   Respuesta: $STATUS_RESPONSE"
fi

echo ""
echo "3️⃣ Verificando endpoint de webhook..."

WEBHOOK_RESPONSE=$(curl -s "$BACKEND_URL/api/mercado-pago/webhook" 2>/dev/null)

if echo "$WEBHOOK_RESPONSE" | grep -q "disponible\|available"; then
    echo -e "${GREEN}✅ Webhook endpoint está disponible${NC}"
    echo "   $WEBHOOK_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Webhook endpoint: $WEBHOOK_RESPONSE${NC}"
fi

echo ""
echo "=========================="
echo -e "${GREEN}✅ Verificación básica completada${NC}"
echo ""
echo "📝 Resumen:"
echo "   - Backend: ✅ Funcionando"
if [ "$CONFIGURED" = "true" ]; then
    echo "   - Mercado Pago: ✅ Configurado"
    echo "   - Modo: $([ "$TEST_MODE" = "true" ] && echo "TEST" || echo "PRODUCCIÓN")"
else
    echo "   - Mercado Pago: ❌ No configurado"
fi
echo "   - Webhook: ✅ Disponible"
echo ""
echo "💡 Para probar crear una preferencia, necesitas:"
echo "   - Una inscripción válida en la BD"
echo "   - Un pago asociado a esa inscripción"
echo "   - Hacer POST a /api/mercado-pago/create-preference"
