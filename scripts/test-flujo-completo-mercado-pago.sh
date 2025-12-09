#!/bin/bash

# ============================================
# Script de Prueba Completa de Mercado Pago
# ============================================
# Prueba todo el flujo: Inscripción → Pago → Preferencia → Checkout

echo "🧪 Prueba Completa del Flujo de Mercado Pago"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"
EMAIL_TEST="jerlibgv@gmail.com"
NOMBRE_TEST="Jerlib"
APELLIDO_TEST="Gonzalez"

# Verificar que el backend esté corriendo
echo "1️⃣ Verificando que el backend esté corriendo..."
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend no está corriendo. Inicia con: cd backend && npm run start:dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend está corriendo${NC}"

echo ""
echo "2️⃣ Verificando configuración de Mercado Pago..."
STATUS=$(curl -s "$BACKEND_URL/api/mercado-pago/status")
CONFIGURED=$(echo "$STATUS" | jq -r '.configured' 2>/dev/null)
TEST_MODE=$(echo "$STATUS" | jq -r '.testMode' 2>/dev/null)

if [ "$CONFIGURED" != "true" ]; then
    echo -e "${RED}❌ Mercado Pago NO está configurado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Mercado Pago está configurado${NC}"
echo -e "   Modo: $([ "$TEST_MODE" = "true" ] && echo "TEST" || echo "PRODUCCIÓN")"

echo ""
echo "3️⃣ Obteniendo una convención activa..."
CONVENCION_DATA=$(curl -s "$BACKEND_URL/api/convenciones?activa=true" | jq -r '.[0]' 2>/dev/null)
CONVENCION_ID=$(echo "$CONVENCION_DATA" | jq -r '.id' 2>/dev/null)
CONVENCION_TITULO=$(echo "$CONVENCION_DATA" | jq -r '.titulo' 2>/dev/null)
COSTO=$(echo "$CONVENCION_DATA" | jq -r '.costo' 2>/dev/null)

if [ -z "$CONVENCION_ID" ] || [ "$CONVENCION_ID" = "null" ]; then
    echo -e "${RED}❌ No se encontró una convención activa${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Convención encontrada:${NC}"
echo "   - ID: $CONVENCION_ID"
echo "   - Título: $CONVENCION_TITULO"
echo "   - Costo: \$$COSTO ARS"

echo ""
echo "4️⃣ Verificando si ya existe una inscripción para $EMAIL_TEST..."
INSCRIPCION_EXISTENTE=$(curl -s "$BACKEND_URL/api/inscripciones/check/$CONVENCION_ID/$EMAIL_TEST" 2>/dev/null)
EXISTE=$(echo "$INSCRIPCION_EXISTENTE" | jq -r '.exists' 2>/dev/null)

if [ "$EXISTE" = "true" ]; then
    echo -e "${YELLOW}⚠️  Ya existe una inscripción para este email${NC}"
    INSCRIPCION_ID=$(echo "$INSCRIPCION_EXISTENTE" | jq -r '.inscripcion.id' 2>/dev/null)
    echo "   Usando inscripción existente: $INSCRIPCION_ID"
else
    echo "   No existe inscripción, creando una nueva..."
    
    echo ""
    echo "5️⃣ Creando nueva inscripción..."
    INSCRIPCION_DATA=$(cat <<EOF
{
  "nombre": "$NOMBRE_TEST",
  "apellido": "$APELLIDO_TEST",
  "email": "$EMAIL_TEST",
  "telefono": "+5491123456789",
  "convencionId": "$CONVENCION_ID",
  "origenRegistro": "dashboard"
}
EOF
)
    
    INSCRIPCION_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/inscripciones" \
      -H "Content-Type: application/json" \
      -d "$INSCRIPCION_DATA")
    
    INSCRIPCION_ID=$(echo "$INSCRIPCION_RESPONSE" | jq -r '.id' 2>/dev/null)
    
    if [ -z "$INSCRIPCION_ID" ] || [ "$INSCRIPCION_ID" = "null" ]; then
        echo -e "${RED}❌ Error al crear la inscripción${NC}"
        echo "$INSCRIPCION_RESPONSE" | jq '.' 2>/dev/null || echo "$INSCRIPCION_RESPONSE"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Inscripción creada: $INSCRIPCION_ID${NC}"
fi

echo ""
echo "6️⃣ Obteniendo información de la inscripción y pagos..."
INSCRIPCION_COMPLETA=$(curl -s "$BACKEND_URL/api/inscripciones/$INSCRIPCION_ID" 2>/dev/null)
PAGO_ID=$(echo "$INSCRIPCION_COMPLETA" | jq -r '.pagos[0].id' 2>/dev/null)
MONTO=$(echo "$INSCRIPCION_COMPLETA" | jq -r '.pagos[0].monto' 2>/dev/null)
NUMERO_CUOTA=$(echo "$INSCRIPCION_COMPLETA" | jq -r '.pagos[0].numeroCuota // 1' 2>/dev/null)
ESTADO_PAGO=$(echo "$INSCRIPCION_COMPLETA" | jq -r '.pagos[0].estado' 2>/dev/null)

if [ -z "$PAGO_ID" ] || [ "$PAGO_ID" = "null" ]; then
    echo -e "${RED}❌ La inscripción no tiene pagos asociados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pago encontrado:${NC}"
echo "   - Pago ID: $PAGO_ID"
echo "   - Monto: \$$MONTO ARS"
echo "   - Cuota: $NUMERO_CUOTA"
echo "   - Estado: $ESTADO_PAGO"

echo ""
echo "7️⃣ Creando preferencia de pago en Mercado Pago..."
PREFERENCE_DATA=$(cat <<EOF
{
  "inscripcionId": "$INSCRIPCION_ID",
  "pagoId": "$PAGO_ID",
  "monto": $MONTO,
  "emailPayer": "$EMAIL_TEST",
  "nombrePayer": "$NOMBRE_TEST",
  "apellidoPayer": "$APELLIDO_TEST",
  "numeroCuota": $NUMERO_CUOTA,
  "descripcion": "Pago de cuota $NUMERO_CUOTA - $CONVENCION_TITULO"
}
EOF
)

echo "   Enviando request a Mercado Pago..."
PREFERENCE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/mercado-pago/create-preference" \
  -H "Content-Type: application/json" \
  -d "$PREFERENCE_DATA")

# Verificar respuesta
if echo "$PREFERENCE_RESPONSE" | grep -q "init_point\|sandbox_init_point"; then
    echo -e "${GREEN}✅ Preferencia creada exitosamente!${NC}"
    
    PREFERENCE_ID=$(echo "$PREFERENCE_RESPONSE" | jq -r '.id' 2>/dev/null)
    CHECKOUT_URL=$(echo "$PREFERENCE_RESPONSE" | jq -r '.sandbox_init_point // .init_point' 2>/dev/null)
    
    echo ""
    echo "📋 Resumen de la Preferencia:"
    echo "   - ID: $PREFERENCE_ID"
    echo "   - Email: $EMAIL_TEST"
    echo "   - Monto: \$$MONTO ARS"
    echo "   - Cuota: $NUMERO_CUOTA"
    
    if [ -n "$CHECKOUT_URL" ] && [ "$CHECKOUT_URL" != "null" ]; then
        echo ""
        echo -e "${BLUE}🔗 URL de Checkout:${NC}"
        echo "$CHECKOUT_URL"
        echo ""
        echo "💡 Próximos pasos:"
        echo "   1. Abre la URL de checkout en tu navegador"
        echo "   2. Completa el pago (en TEST puedes usar tarjetas de prueba)"
        echo "   3. Mercado Pago enviará un webhook a tu backend"
        echo "   4. El backend procesará el pago y actualizará el estado"
        echo "   5. Se enviará un email de confirmación a $EMAIL_TEST"
        echo ""
        echo "🧪 Tarjetas de Prueba (modo TEST):"
        echo "   - Aprobada: 5031 7557 3453 0604"
        echo "   - Rechazada: 5031 4332 1540 6351"
        echo "   - CVV: 123"
        echo "   - Fecha: Cualquier fecha futura"
        echo "   - Nombre: Cualquier nombre"
    fi
else
    echo -e "${RED}❌ Error al crear la preferencia${NC}"
    echo ""
    echo "Respuesta:"
    echo "$PREFERENCE_RESPONSE" | jq '.' 2>/dev/null || echo "$PREFERENCE_RESPONSE"
    exit 1
fi

echo ""
echo "=============================="
echo -e "${GREEN}✅ Flujo completo probado exitosamente${NC}"
echo ""
echo "📝 Resumen:"
echo "   - Backend: ✅ Funcionando"
echo "   - Mercado Pago: ✅ Configurado"
echo "   - Convención: ✅ Encontrada"
echo "   - Inscripción: ✅ $([ "$EXISTE" = "true" ] && echo "Existente" || echo "Creada")"
echo "   - Pago: ✅ Encontrado"
echo "   - Preferencia: ✅ Creada"
echo ""
echo "📧 Email de destino: $EMAIL_TEST"
echo "🔗 URL de Checkout: $CHECKOUT_URL"

