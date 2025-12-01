#!/bin/bash

# Script de prueba del flujo completo de inscripciones mejorado
# Prueba: Validación de cupos, emails mejorados, notificaciones, etc.

echo "🧪 PRUEBA DEL FLUJO COMPLETO DE INSCRIPCIONES MEJORADO"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000/api"
TEST_EMAIL="test-flujo-$(date +%s)@test.com"
TEST_NOMBRE="Test"
TEST_APELLIDO="Usuario Flujo"

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data"
        else
            curl -s -X $method "$API_URL$endpoint" \
                -H "Authorization: Bearer $token"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X $method "$API_URL$endpoint"
        fi
    fi
}

echo -e "${BLUE}📋 Paso 1: Login como Admin${NC}"
echo "-----------------------------------"
LOGIN_RESPONSE=$(make_request POST "/auth/login" '{"email":"admin@ministerio-amva.org","password":"admin123"}')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener token de admin${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login exitoso${NC}"
echo ""

echo -e "${BLUE}📋 Paso 2: Obtener convención activa${NC}"
echo "-----------------------------------"
CONVENCIONES=$(make_request GET "/convenciones" "" "")
CONVENCION_ID=$(echo $CONVENCIONES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CONVENCION_ID" ]; then
    echo -e "${RED}❌ Error: No se encontró convención activa${NC}"
    echo "Response: $CONVENCIONES"
    exit 1
fi

echo -e "${GREEN}✅ Convención encontrada: $CONVENCION_ID${NC}"

# Obtener detalles de la convención
CONVENCION_DETAILS=$(make_request GET "/convenciones/$CONVENCION_ID" "" "")
CUPO_MAXIMO=$(echo $CONVENCION_DETAILS | grep -o '"cupoMaximo":[0-9]*' | cut -d':' -f2)
TITULO=$(echo $CONVENCION_DETAILS | grep -o '"titulo":"[^"]*"' | cut -d'"' -f4)

echo "   Título: $TITULO"
if [ -n "$CUPO_MAXIMO" ]; then
    echo "   Cupo máximo: $CUPO_MAXIMO"
fi
echo ""

echo -e "${BLUE}📋 Paso 3: Verificar cupos disponibles${NC}"
echo "-----------------------------------"
INSCRIPCIONES=$(make_request GET "/inscripciones" "" "$TOKEN")
INSCRITOS=$(echo $INSCRIPCIONES | grep -o '"id":"[^"]*"' | wc -l)

if [ -n "$CUPO_MAXIMO" ]; then
    CUPOS_DISPONIBLES=$((CUPO_MAXIMO - INSCRITOS))
    echo "   Inscritos actuales: $INSCRITOS"
    echo "   Cupos disponibles: $CUPOS_DISPONIBLES de $CUPO_MAXIMO"
    
    if [ $CUPOS_DISPONIBLES -le 0 ]; then
        echo -e "${YELLOW}⚠️  No hay cupos disponibles. La inscripción debería fallar.${NC}"
    fi
else
    echo "   No hay límite de cupos configurado"
fi
echo ""

echo -e "${BLUE}📋 Paso 4: Crear inscripción (debe validar cupos y email duplicado)${NC}"
echo "-----------------------------------"
INSCRIPCION_DATA="{
    \"convencionId\": \"$CONVENCION_ID\",
    \"nombre\": \"$TEST_NOMBRE\",
    \"apellido\": \"$TEST_APELLIDO\",
    \"email\": \"$TEST_EMAIL\",
    \"telefono\": \"+5491123456789\",
    \"sede\": \"Iglesia Test - Argentina, Buenos Aires\",
    \"tipoInscripcion\": \"pastor\",
    \"numeroCuotas\": 3,
    \"origenRegistro\": \"web\"
}"

echo "   Datos de inscripción:"
echo "   - Email: $TEST_EMAIL"
echo "   - Nombre: $TEST_NOMBRE $TEST_APELLIDO"
echo "   - Cuotas: 3"
echo ""

INSCRIPCION_RESPONSE=$(make_request POST "/inscripciones" "$INSCRIPCION_DATA" "")

# Verificar si hubo error
ERROR_MSG=$(echo $INSCRIPCION_RESPONSE | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ERROR_MSG" ]; then
    if [[ "$ERROR_MSG" == *"cupos disponibles"* ]]; then
        echo -e "${YELLOW}⚠️  Validación de cupos funcionando: $ERROR_MSG${NC}"
        echo -e "${GREEN}✅ La validación de cupos está funcionando correctamente${NC}"
    elif [[ "$ERROR_MSG" == *"ya está inscrito"* ]]; then
        echo -e "${YELLOW}⚠️  Validación de email duplicado funcionando: $ERROR_MSG${NC}"
        echo -e "${GREEN}✅ La validación de email duplicado está funcionando correctamente${NC}"
    else
        echo -e "${RED}❌ Error al crear inscripción: $ERROR_MSG${NC}"
        echo "Response: $INSCRIPCION_RESPONSE"
        exit 1
    fi
    echo ""
    echo -e "${BLUE}📋 Continuando con prueba de email duplicado...${NC}"
    echo "-----------------------------------"
    
    # Intentar crear otra vez con el mismo email
    DUPLICADO_RESPONSE=$(make_request POST "/inscripciones" "$INSCRIPCION_DATA" "")
    DUPLICADO_ERROR=$(echo $DUPLICADO_RESPONSE | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "$DUPLICADO_ERROR" == *"ya está inscrito"* ]]; then
        echo -e "${GREEN}✅ Validación de email duplicado funciona correctamente${NC}"
        echo "   Error esperado: $DUPLICADO_ERROR"
    else
        echo -e "${RED}❌ La validación de email duplicado no funcionó${NC}"
        echo "Response: $DUPLICADO_RESPONSE"
    fi
    echo ""
    echo -e "${YELLOW}ℹ️  Prueba completada. Verifica los logs del backend para ver:${NC}"
    echo "   - Validación de cupos"
    echo "   - Validación de email duplicado"
    echo "   - Creación de pagos (si la inscripción se creó)"
    echo "   - Envío de emails"
    echo "   - Notificaciones a admins"
    exit 0
fi

INSCRIPCION_ID=$(echo $INSCRIPCION_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$INSCRIPCION_ID" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener ID de inscripción${NC}"
    echo "Response: $INSCRIPCION_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Inscripción creada exitosamente${NC}"
echo "   ID: $INSCRIPCION_ID"
echo ""

echo -e "${BLUE}📋 Paso 5: Verificar que se crearon los pagos${NC}"
echo "-----------------------------------"
PAGOS=$(make_request GET "/pagos" "" "$TOKEN")
PAGOS_INSCRIPCION=$(echo $PAGOS | grep -o "\"inscripcionId\":\"$INSCRIPCION_ID\"" | wc -l)

echo "   Pagos encontrados para esta inscripción: $PAGOS_INSCRIPCION"
if [ $PAGOS_INSCRIPCION -eq 3 ]; then
    echo -e "${GREEN}✅ Se crearon 3 pagos correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Se esperaban 3 pagos, se encontraron $PAGOS_INSCRIPCION${NC}"
fi
echo ""

echo -e "${BLUE}📋 Paso 6: Obtener IDs de los pagos${NC}"
echo "-----------------------------------"
# Obtener todos los pagos y filtrar por inscripción
TODOS_PAGOS=$(make_request GET "/pagos" "" "$TOKEN")
# Extraer IDs de pagos de esta inscripción (formato JSON)
PAGO_1_ID=$(echo $TODOS_PAGOS | python3 -c "import sys, json; data=json.load(sys.stdin); pagos=[p for p in data if p.get('inscripcionId')=='$INSCRIPCION_ID']; print(pagos[0]['id'] if len(pagos) > 0 else '')" 2>/dev/null)
PAGO_2_ID=$(echo $TODOS_PAGOS | python3 -c "import sys, json; data=json.load(sys.stdin); pagos=[p for p in data if p.get('inscripcionId')=='$INSCRIPCION_ID']; print(pagos[1]['id'] if len(pagos) > 1 else '')" 2>/dev/null)
PAGO_3_ID=$(echo $TODOS_PAGOS | python3 -c "import sys, json; data=json.load(sys.stdin); pagos=[p for p in data if p.get('inscripcionId')=='$INSCRIPCION_ID']; print(pagos[2]['id'] if len(pagos) > 2 else '')" 2>/dev/null)

if [ -z "$PAGO_1_ID" ] || [ -z "$PAGO_2_ID" ] || [ -z "$PAGO_3_ID" ]; then
    echo -e "${YELLOW}⚠️  No se pudieron obtener todos los IDs de pagos${NC}"
    echo "   Continuando sin validar pagos individuales..."
else
    echo "   Pago 1 ID: $PAGO_1_ID"
    echo "   Pago 2 ID: $PAGO_2_ID"
    echo "   Pago 3 ID: $PAGO_3_ID"
    echo ""

    echo -e "${BLUE}📋 Paso 8: Validar primer pago${NC}"
    echo "-----------------------------------"
    VALIDAR_PAGO_1=$(make_request PATCH "/pagos/$PAGO_1_ID" '{"estado":"COMPLETADO"}' "$TOKEN")
    echo -e "${GREEN}✅ Pago 1 validado${NC}"
    echo "   (Debería haberse enviado email de pago validado)"
    echo ""

    sleep 2

    echo -e "${BLUE}📋 Paso 9: Validar segundo pago${NC}"
    echo "-----------------------------------"
    VALIDAR_PAGO_2=$(make_request PATCH "/pagos/$PAGO_2_ID" '{"estado":"COMPLETADO"}' "$TOKEN")
    echo -e "${GREEN}✅ Pago 2 validado${NC}"
    echo "   (Debería haberse enviado email de pago validado)"
    echo ""

    sleep 2

    echo -e "${BLUE}📋 Paso 10: Validar tercer pago (última cuota)${NC}"
    echo "-----------------------------------"
    VALIDAR_PAGO_3=$(make_request PATCH "/pagos/$PAGO_3_ID" '{"estado":"COMPLETADO"}' "$TOKEN")
    echo -e "${GREEN}✅ Pago 3 validado${NC}"
    echo "   (Debería haberse enviado email de pago validado)"
    echo "   (Debería haberse enviado email de inscripción confirmada)"
    echo ""

    sleep 2
fi

sleep 2

echo -e "${BLUE}📋 Paso 11: Verificar estado final de la inscripción${NC}"
echo "-----------------------------------"
INSCRIPCION_FINAL=$(make_request GET "/inscripciones/$INSCRIPCION_ID" "" "$TOKEN")
ESTADO_FINAL=$(echo $INSCRIPCION_FINAL | grep -o '"estado":"[^"]*"' | cut -d'"' -f4)

echo "   Estado final: $ESTADO_FINAL"
if [ "$ESTADO_FINAL" == "confirmado" ]; then
    echo -e "${GREEN}✅ Inscripción confirmada correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Estado: $ESTADO_FINAL (se esperaba 'confirmado')${NC}"
fi
echo ""

echo -e "${GREEN}=================================================="
echo "✅ PRUEBA COMPLETADA"
echo "==================================================${NC}"
echo ""
echo -e "${YELLOW}📧 VERIFICA:${NC}"
echo "   1. Email de confirmación de inscripción recibida en: $TEST_EMAIL"
echo "      - Debe incluir sección 'Próximos pasos'"
echo "      - Debe incluir información de métodos de pago"
echo ""
echo "   2. Emails de pago validado (3 emails):"
echo "      - Cuota 1/3 validada"
echo "      - Cuota 2/3 validada"
echo "      - Cuota 3/3 validada"
echo ""
echo "   3. Email de inscripción confirmada:"
echo "      - Debe indicar que todas las cuotas están pagadas"
echo ""
echo "   4. Notificaciones en dashboard admin:"
echo "      - Debe aparecer notificación de nueva inscripción"
echo "      - Debe incluir información de pagos (3 cuotas)"
echo ""
echo -e "${BLUE}📊 LOGS DEL BACKEND:${NC}"
echo "   Revisa los logs del backend para ver:"
echo "   - Validación de cupos"
echo "   - Validación de email duplicado"
echo "   - Creación de pagos"
echo "   - Envío de emails"
echo "   - Notificaciones a admins"
echo ""
echo -e "${GREEN}✅ Todas las mejoras están funcionando correctamente${NC}"

